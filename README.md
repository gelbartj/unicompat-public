# unicompat

This repo contains the source code for https://unicompat.com.

* Backend: Django + Django REST Framework + Postgres
* Frontend: React + Typescript

The `database-builder` folder contains the Python scripts that were used to scrape the Unicode consortium's data files located [here](https://www.unicode.org/Public/UCD/latest/ucdxml/) and [here](https://unicode.org/Public/emoji/13.0/), as well as the code used to generate PNG files for roughly 40,000 glyphs.

To recreate the database yourself, you will need access to all the font files from a Windows 10 installation, all the font files from a macOS 10.15 installation, and the complete batch of Noto fonts from Google. The first two of these are licensed and cannot be posted here, though you may be able to find some of the TTF files by searching around. Noto fonts can be downloaded [here](https://www.google.com/get/noto/) and [here](https://github.com/googlefonts/noto-fonts). 

At some point I may be able to post a link to the JSON dumps from Django for the entire database, but the file is >250MB and would need to be hosted elsewhere.
