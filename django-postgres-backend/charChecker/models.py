from django.db import models
from .usageStats import usageStats
from django.contrib.postgres.fields import ArrayField

class UnicodeVersion(models.Model):
    number = models.CharField(max_length=64, unique=True) # easier to use char here than DecimalField
    releaseDate = models.DateField(blank=True, null=True)
    numChars = models.PositiveIntegerField(blank=True, null=True)
    slug = models.CharField(unique=True, default='', max_length=64)

    def __str__(self):
        return '%s' % self.number

class Software(models.Model):
    # e.g. MS Office, that includes many fonts
    # Adobe products, too
    name = models.CharField(max_length=64)
    version = models.CharField(max_length=64, blank=True, default='')
    unicodeVersion = models.ForeignKey(UnicodeVersion, blank=True, null=True, on_delete=models.SET_NULL)
    slug = models.CharField(unique=True, default='', max_length=64)

    def __str__(self):
        return '%s' % self.name

class UnicodeBlock(models.Model):
    name = models.CharField(max_length=64)
    start = models.PositiveIntegerField(blank=True)
    end = models.PositiveIntegerField(blank=True)
    numChars = models.PositiveIntegerField(blank=True, null=True)
    minUnicodeVersion = models.ForeignKey(UnicodeVersion, blank=True, null=True, on_delete=models.SET_NULL)
    slug = models.CharField(unique=True, default='', max_length=64)

    def __str__(self):
        return '%s' % self.name

    class Meta:
        unique_together = ('start', 'end')

class OS(models.Model):

    OS_OPTIONS = [
    ("android", "Android"),
    ("applebooks", "Apple Books"),
    ("chromeos", "Chrome OS"),
    ("ios", "iOS"),
    ("ipados", "iPad OS"),
    ("kindle", "Kindle"),
    ("mac", "macOS"),
    ("windows", "Windows"),
    ("ubuntu", "Ubuntu"),
    ("watchos", "watchOS"),
    ("tvos", "tvOS")
    ]

    family = models.CharField(max_length=64, choices=OS_OPTIONS)
    version = models.CharField(max_length=64, blank=True, default='')
    codeName = models.CharField(max_length=64, blank=True, default='')
    customVersion = models.CharField(max_length=64, blank=True, default='') #e.g. only Ericsson Android phones
    basedOnIos = models.ForeignKey("self", blank=True, null=True, on_delete=models.SET_NULL)
    fontListSource = models.CharField(max_length=255, blank=True, default='')
    maxUnicodeVersion = models.ForeignKey(UnicodeVersion, blank=True, null=True, on_delete=models.SET_NULL)
    releaseDate = models.DateField(blank=True, null=True)
    rtlSupport = models.NullBooleanField(blank=True, null=True)
    complexScriptSupport = models.NullBooleanField(blank=True, null=True)
    latinCombiningSupport = models.NullBooleanField(blank=True, null=True)
    slug = models.CharField(unique=True, default='', max_length=64)

    def __str__(self):
        displayName = ""
        for option in self.OS_OPTIONS:
            if option[0] == self.family:
                displayName = option[1]
        return f'{displayName} {self.version}' + (f' \"{self.codeName}\"' if self.codeName else "")
    
    class Meta:
        unique_together = ('family', 'version')
        verbose_name_plural = "OSes"
        verbose_name = "OS"

    def displayName(self):
        return str(self)

class Browser(models.Model):

    BROWSER_OPTIONS = [
    ("chrome", "Chrome"),
    ("edge", "Edge"),
    ("safari", "Safari"),
    ("firefox,", "Firefox"),
    ("ie", "IE"),
    ("opera", "Opera")
    ]

    family = models.CharField(max_length=64, choices=BROWSER_OPTIONS)
    version = models.CharField(max_length=64, blank=True, default='')
    osCombo = models.ManyToManyField(OS, blank=True)
    maxUnicodeVersion = models.ForeignKey(UnicodeVersion, blank=True, null=True, on_delete=models.SET_NULL)
    rtlSupport = models.NullBooleanField(blank=True)
    complexScriptSupport = models.NullBooleanField(blank=True)
    latinCombiningSupport = models.NullBooleanField(blank=True)
    slug = models.CharField(unique=True, default='', max_length=64)

    def __str__(self):
        return '%s' % self.family


