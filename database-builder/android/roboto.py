for font in Font.objects.filter(name__contains='Droid'):
  for os in OS.objects.filter(family='android'):
   if os.version != "10.0" and os.version != "11.0" and os.version <= "7.0":
    font.incWithOS.add(os)
  font.save()