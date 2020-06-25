def addVariants(line):
    dataList = [a.strip() for a in line.split("#")[0].split(";")]
    #print("Data list: ", dataList)

    if (dataList[1] != "Basic_Emoji" and dataList[1] != "RGI_Emoji_Modifier_Sequence") or " " not in dataList[0]:
        #continue
        return
        
    #print(dataList)
    print("Before split: ", dataList[0].split(" "))
    codes = [int(a, base=16) for a in dataList[0].split(" ")]
    name = dataList[2][0].upper() + dataList[2][1:]

    print(codes)
    print(name)
    
    variantObj = Variant.objects.get(codePoint=codes[1])

    print("Got variant")

    glyphObj = Glyph.objects.get(codePoint=codes[0])

    print("got glyph: ", glyphObj)

    glyphObj.variantVers.add(variantObj)

    print("Added variant")
    glyphObj.save()

with open('../database-builder/emoji-sequences.txt') as f:
    while line := f.readline():
        if line[0] == "#" or line == "\n":
            continue

        dataList = [a.strip() for a in line.split("#")[0].split(";")]
        #print("Data list: ", dataList)

        if " " not in dataList[0]:
            continue
        
        codes = [int(a, base=16) for a in dataList[0].split(" ")]
        name = dataList[2].strip()[0].upper() + dataList[2].strip()[1:]
        print("Getting or creating sequence: ", name, ", ", codes)

        sequence, created = Sequence.objects.get_or_create(cpList=codes, officialName=name, isEmoji=True)

        if not created:
            continue

        for code in codes:
            #glyphObj = Glyph.objects.get(codePoint=code)
            sequence.glyphs.add(code)
        
        sequence.save()
        



