from uharfbuzz import Face, Font as BuzzFont, Buffer, ot_font_set_funcs, shape
from pathlib import Path

def emojiSupported(emoji: str, fontdata) -> bool:
    # Load font:
    

    # Load font (has to be done for call):
    face = Face(fontdata)
    font = BuzzFont(face)
    upem = face.upem
    font.scale = (upem, upem)
    ot_font_set_funcs(font)

    # Create text buffer:
    buf = Buffer()
    buf.add_str(emoji)
    buf.guess_segment_properties()

    # Shape text:
    features = {"kern": True, "liga": True}
    shape(font, buf, features)

    infos = buf.glyph_infos

    # Remove all variant selectors:
    while len(infos) > 0 and infos[-1].codepoint == 3:
        infos = infos[:-1]

    # Filter empty:
    if len(infos) <= 0:
        return False

    # Remove uncombined, ending with skin tone like "👭🏿":
    lastCp = infos[-1].codepoint

    print(lastCp)

    badCp = [1076, 1079, 1082, 1085, 1088]

    if lastCp in badCp:
        return False

    # If there is a code point 0 or 3 => Emoji not fully supported by font:
    return all(info.codepoint != 0 and info.codepoint != 3 for info in infos)

allSeq = Sequence.objects.filter(isEmoji=True)

fontList = list(Path("/Users/jonathan/Documents/repos/unicodeProject/database-builder/emojiSequenceCheck/").rglob("*.ttf"))

for fontPath in fontList:
    fontObj = Font.objects.get(fileName=str(fontPath).split("/")[-1][:-4])
    print("Got fontobj: ", fontObj)
    with open(fontPath, 'rb') as fontfile:
        fontdata = fontfile.read()
        print("Opened ", fontPath)
        for sequence in allSeq.all():
            if emojiSupported(sequence.sequence(), fontdata):
                print("Found support for ", sequence)
                fontObj.sequences.add(sequence)
                fontObj.save()

