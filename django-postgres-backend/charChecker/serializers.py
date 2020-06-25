from rest_framework import serializers
from .models import Glyph, OS, Font, UnicodeBlock, Sequence

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

    def get_hasColorEmoji(self, obj):
        return Font.objects.filter(name__icontains="Color Emoji", glyphs__in=[obj]).exists() if obj.isEmoji else None

    class Meta:
        model = Glyph
        fields = ['officialName', 'codePoint', 'abbreviation', 'category', 'categoryT', 'codePlane', 'codePlaneT',
            'decomposition', 'definition', 'isEmoji', 'japKun', 'japOn', 'supportPercent', 'unicodeBlock',
            'minUnicodeVersion', 'cantonese', 'mandarin', 'bitmap', 'surrogates', 'hasColorEmoji']
        depth = 1

class SimpleGlyphSerializer(serializers.ModelSerializer):
    supportPercent = supportPercent = serializers.SerializerMethodField()
    
    def get_supportPercent(self, obj):
        return obj.cachedSupportPercent or obj.supportPercentOS()

    class Meta:
        model = Glyph
        fields = ['officialName', 'codePoint', 'supportPercent', 'unicodeBlock',
            'bitmap', 'slug']

class OSSerializer(serializers.ModelSerializer):
    class Meta:
        model = OS
        depth = 2
        fields = ['id', 'family', 'version', 'codeName', 'fontListSource',
            'releaseDate', 'maxUnicodeVersion', 'slug', 'displayName']

class FontSerializer(serializers.ModelSerializer):
    class Meta:
        model = Font
        fields = ['name', 'style']

class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnicodeBlock
        fields = '__all__'

class SequenceSerializer(serializers.ModelSerializer):
    sequenceString = serializers.CharField(source='sequence')
    supportPercent = serializers.CharField(source='supportPercentOS')

    class Meta:
        model = Sequence
        depth = 1
        fields = ['id', 'officialName', 'sequenceString', 'cpList', 'glyphs', 'isEmoji', 'isProvisional', 'supportPercent']