from fontTools.ttLib import TTFont, TTCollection
import json
import re
from django.utils.text import slugify

import sys
from pathlib import Path

fontDict = {}

def analyzeFonts(fontList):
    errorList = []
    for idx, fontFile in enumerate(fontList):
        isCollection = False
        if str(fontFile)[-3:] == "ttc":
            isCollection = True
        try:
            if isCollection:
                fontCollection = TTCollection(fontFile)
            else:
                fontCollection = [TTFont(fontFile)]
        except Exception as e:
            print("Failed to read", fontFile)
            print(e)
            continue

        dictKey = str(fontFile).split("/")[-1][:-4]

        for font in fontCollection:
            breakFlag = False
            fontName = font["name"].names[1].toStr()
            if "LastResort" in fontName:
                continue
            if "©" in fontName or "Copyright" in fontName:
                fontName = dictKey.replace("-", " ")
                fontName = re.sub(r'([a-z])([A-Z])', r'\1 \2', fontName)
            fontStyle = font["name"].names[2].toStr()

            print(dictKey)
            slug = slugify(fontName[:64 - len(fontStyle) - 1] + " " + fontStyle[:64])[:64]
            slugDup = False

            try:
                fontDbObj = Font.objects.get(
                    name=fontName[:64],
                    style=fontStyle[:64],
                    fileName=dictKey
                )
            except Font.DoesNotExist:
                errorList += [(dictKey, fontName, fontStyle)]
                print(errorList)
                print("Font not found. Total missing: " + str(len(errorList)))
                continue

            if fontDbObj.glyphs.count() > 0:
                print("Skipping ", fontDbObj)
                continue

            for cmap in font['cmap'].tables:
                if cmap.isUnicode():
                    for idx, uniChar in enumerate(cmap.cmap):
                        glyphObj, result = Glyph.objects.get_or_create(codePoint=uniChar, 
                            defaults = { "officialName": "Private or unassigned",
                                "slug": "%04X" % uniChar,
                                "codePlane": uniChar // 65535})
                        if result:
                            print("Created new Glyph object for codePoint ", hex(uniChar).upper())

                        fontDbObj.glyphs.add(glyphObj)
                        if idx % 250 == 0:
                            print('.', end='')
            print()
            fontDbObj.save()

        print(errorList)

completeList = list(Path("/Users/jonathan/Downloads/Roboto_Condensed/").rglob("*.ttf"))

analyzeFonts(completeList)

