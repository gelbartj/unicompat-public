from uharfbuzz import Face, Font as BuzzFont, Buffer, ot_font_set_funcs, shape
from pathlib import Path

"""
This is almost certainly an incorrect implementation, but the purpose of this 
script is to check font files for support of official Unicode sequences other than 
emoji sequences. Right now it has a bias toward returning True, when a file
includes any portion of the sequence. It does work properly for emoji.
"""

def emojiSupported(emoji: str, fontdata) -> bool:
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

    # print(lastCp)

    badCp = [1076, 1079, 1082, 1085, 1088]

    if lastCp in badCp:
        return False

    # If there is a code point 0 or 3 => Emoji not fully supported by font:
    return all(info.codepoint != 0 and info.codepoint != 3 for info in infos)

#allSeq = Sequence.objects.filter(isEmoji=False)


allSeq = Sequence.objects.all()

print("Importing fonts...")
extensions = [
    "*.ttf",
    "*.woff",
    "*.fon",
    "*.dfont",
    "*.otf",
    "*.ttc" 
    ]
fontDir = "/path/to/fontFolder"
# Use lazy generator because the folder could have hundreds of huge fonts
fontList = (f for ext in extensions for f in list(Path(fontDir).rglob(ext)))

print("Finished initial font import")

SKIP_DUPLICATE_FILENAMES = False

if SKIP_DUPLICATE_FILENAMES:
    filteredFontList = []
    fontSet = set()
    for fontPath in fontList:
        fileName = fontPath.name
        print("Processing ", fileName)
        if fileName not in fontSet:
            fontSet.add(fileName)
            filteredFontList += [fontPath]
        else:
            print("It's a duplicate!")

    print("Started with fontList of ", len(fontList),
        ", ending with ", len(filteredFontList))

    fontList = filteredFontList

for fontPath in fontList:
    print("Retrieving ", fontPath.stem)
    fontQuery = Font.objects.filter(fileName__iexact=fontPath.stem)
    if not fontQuery.exists():
        print("No font found with that name, skipping...")
        continue
    elif fontQuery.count() > 1:
        fontObj = fontQuery[0]
        fontQuery = fontQuery.filter(style__icontains="Regular")
        if fontQuery.count() > 0:
            print("Found regular style")
            fontObj = fontQuery[0]
    else:
        fontObj = fontQuery[0]
    print("Got fontobj: ", fontObj)
    with open(fontPath, 'rb') as fontfile:
        fontdata = fontfile.read()
        print("Opened ", fontPath)
        for sequence in allSeq:
            if emojiSupported(sequence.sequence(), fontdata):
                print("Found support for ", sequence)
                fontObj.sequences.add(sequence)
                fontObj.save()
    print()
