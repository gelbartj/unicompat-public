from django.urls import path
from .views import GetGlyph, GetOSFontWithGlyph, GetSequence, \
    GetFontWithGlyph, GetWholeBlock, GetOSFontWithSequence, GetSearchResults, \
        GetLuckySearchResults

urlpatterns = [
    path('api/glyph/<slug>/fonts/<name>/', GetFontWithGlyph.as_view()),
    path('api/glyph/<slug>/fonts/', GetFontWithGlyph.as_view()),
    path('api/glyph/<slug>/', GetGlyph.as_view()),
    path('api/luckySearch/<searchTerm>/', GetLuckySearchResults.as_view()),
    path('api/search/<searchTerm>/', GetSearchResults.as_view()),
    path('api/glyphcp/<int:glyph>/fontsbyos/<int:os>/',
         GetOSFontWithGlyph.as_view()),
    path('api/glyphcp/<int:glyph>/fonts/<name>/', GetFontWithGlyph.as_view()),
    path('api/glyphcp/<int:glyph>/fonts/', GetFontWithGlyph.as_view()),
    path('api/block/<blockSlug>/', GetWholeBlock.as_view()),
    path('api/sequence/<sequencePoints>/', GetSequence.as_view()),
    path('api/sequencepk/<int:sequencepk>/fontsbyos/<int:os>/',
         GetOSFontWithSequence.as_view()),
]
