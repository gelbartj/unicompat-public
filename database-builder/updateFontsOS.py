import re
#from windows81 import fontList
#from windows10 import windows10Fonts as fontList
#from ifonts import iFonts
#from iosNewFontList import newIosList
from ios12Fonts import iosList
from pprint import pprint

def assignFonts(osFamily, osVersion, fonts):
    osObj = OS.objects.get(family=osFamily, version=osVersion)
    missingList = []
    regex = r"\s(ExtraLight|Condensed|Extended|Inline|Solid\
        |Semibold|Book|W\d|Wide|Black|ExtraBlack|UltraBold|Ultra\
            |Bold|Italic|Light|Demi|Inclined|Oblique|SemiBold\
                |Thin|UltraLight|Semilight|Ultralight|Medium|ExtraBold|Regular|Heavy)"
    for font in fonts:
        #if " *" in font:
        #    continue #skip fonts added in Windows 8.1
        font = re.sub(regex, r"_\1", font.replace(" Version","").replace(" *",""))
        splitFont = font.split("_")
        fontName = splitFont[0]
        fontStyle = " ".join(splitFont[1:]) if len(splitFont) > 1 else ""
        try:
            fontObj = Font.objects.get(name=fontName, style=fontStyle)
        except Font.DoesNotExist:
            print(fontName, " not found")
            try:
                print("CHECKING FOR 'REGULAR' FONT: ", fontName)
                newStyle = "Regular" if fontStyle != "Regular" else ""
                fontObj = Font.objects.get(name=fontName, style=newStyle)
            except Font.DoesNotExist:
                missingList += [font]
                print("Could not find ", font)
                continue
        print("Found ", fontObj)
        fontObj.incWithOS.add(osObj)
        fontObj.save()
    print(missingList)

def assigniFonts(fonts):
    # using data from iosFonts.com
    #osObj = OS.objects.get(family=osFamily, version=osVersion)
    missingList = []
    for fontListObj in fonts:
        if "☠" in fontListObj:
            # FONT HAS BEEN REMOVED
            continue
        fontName = fontListObj[0]
        fontStyle = fontListObj[1] if len(fontListObj) == 6 else "Regular"
        iphone, ipad, watch, tv = fontListObj[2:] if len(fontListObj) == 6 else fontListObj[1:]
        try:
            fontObj = Font.objects.get(name=fontName, style=fontStyle)
        except Font.DoesNotExist:
            print(fontName, " not found")
            try:
                print("CHECKING FOR 'REGULAR' FONT: ", fontName)
                newStyle = "Regular" if fontStyle != "Regular" else ""
                fontObj = Font.objects.get(name=fontName, style=newStyle)
            except Font.DoesNotExist:
                missingList += [fontName + " " + fontStyle]
                print("Could not find ", fontName)
                continue
        print("Found ", fontObj)
        if iphone != "—":
            iphoneInt = int(float(iphone))
            iosObj = OS.objects.get(family='ios', version=str(iphoneInt))
            print("Adding ", iosObj)
            fontObj.incWithOS.add(iosObj)
            
            while iphoneInt < 13:
                iphoneInt += 1
                iosObj = OS.objects.get(family='ios', version=str(iphoneInt))
                print("Adding ", iosObj)
                fontObj.incWithOS.add(iosObj)
            fontObj.save()
    print(missingList)

def assignAppleiFonts(fonts):
    # From Apple official list https://developer.apple.com/fonts/system-fonts/
    # iOS 13 only
    iosObj = OS.objects.get(family='ios', version='12')
    macosObj = OS.objects.get(family='mac', version='10.14')
    missingList = []
    regex = r"\s(ExtraLight|Extended|Inline|Solid|" +\
        r"Semibold|W\d|Wide|ExtraBlack|UltraBold|Ultra|" +\
        r"Bold|Italic|Demi|Inclined|Oblique|SemiBold|" +\
        r"Book|Roman|Thin|Semi|Light|Black|UltraLight|" +\
        r"Ultralight|Medium|ExtraBold|Regular|Condensed|Heavy)"

    for fontArray in fonts:
        font = re.sub(regex, r"_\1", fontArray[0].replace(" Version","").replace("-", " ")) # .replace(" *",""))
        splitFont = font.split("_")
        fontName = splitFont[0]
        fontStyle = " ".join(splitFont[1:]) if len(splitFont) > 1 else ""
        fileName = fontName.replace(" ","") + "-" + fontStyle.replace(" ", "")
        fontObjs = Font.objects.filter(name=fontName, style=fontStyle)
        if not fontObjs.exists():
            print(fontName, " not found")
            try:
                print("CHECKING FOR 'REGULAR' FONT: ", fontName)
                newStyle = "Regular" if fontStyle != "Regular" else ""
                fontObjs = [Font.objects.get(name=fontName, style=newStyle)]
            except Font.DoesNotExist:
                fontObjs = Font.objects.filter(fileName=fileName)
                if not fontObjs.exists():
                    missingList += [font]
                    print("Could not find ", font)
                    continue
        for fontObj in fontObjs:
            print("Found ", fontObj)
            if fontArray[2]:
                print("iOS 12 support found for ", fontObj)
                fontObj.incWithOS.add(iosObj)
                fontObj.save()
            if fontArray[3]:
                print("macOS Mojave support found for ", fontObj)
                fontObj.incWithOS.add(macosObj)
                fontObj.save()
    pprint(missingList)

#assignFonts('windows', '8', fontList)
#assigniFonts(iFonts)
assignAppleiFonts(iosList)