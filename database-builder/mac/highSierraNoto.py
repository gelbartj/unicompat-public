#from .models import OS, Font

highSierraNoto = [
    "Noto Sans Avestan",
    "Noto Sans Balinese",
    "Noto Sans Bamum",
    "Noto Sans Batak",
    "Noto Sans Brahmi",
    "Noto Sans Buginese",
    "Noto Sans Buhid",
    "Noto Sans Carian",
    "Noto Sans Cham",
    "Noto Sans Coptic",
    "Noto Sans Cuneiform",
    "Noto Sans Cypriot",
    "Noto Sans Egyptian Hieroglyphs",
    "Noto Sans Glagolitic",
    "Noto Sans Gothic",
    "Noto Sans Hanunoo",
    "Noto Sans Imperial Aramaic",
    "Noto Sans Inscriptional Pahlavi",
    "Noto Sans Inscriptional Parthian",
    "Noto Sans Javanese",
    "Noto Sans Kaithi",
    "Noto Sans Kayah Li",
    "Noto Sans Kharoshthi",
    "Noto Sans Lepcha",
    "Noto Sans Limbu",
    "Noto Sans Linear B",
    "Noto Sans Lisu",
    "Noto Sans Lycian",
    "Noto Sans Lydian",
    "Noto Sans Mandaic",
    "Noto Sans Meetei Mayek",
    "Noto Sans Mongolian",
    "Noto Sans NKo",
    "Noto Sans New Tai Lue",
    "Noto Sans Ogham",
    "Noto Sans Ol Chiki",
    "Noto Sans Old Italic",
    "Noto Sans Old Persian",
    "Noto Sans Old South Arabian",
    "Noto Sans Old Turkic",
    "Noto Sans Osmanya",
    "Noto Sans Phags Pa",
    "Noto Sans Phoenician",
    "Noto Sans Rejang",
    "Noto Sans Runic",
    "Noto Sans Samaritan",
    "Noto Sans Saurashtra",
    "Noto Sans Shavian",
    "Noto Sans Sundanese",
    "Noto Sans Syloti Nagri",
    "Noto Sans Syriac Eastern",
    "Noto Sans Tagalog",
    "Noto Sans Tagbanwa",
    "Noto Sans Tai Le",
    "Noto Sans Tai Tham",
    "Noto Sans Tai Viet",
    "Noto Sans Thaana",
    "Noto Sans Tifinagh",
    "Noto Sans Ugaritic",
    "Noto Sans Vai",
    "Noto Sans Yi"
]

highSierra = OS.objects.get(family='mac', version='10.13')

missingList =[]
for notoFont in highSierraNoto:
    fonts = Font.objects.filter(name=notoFont)
    if fonts.count() == 0:
        missingList += [notoFont]
    else:
        for font in fonts:
            font.incWithOS.add(highSierra)
            font.save()

print(missingList)