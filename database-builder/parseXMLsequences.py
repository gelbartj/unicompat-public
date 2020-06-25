#import sys
import xml.etree.ElementTree as ET
from pprint import pprint

#fileName = sys.argv[1]

fileName = '/Users/jonathan/Downloads/ucd.all.grouped.xml'

tree = ET.parse(fileName)
root = tree.getroot()

errorList = []

def parseSequences(root):
    for mainTag in root:
        if mainTag.tag in ["named-sequences", "provisional-named-sequences"]:
            isProvisional = mainTag.tag == "provisional-named-sequences"
            for idx, sequence in enumerate(mainTag):
                name = sequence.get("name","")
                cpListRaw = sequence.get("cps","").strip()
                cpList = []
                if cpListRaw:
                    cpList = [int(a.strip(), base=16) for a in cpListRaw.split(" ")]
                if cpList:
                    sequenceObj, created = Sequence.objects.get_or_create(officialName=name, cpList=cpList, isEmoji=False, isProvisional=isProvisional)
                    sequenceObj.glyphs.set(cpList)
                    sequenceObj.save()
                    print("Updated ", sequenceObj)

for variant in root.iter('standardized-variant'):
    name = variant.get("desc","") + ((" - " + variant.get("when","")) if variant.get("when","") else "")
    name = name[0].upper() + name[1:]
    cpListRaw = variant.get("cps","").strip()
    cpList = []
    if cpListRaw:
        cpList = [int(a.strip(), base=16) for a in cpListRaw.split(" ")]
    if cpList:
        variantObj, created = Variant.objects.get_or_create(name=name, codePoint=cpList[1])
        glyphObj = Glyph.objects.get(codePoint=cpList[0])
        glyphObj.variantVers.add(variantObj)
        glyphObj.save()
        print("Updated ", variantObj, " and ", glyphObj)
