import xml.etree.ElementTree as ET
from django.utils.text import slugify

# from .models import UnicodeBlock, UnicodeVersion, Glyph

"""
The purpose of this file is to import all of the Unicode codepoints
from the official Unicode file ucd.all.grouped.xml, available at
http://unicode.org/Public/UCD/latest/ucdxml/ucd.all.grouped.zip.

This script is meant to be run from the Django manage.py shell.
"""

file = '/home/Downloads/ucd.all.grouped.xml'
tree = ET.parse(file)
root = tree.getroot()

# Set this to True when setting up the initial database. Set to False
# if UnicodeBlocks and Glyphs have been created and just need to be
# updated.
CREATE_INITIAL_DB = False

for mainTag in root:
    if CREATE_INITIAL_DB and mainTag.tag == "blocks":
        for block in mainTag:
            blockObj = UnicodeBlock(
                name=block.get("name"),
                start=int(block.get("first-cp"), base=16),
                end=int(block.get("last-cp"), base=16),
                slug=slugify(block.get("name"))
            )
            blockObj.save()
            print("CREATED BLOCK ", blockObj)

    if mainTag.tag == "repertoire":
        errorList = []
        for idx, group in enumerate(mainTag):
            groupAge = group.get("age","")
            jg = group.get("jg","")
            groupCategory = group.get("gc","")
            groupEmoji = group.get("Emoji","")
            groupName = group.get("na", "")
            for char in group:
                if char.tag == "char":
                    charName = char.get("na",char.get("na1",""))
                    definition = char.get("kDefinition","")
                    charAge = (char.get("age",groupAge))
                    category = char.get("gc", groupCategory)
                    cp = char.get("cp")
                    if not charName and groupName and groupName[-2:] == "-#":
                        charName = groupName[:-1] + cp

                    ccc = char.get("ccc", "")
                    emoji = char.get("Emoji", groupEmoji)

                    if not emoji:
                        continue
   
                    jg = jg if jg else char.get("jg","")
                    charAbbrev = ""
                    isControl=False
                    for alias in char:
                        #print(alias.get("alias"))
                        if alias.get("type") == "abbreviation":
                            charAbbrev = alias.get("alias")
                        if alias.get("type") == "control":
                            isControl = True
                    #print(f"{charName} ({cp}), unicode {charAge}, abbr {charAbbrev}, isControl={isControl}, jg={jg}, cat={category}")
                    try:
                        cpInt = int(cp, base=16)
                    except TypeError:
                        print("ERROR converting ", cp)
                        errorList += [cp]
                        continue

                    if CREATE_INITIAL_DB:
                        block = UnicodeBlock.objects.get(start__lte=cpInt, end__gte=cpInt)
                        uniVersion = UnicodeVersion.objects.get(number=charAge)

                        glyph = Glyph(
                            officialName=charName, 
                            codePoint=cpInt, 
                            abbreviation=charAbbrev, 
                            codePlane = cpInt // 65536, 
                            category=category, 
                            joiningGroup=jg,
                            slug=cp,
                            unicodeBlock=block,
                            minUnicodeVersion=uniVersion,
                            definition=definition,
                            japKun=char.get("kJapaneseKun",""),
                            japOn=char.get("kJapaneseOn","")
                            )
                        glyph.save()
                        print("CREATED GLYPH: ", glyph)

                    else:
                        glyph = Glyph.objects.get(codePoint=int(cp, base=16))
                        #glyph.category = category
                        #glyph.combiningClass = int(ccc)
                        glyph.isEmoji = True if emoji == "Y" else False
                        #glyph.mandarin = char.get("kMandarin", "")
                        #glyph.cantonese = char.get("kCantonese", "")
                        #glyph.decomposition = char.get("dm", "")
                        #glyph.officialName = charName
                        glyph.save()
                        print("UPDATED GLYPH: ", glyph)

        print("Errors with codepoints: ", errorList)

