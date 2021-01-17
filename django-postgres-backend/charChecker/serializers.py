from rest_framework import serializers
from .models import Glyph, OS, Font, UnicodeBlock, Sequence
from django.forms.models import model_to_dict


class GlyphSerializer(serializers.ModelSerializer):
    categoryT = serializers.CharField(source='getCategory')
    codePlaneT = serializers.CharField(source='getCodePlane')
    surrogates = serializers.SerializerMethodField()
    supportPercent = serializers.SerializerMethodField()
    hasColorEmoji = serializers.SerializerMethodField()
    #decompList = serializers.SerializerMethodField()

    def get_supportPercent(self, obj):
        return self.context.get("supportPercent")

    def get_surrogates(self, obj):
        return obj.getSurrogates() if obj.codePoint > 65535 else None

    # NOTE: CHANGED BELOW IN CUSTOM SERIALIZER
    def get_hasColorEmoji(self, obj):
        return Font.objects.filter(name__icontains="Color Emoji",
                                   glyphs__in=[obj]).exists() if obj.isEmoji else None

    class Meta:
        model = Glyph
        fields = ['officialName', 'codePoint', 'abbreviation', 'category',
                  'categoryT', 'codePlane', 'codePlaneT', 'decomposition', 'definition',
                  'isEmoji', 'japKun', 'japOn', 'supportPercent', 'isNonCharacter',
                  'unicodeBlock', 'minUnicodeVersion', 'cantonese',
                  'mandarin', 'bitmap', 'surrogates', 'hasColorEmoji']
        depth = 1
        read_only_fields = fields


def CustomGlyphSerializer(glyphOrGlyphs, supportPercent, many=False):
    if not many:
        glyphOrGlyphs = [glyphOrGlyphs]
    results = []
    for glyph in glyphOrGlyphs:
        glyphDict = model_to_dict(glyph, fields=['officialName', 'codePoint',
                                                 'abbreviation', 'category', 'isNonCharacter',
                                                 'codePlane', 'decomposition', 'definition',
                                                 'isEmoji', 'japKun', 'japOn', 'cantonese', 'mandarin'])

        glyphDict['categoryT'] = glyph.getCategory()
        glyphDict['codePlaneT'] = glyph.getCodePlane()
        glyphDict['surrogates'] = glyph.getSurrogates() \
            if glyph.codePoint > 65535 else None
        glyphDict['supportPercent'] = supportPercent
        glyphDict['bitmap'] = glyph.bitmap.url if glyph.bitmap else None
        if glyph.minUnicodeVersion:
            glyphDict['minUnicodeVersion'] = model_to_dict(glyph.minUnicodeVersion,
                                                           fields=['number', 'releaseDate'])
        if glyph.unicodeBlock:
            glyphDict['unicodeBlock'] = model_to_dict(glyph.unicodeBlock,
                                                      fields=['slug', 'name'])
        glyphDict['hasBwEmoji'] = glyph.hasBwEmojiVariant()
        glyphDict['variants'] = glyph.variantVers.values('codePoint', 'name')
        glyphDict['variants'] = filter(lambda g: g['codePoint'] not in [0xfe0f, 0xfe0e],
                                       glyphDict['variants']) if (glyphDict['variants'] and glyphDict['variants'][0]['codePoint']) else None

        # Font.objects.filter(name__icontains="Color Emoji", glyphs__in=[glyph]).exists() if glyph.isEmoji else None
        if not many:
            return glyphDict
        results += [glyphDict]
    return results


class SimpleGlyphSerializer(serializers.ModelSerializer):
    supportPercent = serializers.SerializerMethodField()

    def get_supportPercent(self, obj):
        return obj.cachedSupportPercent or None  # obj.supportPercentOS()

    class Meta:
        model = Glyph
        fields = ['officialName', 'codePoint', 'supportPercent', 'unicodeBlock',
                  'bitmap', 'slug']
        read_only_fields = fields


class OSSerializer(serializers.ModelSerializer):
    class Meta:
        model = OS
        depth = 1  # changed from 2
        fields = ['id', 'family', 'version', 'codeName', 'fontListSource',
                  'releaseDate', 'maxUnicodeVersion', 'slug', 'displayName']
        read_only_fields = fields


class FontSerializer(serializers.ModelSerializer):
    class Meta:
        model = Font
        fields = ['name', 'style']
        read_only_fields = fields


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnicodeBlock
        fields = '__all__'
        read_only_fields = fields


class SequenceSerializer(serializers.ModelSerializer):
    sequenceString = serializers.CharField(source='sequence')
    supportPercent = serializers.CharField(source='supportPercentOS')

    # Override full serializer
    glyphs = serializers.SerializerMethodField()

    def get_glyphs(self, instance):
        return instance.glyphs.values('officialName', 'codePoint')
    minUnicodeVersion = serializers.SerializerMethodField()

    def get_minUnicodeVersion(self, instance):
        if instance.minUnicodeVersion:
            return model_to_dict(instance.minUnicodeVersion,
                                 fields=['number', 'releaseDate'])
        return None
    variants = serializers.SerializerMethodField()

    def get_variants(self, instance):
        return instance.variantVers.values('officialName', 'cpList')

    supportPercent = serializers.SerializerMethodField()

    def get_supportPercent(self, obj):
        return self.context.get("supportPercent")

    class Meta:
        model = Sequence
        fields = ['id', 'officialName', 'sequenceString', 'cpList', 'glyphs',
                  'isEmoji', 'isProvisional', 'supportPercent', 'minUnicodeVersion',
                  'variants']
        read_only_fields = fields
