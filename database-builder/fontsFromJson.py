from fontTools.ttLib import TTFont, TTCollection
import json
import re
from django.utils.text import slugify

import sys
from pathlib import Path

def analyzeJsonFonts():
    fontDict = json.loads(open("/Users/jonathan/Downloads/fontDict4.json").read())

    for key in fontDict:
        dictKey = key
        for font in fontDict[key]:
            fontName = font["name"]
            if "LastResort" in fontName:
                continue
            if "©" in fontName or "Copyright" in fontName:
                fontName = dictKey.replace("-", " ")
                fontName = re.sub(r'([a-z])([A-Z])', r'\1 \2', fontName)
            fontStyle = font["style"]
            print(dictKey)
            slug = slugify(fontName[:64 - len(fontStyle) - 1] + " " + fontStyle[:64])[:64]
            try:
                testObj = Font.objects.get(slug=slug)
            except Font.DoesNotExist:
                pass
            else:
                print("Skipping ", fontName, " ", fontStyle)
                continue
            print("Name: ", fontName)
            print("style: ", fontStyle)
            print("Filename: ", dictKey)
            print("Slug: ", slug)
            
            fontDbObj, result = Font.objects.get_or_create(
                name=fontName[:64],
                style=fontStyle[:64],
                fileName=dictKey,
                #fileType=str(fontFile)[-3:],
                slug=slug
            )
            if result:
                print(f"Created font: {fontName} {fontStyle}")
            
            for idx, glyph in enumerate(font["glyphs"]):
                uniChar = int(glyph, base=16)
                glyphObj, result = Glyph.objects.get_or_create(codePoint=uniChar, 
                    defaults = { "officialName": "Private or unassigned",
                        "slug": "%04X" % uniChar})
                if result:
                    print("Created new Glyph object for codePoint ", hex(uniChar).upper())

                fontDbObj.glyphs.add(glyphObj)
                if idx % 250 == 0:
                    print('.', end='')
            print()
            fontDbObj.save()

analyzeJsonFonts()