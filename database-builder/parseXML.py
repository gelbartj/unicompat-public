import xml.etree.ElementTree as ET
from django.utils.text import slugify

file = '/Users/jonathan/Downloads/ucd.all.grouped.xml'
tree = ET.parse(file)
root = tree.getroot()

for mainTag in root:
    """
    if mainTag.tag == "blocks":
        for block in mainTag:
            blockObj = UnicodeBlock(
                name=block.get("name"),
                start=int(block.get("first-cp"), base=16),
                end=int(block.get("last-cp"), base=16),
                slug=slugify(block.get("name"))
            )
            blockObj.save()
            print("CREATED BLOCK ", blockObj)
    """
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


                    #block = UnicodeBlock.objects.get(start__lte=cpInt, end__gte=cpInt)

                    #uniVersion = UnicodeVersion.objects.get(number=charAge)
                    #print("charAge: ", charAge)

                    """glyph = Glyph(
                        officialName=charName, 
                        codePoint=cpInt, 
                        abbreviation=charAbbrev, 
                        codePlane = cpInt // 65535, 
                        category=category, 
                        joiningGroup=jg,
                        slug=cp,
                        unicodeBlock=block,
                        minUnicodeVersion=uniVersion,
                        definition=definition,
                        japKun=char.get("kJapaneseKun",""),
                        japOn=char.get("kJapaneseOn","")
                        )
                    """

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