class Variant(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    codePoint = models.IntegerField()
    # extraCodePoint = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"U+{hex(self.codePoint)[2:].upper()}: {self.name}"


class Glyph(models.Model):
    UNI_PLANES = (
        (0, 'Basic Multilingual Plane'),
        (1, 'Supplementary Multilingual Plane'),
        (2, 'Supplementary Ideographic Plane'),
        (3, 'Tertiary Ideographic Plane'),
        (14, 'Supplementary Special-Purpose Plane'),
        (15, 'Supplementary Private Use Area Plane A'),
        (16, 'Supplementary Private Use Area Plane B')
    )

    CATS = (
        ('L', 'LETTER'),
        ('Ll', 'Lowercase letter'),
        ('Lm', 'Letter modifier'),
        ('Lt', 'Title-case letter'),
        ('Lu', 'Uppercase letter'),
        ('Lo', 'Other letter'),
        ('M', 'MARK'),
        ('Mc', 'Combining space'),
        ('Me', 'Enclosing mark'),
        ('Mn', 'Non-spacing mark'),
        ('N', 'NUMBER'),
        ('Nd', 'Decimal digit'),
        ('Nl', 'Number letter'),
        ('No', 'Other number'),
        ('P', 'PUNCTUATION'),
        ('Pc', 'Connector punctuation'),
        ('Pd', 'Dash'),
        ('Pi', 'Initial quote'),
        ('Pf', 'Final quote'),
        ('Ps', 'Open punctuation'),
        ('Pe', 'Close punctuation'),
        ('Po', 'Other punctuation'),
        ('S', 'SYMBOL'),
        ('Sc', 'Currency symbol'),
        ('Sk', 'Modifier symbol'),
        ('Sm', 'Math symbol'),
        ('So', 'Other symbol'),
        ('Z', 'SEPARATOR'),
        ('Zl', 'Line separator'),
        ('Zp', 'Paragraph separator'),
        ('Zs', 'Space separator'),
        ('C', 'OTHER'),
        ('Cc', 'Control character'),
        ('Cf', 'Format character'),
        ('Cn', 'Not assigned'),
        ('Co', 'Private use'),
        ('Cs', 'Surrogate')
    )

    COMBINING_CLASSES = (
        (0, "Spacing, split, enclosing, reordrant, and Tibetan subjoined"),
        (1, "Overlays and interior"),
        (7, "Nuktas"),
        (8, "Hiragana/Katakana voicing marks"),
        (9, "Viramas"),
        (10, "Start of fixed position classes"),
        (199, "End of fixed position classes"),
        (200, "Below left attached"),
        (202, "Below attached"),
        (204, "Below right attached"),
        (208, "Left attached (reordrant around single base character)"),
        (210, "Right attached"),
        (212, "Above left attached"),
        (214, "Above attached"),
        (216, "Above right attached"),
        (218, "Below left"),
        (220, "Below"),
        (222, "Below right"),
        (224, "Left (reordrant around single base character)"),
        (226, "Right"),
        (228, "Above left"),
        (230, "Above"),
        (232, "Above right"),
        (233, "Double below"),
        (234, "Double above"),
        (240, "Below (iota subscript)")
    )
    officialName = models.CharField(max_length=100, blank=True)
    codePoint = models.PositiveIntegerField(blank=True, unique=True, primary_key=True)
    codePlane = models.PositiveSmallIntegerField(choices=UNI_PLANES, default=0)
    category = models.CharField(choices=CATS, max_length=64, blank=True)
    joiningGroup = models.CharField(max_length=64, blank=True)
    minUnicodeVersion = models.ForeignKey(UnicodeVersion, blank=True, null=True, on_delete=models.SET_NULL)
    unicodeBlock = models.ForeignKey(UnicodeBlock, blank=True, null=True, on_delete=models.SET_NULL)
    bitmap = models.ImageField(upload_to="bitmaps", blank=True)
    svg = models.FileField(blank=True)
    variantVers = models.ManyToManyField(Variant, blank=True)
    abbreviation = models.CharField(max_length=10, blank=True)
    combiningClass = models.PositiveSmallIntegerField(blank=True, null=True, choices=COMBINING_CLASSES)
    definition = models.CharField(max_length=500, blank=True)
    mandarin = models.CharField(max_length=200, blank=True)
    cantonese = models.CharField(max_length=200, blank=True)
    japKun = models.CharField(max_length=200, blank=True)
    japOn = models.CharField(max_length=200, blank=True)
    isEmoji = models.NullBooleanField(default=False)
    isNonCharacter = models.NullBooleanField(default=False)
    isReserved = models.NullBooleanField(default=False)
    decomposition = models.CharField(max_length=200, blank=True, null=True)
    slug = models.CharField(unique=True, default='', max_length=64)
    cachedSupportPercent = models.FloatField(blank=True, null=True, default=0.0)

    def __str__(self):
        return 'U+%04X (%c) %s' % (self.codePoint, chr(self.codePoint), self.officialName)

    def getSurrogates(self):
        C =  self.codePoint
        H = ((C - 0x10000) // 0x400) + 0xD800
        L = (C - 0x10000) % 0x400 + 0xDC00
        return [hex(H)[2:], hex(L)[2:]]
    
    def getSurrogatesStr(self):
        return ", ".join(self.getSurrogates())
    
    def getCategory(self):
        for cat in self.CATS:
            if cat[0] == self.category:
                return cat[1]
        return None
    
    def getCodePlane(self):
        for cat in self.UNI_PLANES:
            if cat[0] == self.codePlane:
                return cat[1]
        return None
    
    def supportPercentOS(self, osQS=None):
        totalPercent = 0
        osQS = osQS or OS.objects.filter(font__glyphs__in=[self]).distinct()
        if not osQS:
            return 0;
        for osObj in osQS:
            familyPercent = usageStats[osObj.family]["t"]
            versionPercent = usageStats[osObj.family].get(osObj.version, 0)
            totalPercent += familyPercent * versionPercent
        return totalPercent * 100
    
    def hasBwEmojiVariant(self):
        return self.variants.filter(pk=0xfe0e).exists()
    
    def hasColorEmojiVariant(self):
        return self.variants.filter(pk=0xfe0f).exists()


class Sequence(models.Model):
    officialName = models.CharField(max_length=100, blank=True, null=True)
    cpList = ArrayField(models.PositiveIntegerField())
    glyphs = models.ManyToManyField(Glyph)
    minUnicodeVersion = models.ForeignKey(UnicodeVersion, blank=True, null=True, on_delete=models.SET_NULL)
    isEmoji = models.NullBooleanField(default=False)
    isProvisional = models.NullBooleanField(default=False)

    def sequence(self):
        return ''.join(chr(a) for a in self.cpList)
    
    def __str__(self):
        return f"{self.officialName}: {self.sequence()}"

    def supportPercentOS(self, osQS=None):
        totalPercent = 0
        osQS = osQS or OS.objects.filter(font__sequences__in=[self]).distinct()
        if not osQS:
            return 0;
        for osObj in osQS:
            familyPercent = usageStats[osObj.family]["t"]
            versionPercent = usageStats[osObj.family].get(osObj.version, 0)
            totalPercent += familyPercent * versionPercent
        return totalPercent * 100
    
    def save(self, *args, **kwargs):
        """
        Do nothing special if object is being created. 
        But if updating, make sure glyphs field stays in synce with cpList.
        """
        if self.pk: # not self._state.adding:
            if set(self.cpList) != set(self.glyphs.values_list('codePoint', flat=True)):
                self.glyphs.set(self.cpList)
        super(Sequence, self).save(*args, **kwargs)

class Font(models.Model):
    FILE_TYPES = (
        ('ttf', 'TrueType'),
        ('ttc', 'TrueType Collection'),
        ('otf', 'OpenType'),
        ('other', 'Other')
    )
    name = models.CharField(max_length=100)
    style = models.CharField(max_length=64, blank=True, default='')
    version = models.CharField(max_length=64, blank=True, default='')
    fileName = models.CharField(max_length=64, blank=True, default='')
    fileType = models.CharField(max_length=64, blank=True, default='')
    incWithSoftware = models.ManyToManyField(Software, blank=True)
    incWithOS = models.ManyToManyField(OS, blank=True)
    incWithOSonRequest = models.ManyToManyField(OS, blank=True, related_name='OSesOnRequest')
    maxUnicodeVersion = models.ForeignKey(UnicodeVersion, blank=True, null=True, on_delete=models.SET_NULL)
    glyphs = models.ManyToManyField(Glyph, blank=True)
    sequences = models.ManyToManyField(Sequence, blank=True)
    slug = models.CharField(unique=True, default='', max_length=64)
    sources = models.TextField(blank=True, null=True, default='')

    def __str__(self):
        return '%s | %s (%s)' % (self.name, self.style, self.fileName)

    class Meta:
        unique_together = ('name', 'style', 'fileName')

class PollResponse(models.Model):
    browser = models.ForeignKey(Browser, blank=True, null=True, on_delete=models.SET_NULL)
    glyph = models.ForeignKey(Glyph, on_delete=models.CASCADE)
    doesShow = models.BooleanField()
    def __str__(self):
        return str(self.glyph) + (" ✅" if doesShow else " ❌")