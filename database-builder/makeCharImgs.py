from PIL import ImageFont, ImageDraw, Image
from fontTools.ttLib import TTFont, TTCollection
from pathlib import Path
import os.path
#from .models import Glyph

#fileList = list(Path("/Users/jonathan/Downloads/noto-fonts-master/phaseIII_only/unhinted/ttf/").rglob("*.ttf"))
fileList = list(Path("/Users/jonathan/Downloads/Noto-unhinted/").rglob("*CJK*-Regular.otf"))

#fileList = list(Path("/Users/jonathan/Downloads/remainingNoto/").rglob("*Emoji.ttf"))

completedList = []

savedFont = None
for fontFile in fileList:
    if "Mono" in str(fontFile):
        continue
    font = TTFont(fontFile)
    for cmap in font['cmap'].tables:
        if cmap.isUnicode():
            for idx, uniChar in enumerate(cmap.cmap):
                newFilePath = "/Users/jonathan/Downloads/Noto-unhinted/cjk/"
                newFilePath += ("serif" if "Serif" in str(fontFile) else "sans") + ("/%04X" % uniChar) + ".png"

                isCombining = False
                
                glyphObj = Glyph.objects.get(pk=uniChar)

                if glyphObj.supportPercentOS() >= 97:
                    continue


                if uniChar in completedList:
                    continue
                
                #if os.path.exists(newFilePath):
                #    continue

                image = Image.new("RGBA", (1500, 1500))
                draw = ImageDraw.Draw(image)
                # use a truetype font
                font = ImageFont.truetype(str(fontFile), 250)  
                #if not savedFont:
                #    savedFont = font

                #displayText = ( + chr(uniChar)) if isCombining else chr(uniChar)
                if isCombining:
                    draw.text((0, 0), "\u25cc", fill=(100, 100, 100, 255), font=font)
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
