from .models import Glyph, OS, Font, UnicodeBlock, Sequence
from .serializers import GlyphSerializer, SequenceSerializer, OSSerializer, FontSerializer, BlockSerializer, SimpleGlyphSerializer
from rest_framework import generics
from rest_framework.response import Response
from .usageStats import usageStats
from django.db.models import Q
import re

excludeList = ["Bld", "Blk", "Thin", "Condensed", "ExtCond", "ExtBd", "SemBd", "Light", "SemCond", "SmBd", "XCn", "ExtLt", "XBd", "SmCn", "Cn", "Bk", "Md", "Cond", "Lt", "Black", "Bold", "Mono", "Medium"]

class GetGlyph(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        isFake = False

        if kwargs.get("searchTerm", ""):
            glyphObjs = Glyph.objects.filter(officialName__icontains=kwargs["searchTerm"])
            glyphObj = glyphObjs[0] if glyphObjs.count() else None
        else:
            try:
                glyphObj = Glyph.objects.get(codePoint=int(kwargs["slug"], base=16))
            except (Glyph.DoesNotExist, KeyError):
                glyphObj = None
        if not glyphObj and kwargs.get("slug", ""):
            cp = int(kwargs["slug"], base=16)
            validBlocks = UnicodeBlock.objects.filter(start__lte=cp, end__gte=cp)
            if validBlocks.exists():
                glyphObj = Glyph(
                    officialName="Unassigned",
                    codePoint=cp,
                    codePlane=(cp // 65535),
                    unicodeBlock=validBlocks[0],
                    slug=kwargs["slug"]
                )
                isFake = True
        decompGlyphObjList = []
        if glyphObj and not isFake and glyphObj.decomposition:
            decompList = re.sub(r"<\w+>","", glyphObj.decomposition).strip().split(" ")
            for decompGlyph in decompList:
                decompGlyphObjList += [Glyph.objects.get(pk=int(decompGlyph, 16))]
        noto = None
        oses = OS.objects.filter(font__glyphs__in=[glyphObj]).distinct() if (glyphObj and not isFake) else None
        supportPercent = glyphObj.supportPercentOS(oses) if glyphObj else 0
        if glyphObj and not isFake and supportPercent < 97:
            fontFilter = Q(glyphs__in=[glyphObj], name__icontains="Noto")
            for exclusion in excludeList:
                fontFilter &= ~Q(name__icontains=exclusion)
            noto = Font.objects.filter(fontFilter)
            noto = noto[0] if noto.exists() else None
        gSerializer = GlyphSerializer(glyphObj, context={"supportPercent": supportPercent, "decompList": decompGlyphObjList})
        osSerializer = OSSerializer(oses, many=True) if oses else None
        notoSerializer = FontSerializer(noto) if noto else None
        decompSerializer = GlyphSerializer(decompGlyphObjList, many=True) if len(decompGlyphObjList) > 0 else None
        return Response({
            "glyph": gSerializer.data, 
            "decomp": decompSerializer.data if decompSerializer else None,
            "oses": osSerializer.data if osSerializer else None,
            "noto": notoSerializer.data if notoSerializer else None
        })
    #queryset = Glyph.objects.get(codePoint=30)
    #lookup_field = 'codePoint'
    #serializer_class = GlyphSerializer
    
class GetOSFontWithGlyph(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        fontObjs = Font.objects.filter(incWithOS__in=[kwargs["os"]],
            glyphs__in=[kwargs["glyph"]]).distinct("name")

        fSerializer = FontSerializer(fontObjs, many=True) # changed from fontObjs[:10]
        return Response({
            "fonts": fSerializer.data,
            "fontCount": fontObjs.count()
        })

class GetFontWithGlyph(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        glyphPk = None
        if kwargs.get("slug",""):
            glyphPk = int(kwargs["slug"], base=16)
        else:
            glyphPk = kwargs["glyph"]
        if kwargs.get("name", ""):
            fontObjs = Font.objects.filter(name__icontains=kwargs["name"],
                glyphs__in=[glyphPk]).distinct("name") # [:10]
        else:
            fontObjs = Font.objects.filter(glyphs__in=[glyphPk]).distinct("name") # [:10]

        fSerializer = FontSerializer(fontObjs, many=True)
        return Response({
            "fonts": fSerializer.data
        })   

class GetWholeBlock(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        blockSlug = kwargs.get("blockSlug","")

        try:
            block = UnicodeBlock.objects.get(slug=blockSlug)
        except UnicodeBlock.DoesNotExist:
            block = None

        glyphs = Glyph.objects.filter(unicodeBlock=block)[:500] if block else None

        bSerializer = BlockSerializer(block) if block else None
        gSerializer = SimpleGlyphSerializer(glyphs, many=True) if glyphs else None

        return Response({
            "block": bSerializer.data,
            "glyphs": gSerializer.data
        })

class GetSequence(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        sequencePoints = kwargs.get("sequencePoints")
        cpList = [int(a, base=16) for a in sequencePoints.split("-")]

        try:
            sequence = Sequence.objects.get(cpList=cpList)
        except Sequence.DoesNotExist:
            sequence = None

        noto = None
        oses = OS.objects.filter(font__sequences__in=[sequence]).distinct() if sequence else None
        supportPercent = sequence.supportPercentOS(oses) if sequence else 0
        if sequence and supportPercent < 97:
            fontFilter = Q(sequences__in=[sequence], name__icontains="Noto")
            for exclusion in excludeList:
                fontFilter &= ~Q(name__icontains=exclusion)
            noto = Font.objects.filter(fontFilter)
            noto = noto[0] if noto.exists() else None

        sSerializer = SequenceSerializer(sequence) if sequence else None
        osSerializer = OSSerializer(oses, many=True) if oses else None
        notoSerializer = FontSerializer(noto) if noto else None

        return Response({
            "sequence": sSerializer.data if sSerializer else None,
            "oses": osSerializer.data if osSerializer else None,
            "noto": notoSerializer.data if notoSerializer else None
        })

class GetOSFontWithSequence(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        fontObjs = Font.objects.filter(incWithOS__in=[kwargs["os"]],
            sequences__in=[kwargs["sequencepk"]]).distinct("name")

        fSerializer = FontSerializer(fontObjs, many=True) # changed from fontObjs[:10]
        return Response({
            "fonts": fSerializer.data,
            "fontCount": fontObjs.count()
        })