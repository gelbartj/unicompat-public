# unicompat

This repo contains the source code for [https://unicompat.org].

* Backend: Django + Django REST Framework + Postgres
* Frontend: React + Typescript

The `database-builder` folder contains the Python scripts that were used to scrape the Unicode consortium's data files located [here](https://www.unicode.org/Public/UCD/latest/ucdxml/) and [here](https://unicode.org/Public/emoji/13.0/), as well as the code used to generate PNG files for roughly 40,000 glyphs.