from PIL import ImageFont, ImageDraw, Image
from fontTools.ttLib import TTFont, TTCollection
from pathlib import Path
import os.path
#from .models import Glyph

"""
The purpose of this script is to create images of every glyph
in the passed font file, using PIL. The advantage of PIL over
fontforge is that it creates images with a transparent background,
rather than solid white. The disadvantage is it does not properly render
combining characters that may be intended to go above or below other
letters. So in practice, Unicompat uses images from fontforge instead.
"""

fileList = list(Path("/path/to/fontfolder").rglob("*.ttf"))

completedList = []

savedFont = None
for fontFile in fileList:
    if "Mono" in str(fontFile):
        continue
    font = TTFont(fontFile)
    for cmap in font['cmap'].tables:
        if cmap.isUnicode():
            for idx, uniChar in enumerate(cmap.cmap):
                newFilePath = "/home/unicompat/charImages/"
                # newFilePath += ("serif" if "Serif" in str(fontFile) else "sans") + ("/%04X" % uniChar) + ".png"
                newFilePath += ("%04X" % uniChar) + ".png"

                isCombining = False

                glyphObj = Glyph.objects.get(pk=uniChar)

                if glyphObj.supportPercentOS() >= 97:
                    continue

                if uniChar in completedList:
                    continue

                # if os.path.exists(newFilePath):
                #    continue

                image = Image.new("RGBA", (1500, 1500))
                draw = ImageDraw.Draw(image)
                # use a truetype font
                font = ImageFont.truetype(str(fontFile), 250)
                # if not savedFont:
                #    savedFont = font

                #displayText = ( + chr(uniChar)) if isCombining else chr(uniChar)
                if isCombining:
                    draw.text((0, 0), "\u25cc", fill=(
                        100, 100, 100, 255), font=font)
                draw.text((0, 0), chr(uniChar), fill=(0, 0, 0, 255), font=font)

                isBlank = False
                if not image.getbbox():
                    isBlank = True

                image = image.crop(image.getbbox())

                if not isBlank:
                    print("Saving ", hex(uniChar), " from ", fontFile)
                    image.save(newFilePath, "PNG")
                else:
                    print("Skipping U+", hex(uniChar), " ", chr(uniChar))
                completedList += [uniChar]
