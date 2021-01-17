# from .models import UnicodeVersion, Sequence, Glyph

"""
The purpose of this file is to parse and import all of the emoji sequences
listed in the official emoji-test.txt file from the Unicode website.
The Unicode 13.1 version is available at https://unicode.org/Public/emoji/13.1/emoji-test.txt.
"""

allData = open('/Downloads/emoji-test13.1.txt')

emoVers = UnicodeVersion.objects.filter(isEmojiVersion=True)

for line in allData:
    try:
        withoutComments, comments = line.split("#")
    except ValueError:
        print("Skipping empty line")
        continue
    if not withoutComments:
        print("Skipping line of all comments")
        continue
    rawSeq, qualification = withoutComments.split(";")
    hexSeq = rawSeq.strip().split(" ")
    qualification = qualification.strip()
    try:
        seqString, eVer, officialName = comments.strip().split(" ", 2)
        officialName = officialName[0].upper() + officialName[1:]
    except ValueError:
        print("Comments did not include all three components")
        continue
    obj = None
    eVerObj = emoVers.get(number=eVer[1:])
    if len(hexSeq) == 1:
        obj = Glyph.objects.get(pk=int(hexSeq[0], 16))
        print("Got glyph: ", obj)
        if obj.emojiVersion is not None:
            print("Emoji version already present, continuing")
            continue
    else:
        intSeq = [int(h, 16) for h in hexSeq]
        try:
            obj = Sequence.objects.get(cpList=intSeq)
            print("Got sequence: ", obj)
        except Sequence.DoesNotExist:
            if qualification != "fully-qualified":
                # The test file includes "minimally qualified" sequences in which it recommends
                # to vendors that they display a certain character sequence a certain way,
                # even if it does not match the official specification for which characters
                # make up that emoji sequence. We only want the official specification for each
                # sequence, which is marked as "fully qualified."

                print("No sequence found, not fully qualified. Skipping")
                continue
            glyphs = Glyph.objects.filter(pk__in=intSeq)
            obj = Sequence(cpList=intSeq, officialName=officialName, isEmoji=True,
                emojiVersion=eVerObj)
            print("Creating sequence: ", seqString)
            obj.save()
            obj.glyphs.set(glyphs)
    
    print("Adding emoji version ", eVerObj, "to ", obj)
    obj.emojiVersion = eVerObj
    obj.save()


    