import os
from fontforge import *
from pathlib import Path

""" 
The purpose of this script is to create png images of 
every glyph in the passed font files, using fontforge. This script is meant
to be run from the fontforge Python console.
"""

#font = open(os.sys.argv[1])

fileList = [Path("/path/to/font.ttf")]

completedList = []

savedFont = None
filePathBase = "/home/unicompat/charImages/"
#newFilePath += ("serif" if "Serif" in str(fontFile) else "sans") + ("/%04X" % uniChar) + ".png"

for fontFile in fileList:
    if "Mono" in str(fontFile) or "Cond" in str(fontFile):
        continue
    # + ("serif" if "Serif" in str(fontFile) else "sans") + "/"
    newFilePath = filePathBase

    font = open(str(fontFile))
    for glyph in font:
        # print(font[glyph].codepoint[2:])

        # and font[glyph].codepoint[2:].upper() in rareCJKList:
        if font[glyph].isWorthOutputting() and font[glyph].codepoint:
            finalPath = newFilePath + font[glyph].codepoint[2:] + ".png"
            # if os.path.exists(finalPath):
            #    print("Skipping ", finalPath.split("/")[-1])
            #    continue
            # else:
            print("Adding ", finalPath.split("/")[-1])
            font[glyph].export(
                finalPath, 250)
