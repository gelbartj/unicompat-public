from django.db.models import Q
# from .models import Sequence, Variant

"""
This script is meant to link all related Unicode sequences to each other, mostly for emojis.
For instance, "Family: Man, man, boy," "Family: Woman, man, girl," etc.
This script is meant to be run from the Django manage.py shell.
"""

allVariants = Variant.objects.all().values_list('codePoint', flat=True)

for sequence in Sequence.objects.all():
    if ":" in sequence.officialName and "Flag" not in sequence.officialName:
        print(sequence)
        officialStem = sequence.officialName.split(":")[0]
        variantsList = Sequence.objects.filter(
            Q(officialName__startswith=(officialStem + ":")) &\
            ~Q(pk=sequence.pk))
        sequence.variantVers.set(variantsList)
        sequence.save()
        print("Variants for ",sequence,": ",variantsList)
        # hex(a) prints the proper hex code for the first character in each sequence
        # because the Django primary key for Glyph is its codePoint, saved in the
        # database as an integer.
        print("cpList searched was ", list(map(lambda a: hex(a), sequence.cpList[:-1])))
