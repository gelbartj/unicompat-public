from .models import Glyph, OS, Font, UnicodeBlock, Sequence, extSupportPercentOS,\
    extDisplayName
from .serializers import GlyphSerializer, CustomGlyphSerializer, SequenceSerializer, OSSerializer, FontSerializer, BlockSerializer, SimpleGlyphSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .usageStats import usageStats
from django.db.models import Q
import re
from django.db.models.functions import Coalesce
from django.forms.models import model_to_dict
from .globals import ErrorCodes
from .cachedBlocks import cachedBlocks
from itertools import chain

excludeList = ["Bld", "Blk", "Thin", "Condensed", "ExtCond", "ExtBd", "SemBd",
               "Light", "SemCond", "SmBd", "XCn", "ExtLt", "XBd", "SmCn", "Cn", "Bk", "Md",
               "Cond", "Lt", "Black", "Bold", "Mono", "Medium"]

class CustomPagination(PageNumberPagination):
    page_size = 20

class GetLuckySearchResults(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        searchTerm = kwargs["searchTerm"]
        if searchTerm.upper() in cachedBlocks.keys():
            return Response({
                'redirect': '/block/' + cachedBlocks[searchTerm.upper()]['slug'] +\
                    "?search=" + searchTerm
            })

        glyphObj = Glyph.objects.filter(
            officialName__icontains=searchTerm).first()
        if glyphObj:
            return GetGlyph.as_view()(request=request._request,
                                      glyphObj=glyphObj, searchTerm=searchTerm)

        seqObj = Sequence.objects.filter(
            officialName__icontains=searchTerm).first()
        if seqObj:
            return GetSequence.as_view()(request=request._request,
                                         seqObj=seqObj, searchTerm=searchTerm)

        return Response({
            "status": ErrorCodes.get("noSearchResults")
        })

class GetSearchResults(generics.ListAPIView):
    """ Standardized search result format:
        label (string)
        name
        link
        image?
    """
    pagination_class = CustomPagination

    def get_queryset(self):
        searchTerm = self.kwargs["searchTerm"]
        blocks = UnicodeBlock.objects.filter(
            name__icontains=searchTerm).values('name', 'start', 'slug')
        glyphs = Glyph.objects.filter(officialName__icontains=searchTerm).values('officialName',
            'codePoint')[:]
        sequences = Sequence.objects.filter(officialName__icontains=searchTerm).values('officialName',
            'cpList')
        return chain(blocks, glyphs, sequences)

    def list(self, request, *args, **kwargs):
        
        if not self.get_queryset():
            return Response({
                "status": ErrorCodes.get("noSearchResults")
            })

        paginated = self.paginate_queryset(list(self.get_queryset()))

        return self.get_paginated_response(paginated)

class GetGlyph(generics.RetrieveAPIView):
    def retrieve(self, request, *args, **kwargs):
        isFake = False
        glyphObj = kwargs.get("glyphObj", None)
        if not glyphObj:
            try:
                glyphObj = Glyph.objects.get(
                    codePoint=int(kwargs["slug"], base=16))
            except Glyph.DoesNotExist:
                # glyphObj was already None
                pass

        if not glyphObj and kwargs.get("slug", ""):
            cp = int(kwargs["slug"], base=16)
            validBlocks = UnicodeBlock.objects.filter(
                start__lte=cp, end__gte=cp)
            if validBlocks.exists():
                glyphObj = Glyph(
                    officialName="Unassigned",
                    codePoint=cp,
                    codePlane=(cp // 65536),
                    unicodeBlock=validBlocks[0],
                    slug=kwargs["slug"],
                )
                isFake = True
            else:
                # Invalid code point
                return Response({
                    "status": ErrorCodes.get("invalidCodePoint")
                })

        decompGlyphObjList = []
        if glyphObj and not isFake and glyphObj.decomposition:
            decompList = re.sub(
                r"<\w+>", "", glyphObj.decomposition).strip().split(" ")
            decompFilter = Q(pk=int(decompList[0], 16))
            for decompGlyph in decompList[1:]:
                # WARNING: May not be in correct order
                decompFilter |= Q(pk=int(decompGlyph, 16))
            decompGlyphObjList = Glyph.objects.filter(decompFilter).values('officialName',
                                                                           'codePoint')

        noto = None
        oses = OS.objects.filter(font__glyphs__in=[glyphObj]).distinct() if (
            glyphObj and not isFake) else None
        supportPercent = glyphObj.supportPercentOS(oses) if glyphObj else 0

        if glyphObj and not isFake and supportPercent < 97:
            fontFilter = Q(glyphs__in=[glyphObj], name__icontains="Noto")
            for exclusion in excludeList:
                fontFilter &= ~Q(name__icontains=exclusion)
            noto = Font.objects.filter(fontFilter).values('name', 'style')
            noto = noto[0] if noto.exists() else None

        # gSerializer = GlyphSerializer(glyphObj, context={"supportPercent": supportPercent, "decompList": decompGlyphObjList})

        if isFake:
            glyphDict = model_to_dict(glyphObj)
            glyphDict['bitmap'] = None
            glyphDict['svg'] = None
            glyphDict['unicodeBlock'] = model_to_dict(glyphObj.unicodeBlock, fields=['name', 'slug'])
        else:
            glyphDict = CustomGlyphSerializer(glyphObj, supportPercent)
        osesDict = oses.values('id', 'family', 'version', 'codeName', 'fontListSource',
                               'releaseDate', 'slug', 'maxUnicodeVersion__number') if oses else None  # OSSerializer(oses, many=True) if oses else None
        if osesDict:
            for osObj in osesDict:
                osObj['displayName'] = extDisplayName(osObj['family'],
                                                      osObj['version'], osObj['codeName'])

        return Response({
            "glyph": glyphDict,
            "decomp": decompGlyphObjList,
            "oses": osesDict,
            "noto": noto,
            "searchTerm": kwargs.get('searchTerm', "")
        })

    #queryset = Glyph.objects.get(codePoint=30)
    #lookup_field = 'codePoint'
    #serializer_class = GlyphSerializer


class GetOSFontWithGlyph(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        fontObjs = Font.objects.filter(incWithOS__in=[kwargs["os"]],
                                       glyphs__in=[kwargs["glyph"]]).distinct("name")

        # changed from fontObjs[:10]
        fSerializer = FontSerializer(fontObjs, many=True)
        return Response({
            "fonts": fSerializer.data,
            "fontCount": fontObjs.count()
        })


class GetFontWithGlyph(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        glyphPk = None
        if kwargs.get("slug", ""):
            glyphPk = int(kwargs["slug"], base=16)
        else:
            glyphPk = kwargs["glyph"]
        if kwargs.get("name", ""):
            fontObjs = Font.objects.filter(name__icontains=kwargs["name"],
                                           glyphs__in=[glyphPk]).distinct("name")  # [:10]
        else:
            fontObjs = Font.objects.filter(
                glyphs__in=[glyphPk]).distinct("name")  # [:10]

        fSerializer = FontSerializer(fontObjs, many=True)
        return Response({
            "fonts": fSerializer.data
        })


class GetWholeBlock(generics.ListAPIView):
    def get_queryset(self):
        blockSlug = self.kwargs.get("blockSlug", "")

        return Glyph.objects.filter(unicodeBlock__slug=blockSlug).values(
                'officialName', 'codePoint', 'slug', 'cachedSupportPercent',
                'bitmap')

    def list(self, request, *args, **kwargs):
        blockSlug = self.kwargs.get("blockSlug", "")
        try:
            block = UnicodeBlock.objects.get(slug=blockSlug)
        except UnicodeBlock.DoesNotExist:
            block = None

        # Number of results limited to 500 in global pagination settings
        glyphs = self.paginate_queryset(self.get_queryset())

        # bSerializer = BlockSerializer(block) if block else None
        # gSerializer = SimpleGlyphSerializer(glyphs, many=True) if glyphs else None

        return self.get_paginated_response({
            "block": model_to_dict(block) if block else None,  # bSerializer.data,
            "glyphs": glyphs  # gSerializer.data
        })


class GetSequence(generics.RetrieveAPIView):
    def retrieve(self, request, *args, **kwargs):
        sequence = kwargs.get("seqObj", None)
        sequenceSet = None

        if not sequence:
            sequencePoints = kwargs.get("sequencePoints")
            cpList = [int(a, base=16) for a in sequencePoints.split("-")]
            try:
                sequence = Sequence.objects.get(cpList=cpList)
            except Sequence.DoesNotExist:
                return Response({
                    "status": ErrorCodes.get("invalidCodePoint")
                })
            except Sequence.MultipleObjectsReturned:
                # This can happen when there is both an emoji and non-emoji encoding for
                # the same code points. Should be fixed in DB now but keeping this code
                # just in case.
                sequenceSet = Sequence.objects.filter(cpList=cpList)
                sequence = sequenceSet[0]  # Completely arbitrary

        noto = None
        if sequenceSet:
            oses = OS.objects.filter(
                font__sequences__in=sequenceSet).distinct()
        else:
            oses = OS.objects.filter(font__sequences__in=[
                                     sequence]).distinct() if sequence else None
        supportPercent = sequence.supportPercentOS(oses) if sequence else 0
        if sequence and supportPercent < 97:
            fontFilter = Q(sequences__in=[sequence], name__icontains="Noto")
            for exclusion in excludeList:
                fontFilter &= ~Q(name__icontains=exclusion)
            noto = Font.objects.filter(fontFilter).values('name', 'style')
            noto = noto[0] if noto.exists() else None

        sSerializer = SequenceSerializer(
            sequence, context={"supportPercent": supportPercent}) if sequence else None
        # osSerializer = OSSerializer(oses, many=True) if oses else None
        osesDict = oses.values('id', 'family', 'version', 'codeName', 'fontListSource',
                               'releaseDate', 'slug', 'maxUnicodeVersion__number') if oses else None
        if osesDict:
            for osObj in osesDict:
                osObj['displayName'] = extDisplayName(osObj['family'],
                                                      osObj['version'], osObj['codeName'])
        notoSerializer = FontSerializer(noto) if noto else None

        return Response({
            "sequence": sSerializer.data if sSerializer else None,
            "oses": osesDict,  # osSerializer.data,
            "noto": noto,  # notoSerializer.data if notoSerializer else None
            "searchTerm": kwargs.get('searchTerm', "")
        })


class GetOSFontWithSequence(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        fontObjs = Font.objects.filter(incWithOS__in=[kwargs["os"]],
                                       sequences__in=[kwargs["sequencepk"]]).distinct("name")

        # changed from fontObjs[:10]
        fSerializer = FontSerializer(fontObjs, many=True)
        return Response({
            "fonts": fSerializer.data,
            "fontCount": fontObjs.count()
        })
