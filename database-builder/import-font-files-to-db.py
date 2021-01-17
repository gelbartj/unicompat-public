from fontTools.ttLib import TTFont, TTCollection
import json
import re
from django.utils.text import slugify
import django
import random
import sys
from pathlib import Path
from pprint import pprint
from django.forms.models import model_to_dict

# from .models import Font, Glyph, OS

""" 
This is one of the most important and widely used scripts for the creation and 
maintenance of the Unicompat database. It reads font files (ttf, otf, ttc, etc)
and creates the appropriate objects in the database: namely, a Font model with
all necessary fields as well as links to all of the glyphs supported by that font.
Only glyphs are checked for compatibility here, not Unicode sequences.

This script is meant to be run from the Django manage.py shell.
"""

def analyzeFonts(fontList, makeDict=False):
    """
    Set makeDict to True to create a dictionary of glyphs supported by each font
    suitable for JSON export.
    """

    errorList = []

    fontDict = {}

    ## Always update these lines with information on which OS the font files came from ##
    withOS = OS.objects.get(slug="mac-11")
    withOSLabel = "Big Sur"

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

        fileNameStem = fontFile.stem

        if makeDict:
            fontDict[fileNameStem] = []

        for font in fontCollection:
            fontName = font["name"].names[1].toStr()
            try:
                fontVersion = font["name"].names[5].toStr()[:64] # 64 character limit for model charFields
            except IndexError:
                fontVersion = ""

            if "LastResort" in fontName:
                continue
            if "©" in fontName or "Copyright" in fontName:
                fontName = fileNameStem.replace("-", " ")
                fontName = re.sub(r'([a-z])([A-Z])', r'\1 \2', fontName)

            try:
                fontStyle = font["name"].names[2].toStr()
            except IndexError:
                fontStyle = ""
            print("filename: ", fileNameStem)
            slug = slugify(fontName[:64 - len(fontStyle) - 1] +
                           " " + fontStyle[:64])[:64]
            print("slug: ", slug)
            slugDup = False

            fontDbObj = None
            print("fontname: ", fontName)
            print("fontstyle: ", fontStyle)
            print("fontversion: ", fontVersion)

            """NOTE! In most recent update, added check for version number. This will end up creating 
            duplicate Font objects in the database since many of the original imports did not include 
            version numbers."""
            
            fontDbObjs = Font.objects.filter(
                name=fontName.replace("109uh", "")[:64],
                style=fontStyle[:64],
                fileName=fileNameStem,
                version=fontVersion
            )

            if makeDict:
                fontObj = {
                    "name": fontName.replace("109uh", "")[:64],
                    "style": fontStyle[:64],
                    "fileType": str(fontFile)[-3:],
                    "slug": slug,
                    "version": fontVersion,
                    "glyphs": set()
                }
                fontDict[fileNameStem] += [fontObj]

            if not fontDbObjs.exists() and fontName[0] == ".":
                fontName = fontName[1:]
                fontDbObjs = Font.objects.filter(
                    name=fontName.replace("109uh", "")[:64],
                    style=fontStyle[:64],
                    fileName=fileNameStem,
                    version=fontVersion
                )
            if not fontDbObjs.exists():
                fontDbObjs = Font.objects.filter(
                    fileName=fileNameStem,
                    version=fontVersion
                )
            if fontDbObjs.exists():
                fontDbObj = fontDbObjs[0]
                print(f"Adding to {withOSLabel} font list")
                fontDbObj.incWithOS.add(withOS)
                fontDbObj.save()
                print("Skipping further analysis", fontName, " ", fontStyle)
                print()
                continue

            else:
                slugDup = Font.objects.filter(slug=slug).exists()
                if slugDup:
                    slug = slug[:50] + "-" + str(int(random.random() * 10000))
                try:
                    fontDbObj = Font(
                        name=fontName.replace("109uh", "")[:64],
                        style=fontStyle[:64],
                        fileName=fileNameStem,
                        fileType=str(fontFile)[-3:],
                        slug=slug,
                        version=fontVersion
                    )
                    print(f"Created font: {fontName} {fontStyle}")
                    print(fontDbObj)
                    fontDbObj.save()
                except django.db.utils.IntegrityError as e:
                    print("ERROR: ", e)
                    continue

            for cmap in font['cmap'].tables:
                if cmap.isUnicode():
                    for idx, uniChar in enumerate(cmap.cmap):
                        glyphObj, result = Glyph.objects.get_or_create(codePoint=uniChar,
                                                                       defaults={"officialName": "Private or unassigned",
                                                                                 "slug": "%04X" % uniChar,
                                                                                 "codePlane": uniChar // 65536})
                        if result:
                            print("Created new Glyph object for codePoint ", hex(
                                uniChar).upper())
                        # except Glyph.DoesNotExist:
                        #    print(f"WARNING: In {dictKey}/{fontName}, no glyph found for ", hex(uniChar))
                        #    errorList += [hex(uniChar)]
                        #    continue
                        fontDbObj.glyphs.add(glyphObj)
                        if idx % 250 == 0:
                            print('.', end='')
                        
                        if makeDict:
                            fontDict[fileNameStem][-1]["glyphs"].add(f"{hex(uniChar).upper()[2:]}")

            print(f"Added {fontDbObj.glyphs.count()} glyphs to font")
            fontDbObj.save()
            print(f"Adding to {withOSLabel} font list...")
            fontDbObj.incWithOS.add(withOS)
            fontDbObj.save()
            print("Finished ", fontDbObj)
            print("=====")
            print()

            #errorList = list(set(errorList))
            #print("Error list first 10 items are ", errorList[:10], f"out of {len(errorList)} total")

    return fontDict

completeList = [Path("/path/to/fontFile.otf")]

analyzeFonts(completeList)
