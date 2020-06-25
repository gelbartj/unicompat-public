import os
from fontforge import *
from pathlib import Path

#font = open(os.sys.argv[1])

fileList = list(Path("/Users/jonathan/Downloads/noto-fonts-master/phaseIII_only/unhinted/ttf/").rglob("*-Regular.ttf"))

#fileList = list(Path("/Users/jonathan/Downloads/remainingNoto/").rglob("*Emoji.ttf"))

#rareCJKList = list(Path("/Users/jonathan/Downloads/Noto-unhinted/cjk/rare/sans/").rglob("*.png"))
#rareCJKList = [str(a).upper().split("/")[-1][:-4] for a in rareCJKList]
#print(rareCJKList)

completedList = []

savedFont = None
filePathBase = "/Users/jonathan/Downloads/remainingNoto/images/"
        #newFilePath += ("serif" if "Serif" in str(fontFile) else "sans") + ("/%04X" % uniChar) + ".png"

for fontFile in fileList:
    if "Mono" in str(fontFile) or "Cond" in str(fontFile):
        continue
    newFilePath = filePathBase #+ ("serif" if "Serif" in str(fontFile) else "sans") + "/"

    font = open(str(fontFile))
    for glyph in font:
        #print(font[glyph].codepoint[2:])
        if font[glyph].codepoint and font[glyph].codepoint[2:] == "11663":
            print("FOUND in ", str(fontFile))
        else:
            continue
        if font[glyph].isWorthOutputting() and font[glyph].codepoint: #and font[glyph].codepoint[2:].upper() in rareCJKList:
            finalPath = newFilePath + font[glyph].codepoint[2:] + ".png"
            #if os.path.exists(finalPath):
            #    print("Skipping ", finalPath.split("/")[-1])
            #    continue
            #else:
            print("Adding ", finalPath.split("/")[-1])
            font[glyph].export(newFilePath + font[glyph].codepoint[2:] + ".png", 250)