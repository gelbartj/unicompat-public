import re
import django
for font in Font.objects.filter(name__contains="Noto"):
    splitFileName = font.fileName.split("-")
    newName = re.sub(r"([a-z])([A-Z])", r"\1 \2", splitFileName[0])
    newStyle = re.sub(r"([a-z])([A-Z])", r"\1 \2", splitFileName[1]) if len(splitFileName) > 1 else font.style
    
    print("Updating name from ", font.name, " to ", newName)
    print("Updating style from ", font.style, " to ", newStyle)

    font.name = newName
    font.style = newStyle
    try:
        font.save()
    except django.db.utils.IntegrityError as e:
        print("Error: ", e, ", skipping")
    print("======================")