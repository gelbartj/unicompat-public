import re

notoFonts = ["NotoKufiArabic-Bold",
"NotoKufiArabic-Regular",
"NotoNaskhArabic-Bold",
"NotoNaskhArabic-Regular",
"NotoNaskhArabicUI-Bold",
"NotoNaskhArabicUI-Regular",
"NotoNastaliqUrdu-Regular",
"NotoSans-Bold",
"NotoSans-BoldItalic",
"NotoSans-Italic",
"NotoSans-Regular",
"NotoSansAdlam-Regular",
"NotoSansAdlamUnjoined-Regular",
"NotoSansAhom-Regular",
"NotoSansAnatolianHieroglyphs-Regular",
"NotoSansArmenian-Bold",
"NotoSansArmenian-Medium",
"NotoSansArmenian-Regular",
"NotoSansAvestan-Regular",
"NotoSansBalinese-Regular",
"NotoSansBamum-Regular",
"NotoSansBassaVah-Regular",
"NotoSansBatak-Regular",
"NotoSansBengali-Bold",
"NotoSansBengali-Medium",
"NotoSansBengali-Regular",
"NotoSansBengaliUI-Bold",
"NotoSansBengaliUI-Medium",
"NotoSansBengaliUI-Regular",
"NotoSansBhaiksuki-Regular",
"NotoSansBrahmi-Regular",
"NotoSansBuginese-Regular",
"NotoSansBuhid-Regular",
"NotoSansCanadianAboriginal-Regular",
"NotoSansCarian-Regular",
"NotoSansChakma-Regular",
"NotoSansCham-Bold",
"NotoSansCham-Regular",
"NotoSansCherokee-Regular",
"NotoSansCoptic-Regular",
"NotoSansCuneiform-Regular",
"NotoSansCypriot-Regular",
"NotoSansDeseret-Regular",
"NotoSansDevanagari-Bold",
"NotoSansDevanagari-Medium",
"NotoSansDevanagari-Regular",
"NotoSansDevanagariUI-Bold",
"NotoSansDevanagariUI-Medium",
"NotoSansDevanagariUI-Regular",
"NotoSansEgyptianHieroglyphs-Regular",
"NotoSansElbasan-Regular",
"NotoSansEthiopic-Bold",
"NotoSansEthiopic-Regular",
"NotoSansGeorgian-Bold",
"NotoSansGeorgian-Medium",
"NotoSansGeorgian-Regular",
"NotoSansGlagolitic-Regular",
"NotoSansGothic-Regular",
"NotoSansGujarati-Bold",
"NotoSansGujarati-Regular",
"NotoSansGujaratiUI-Bold",
"NotoSansGujaratiUI-Regular",
"NotoSansGurmukhi-Bold",
"NotoSansGurmukhi-Regular",
"NotoSansGurmukhiUI-Bold",
"NotoSansGurmukhiUI-Regular",
"NotoSansHanunoo-Regular",
"NotoSansHatran-Regular",
"NotoSansHebrew-Bold",
"NotoSansHebrew-Regular",
"NotoSansImperialAramaic-Regular",
"NotoSansInscriptionalPahlavi-Regular",
"NotoSansInscriptionalParthian-Regular",
"NotoSansJavanese-Regular",
"NotoSansKaithi-Regular",
"NotoSansKannada-Bold",
"NotoSansKannada-Regular",
"NotoSansKannadaUI-Bold",
"NotoSansKannadaUI-Regular",
"NotoSansKayahLi-Regular",
"NotoSansKharoshthi-Regular",
"NotoSansKhmer-Bold",
"NotoSansKhmer-Regular",
"NotoSansKhmerUI-Bold",
"NotoSansKhmerUI-Regular",
"NotoSansLao-Bold",
"NotoSansLao-Regular",
"NotoSansLaoUI-Bold",
"NotoSansLaoUI-Regular",
"NotoSansLepcha-Regular",
"NotoSansLimbu-Regular",
"NotoSansLinearA-Regular",
"NotoSansLinearB-Regular",
"NotoSansLisu-Regular",
"NotoSansLycian-Regular",
"NotoSansLydian-Regular",
"NotoSansMalayalam-Bold",
"NotoSansMalayalam-Medium",
"NotoSansMalayalam-Regular",
"NotoSansMalayalamUI-Bold",
"NotoSansMalayalamUI-Medium",
"NotoSansMalayalamUI-Regular",
"NotoSansMandaic-Regular",
"NotoSansManichaean-Regular",
"NotoSansMarchen-Regular",
"NotoSansMeeteiMayek-Regular",
"NotoSansMeroitic-Regular",
"NotoSansMiao-Regular",
"NotoSansMongolian-Regular",
"NotoSansMro-Regular",
"NotoSansMultani-Regular",
"NotoSansMyanmar-Bold",
"NotoSansMyanmar-Medium",
"NotoSansMyanmar-Regular",
"NotoSansMyanmarUI-Bold",
"NotoSansMyanmarUI-Medium",
"NotoSansMyanmarUI-Regular",
"NotoSansNKo-Regular",
"NotoSansNabataean-Regular",
"NotoSansNewTaiLue-Regular",
"NotoSansNewa-Regular",
"NotoSansOgham-Regular",
"NotoSansOlChiki-Regular",
"NotoSansOldItalic-Regular",
"NotoSansOldNorthArabian-Regular",
"NotoSansOldPermic-Regular",
"NotoSansOldPersian-Regular",
"NotoSansOldSouthArabian-Regular",
"NotoSansOldTurkic-Regular",
"NotoSansOriya-Bold",
"NotoSansOriya-Regular",
"NotoSansOriyaUI-Bold",
"NotoSansOriyaUI-Regular",
"NotoSansOsage-Regular",
"NotoSansOsmanya-Regular",
"NotoSansPahawhHmong-Regular",
"NotoSansPalmyrene-Regular",
"NotoSansPauCinHau-Regular",
"NotoSansPhagsPa-Regular",
"NotoSansPhoenician-Regular",
"NotoSansRejang-Regular",
"NotoSansRunic-Regular",
"NotoSansSamaritan-Regular",
"NotoSansSaurashtra-Regular",
"NotoSansSharada-Regular",
"NotoSansShavian-Regular",
"NotoSansSinhala-Bold",
"NotoSansSinhala-Medium",
"NotoSansSinhala-Regular",
"NotoSansSinhalaUI-Bold",
"NotoSansSinhalaUI-Medium",
"NotoSansSinhalaUI-Regular",
"NotoSansSoraSompeng-Regular",
"NotoSansSundanese-Regular",
"NotoSansSylotiNagri-Regular",
"NotoSansSymbols-Regular-Subsetted",
"NotoSansSymbols-Regular-Subsetted2",
"NotoSansSymbols-Regular",
"NotoSansSyriacEastern-Regular",
"NotoSansSyriacEstrangela-Regular",
"NotoSansSyriacWestern-Regular",
"NotoSansTagalog-Regular",
"NotoSansTagbanwa-Regular",
"NotoSansTaiLe-Regular",
"NotoSansTaiTham-Regular",
"NotoSansTaiViet-Regular",
"NotoSansTamil-Bold",
"NotoSansTamil-Medium",
"NotoSansTamil-Regular",
"NotoSansTamilUI-Bold",
"NotoSansTamilUI-Medium",
"NotoSansTamilUI-Regular",
"NotoSansTelugu-Bold",
"NotoSansTelugu-Regular",
"NotoSansTeluguUI-Bold",
"NotoSansTeluguUI-Regular",
"NotoSansThaana-Bold",
"NotoSansThaana-Regular",
"NotoSansThai-Bold",
"NotoSansThai-Regular",
"NotoSansThaiUI-Bold",
"NotoSansThaiUI-Regular",
"NotoSansTibetan-Bold",
"NotoSansTibetan-Regular",
"NotoSansTifinagh-Regular",
"NotoSansUI-Bold",
"NotoSansUI-BoldItalic",
"NotoSansUI-Italic",
"NotoSansUI-Regular",
"NotoSansUgaritic-Regular",
"NotoSansVai-Regular",
"NotoSansYi-Regular",
"NotoSerif-Bold",
"NotoSerif-BoldItalic",
"NotoSerif-Italic",
"NotoSerif-Regular",
"NotoSerifArmenian-Bold",
"NotoSerifArmenian-Regular",
"NotoSerifBengali-Bold",
"NotoSerifBengali-Regular",
"NotoSerifDevanagari-Bold",
"NotoSerifDevanagari-Regular",
"NotoSerifEthiopic-Bold",
"NotoSerifEthiopic-Regular",
"NotoSerifGeorgian-Bold",
"NotoSerifGeorgian-Regular",
"NotoSerifGujarati-Bold",
"NotoSerifGujarati-Regular",
"NotoSerifGurmukhi-Bold",
"NotoSerifGurmukhi-Regular",
"NotoSerifHebrew-Bold",
"NotoSerifHebrew-Regular",
"NotoSerifKannada-Bold",
"NotoSerifKannada-Regular",
"NotoSerifKhmer-Bold",
"NotoSerifKhmer-Regular",
"NotoSerifLao-Bold",
"NotoSerifLao-Regular",
"NotoSerifMalayalam-Bold",
"NotoSerifMalayalam-Regular",
"NotoSerifMyanmar-Bold",
"NotoSerifMyanmar-Regular",
"NotoSerifSinhala-Bold",
"NotoSerifSinhala-Regular",
"NotoSerifTamil-Bold",
"NotoSerifTamil-Regular",
"NotoSerifTelugu-Bold",
"NotoSerifTelugu-Regular",
"NotoSerifThai-Bold",
"NotoSerifThai-Regular",
"NotoSansKhmer-VF",
"NotoColorEmoji",
"NotoSansCJK-Regular",
"NotoSerifCJK-Regular",
"NotoColorEmojiCompat"
]

cjkRegex = r"Noto(Sans|Serif)CJK\w\w-Regular"


#for font in notoFonts:
fontObjs = Font.objects.filter(fileName__contains="CJK")
for fontObj in fontObjs:
    if re.match(cjkRegex, fontObj.fileName):
        print("Matched: ", fontObj)
        for os in OS.objects.filter(family="android"):
            if os.version >= "5.0" or os.version == "10.0" or os.version == "11.0":
                fontObj.incWithOS.add(os)
        fontObj.save()
