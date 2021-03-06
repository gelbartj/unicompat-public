# unicompat

This repo contains the source code for http://unicompat.com.

* Backend: Django REST Framework + Postgres
* Frontend: React + TypeScript

The `database-builder` folder contains the Python scripts that were used to scrape the Unicode consortium's data files located [here](https://www.unicode.org/Public/UCD/latest/ucdxml/) and [here](https://unicode.org/Public/emoji/13.0/), generate PNG files for roughly 40,000 glyphs, and import the relevant font and OS data into the database.

To recreate the database yourself, you will need access to all the font files from a Windows 10 installation, all the font files from macOS 10.15 (Catalina) and macOS 11 (Big Sur) installations, and the complete batch of Noto fonts from Google. The first two of these are licensed and cannot be posted here, though you should be able to find at least some of the TTF files by searching around. The exact batch of fonts distributed with the various versions of Android can be obtained by downloading a virtual image of each OS using Android Studio. The latest Noto fonts (which usually are ahead of the latest version of Android) can be downloaded [here](https://www.google.com/get/noto/) and [here](https://github.com/googlefonts/noto-fonts).

At some point I may be able to post a link to the JSON dumps from Django for the entire constructed database, but the file is >250MB and would need to be hosted elsewhere.
