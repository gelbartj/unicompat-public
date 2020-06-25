#!/usr/bin/env python

#import sys
import xml.etree.ElementTree as ET
from pprint import pprint

#fileName = sys.argv[1]

fileName = input("Input filename: ")

tree = ET.parse(fileName)
root = tree.getroot()

vDict = {
    "android10": "10.0",
    "pie": "9.0",
    "oreo": "8.0",
    "nougat": "7.0",
    "marshmallow": "6.0",
    "lollipop": "5.0",
    "kitkat": "4.4",
    "jellybean": "4.3", 
    "ics": "4.0",
    "donut": "1.6",
    "eclair": "2.0",
    "gingerbread": "2.3",
    "froyo": "2.2"
}

versionNum = vDict[fileName.split("/")[-1][:-4].split("-")[0]]
osObj = OS.objects.get(family='android', version=versionNum)

errorList = []

for font in root.iter('file'):
    fontFile = font.text.replace("\n","").strip()
    #if fontFile in ['NotoSansHans-Regular.otf', 'NotoSansHant-Regular.otf', 'NotoSansJP-Regular.otf', 'NotoSansKR-Regular.otf']:
    #    fontFile = "NotoSansCJK-Regular.ttc"

    if fontFile in ["NotoSansSC-Regular.otf", "NotoSansHans-Regular.otf"]:
        fontObjs = Font.objects.filter(name="Noto Sans CJK SC Regular")
    elif fontFile in ["NotoSansTC-Regular.otf", "NotoSansHant-Regular.otf"]:
        fontObjs = Font.objects.filter(name="Noto Sans CJK TC Regular")
    elif fontFile == "NotoSansJP-Regular.otf":
        fontObjs = Font.objects.filter(name="Noto Sans CJK JP Regular")
    elif fontFile == "NotoSansKR-Regular.otf":
        fontObjs = Font.objects.filter(name="Noto Sans CJK KR Regular")
    else:
        fontObjs = Font.objects.filter(fileName=fontFile[:-4])

    if fontObjs.count() == 0:
        print("COULD NOT FIND FONTFILE: ", fontFile)
        errorList += [fontFile]
        continue

    for fontObj in fontObjs:
        if osObj in fontObj.incWithOS.all():
            print("OS already in ", fontObj)
            continue
        print("Adding ", osObj, " to ", fontObj)
        fontObj.incWithOS.add(osObj)
        fontObj.save()
print("Filenames not found: ")
pprint(errorList)