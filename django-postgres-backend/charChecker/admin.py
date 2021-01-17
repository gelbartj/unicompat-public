from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import Sequence, Variant, UnicodeVersion, Software, UnicodeBlock, OS, Font, Browser, Glyph

modelList = [Sequence, Variant, UnicodeVersion,
             Software, UnicodeBlock, OS, Font, Browser, Glyph]


class GlyphAdmin(admin.ModelAdmin):
    exclude = ['variants']
    list_filter = ('isEmoji', 'unicodeBlock')
    search_fields = ('officialName', 'codePoint', 'slug')


class FontAdmin(admin.ModelAdmin):
    #exclude = ['glyphs']
    search_fields = ('name', 'fileName', 'style', 'slug')
    list_filter = ('style',)
    #ordering = ('name', 'style')
    #readonly_fields = ['glyphs']

    def get_object(self, request, object_id, s):
        # Hook obj for use in formfield_for_manytomany
        self.obj = super(FontAdmin, self).get_object(request, object_id)
    # print ("Got object:", self.obj)
        return self.obj

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "glyphs":
            kwargs["queryset"] = self.obj.glyphs
        if db_field.name == "sequences":
            kwargs["queryset"] = self.obj.sequences
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def get_form(self, *args, **kwargs):
        form = super(FontAdmin, self).get_form(*args, **kwargs)
        form.base_fields["glyphs"].disabled = True
        form.base_fields["sequences"].disabled = True
        return form


class SequenceAdmin(admin.ModelAdmin):
    #exclude = ['glyphs']
    search_fields = ('officialName',)
    #ordering = ('name', 'style')
    #readonly_fields = ['glyphs']

    def get_object(self, request, object_id, s):
        # Hook obj for use in formfield_for_manytomany
        self.obj = super(SequenceAdmin, self).get_object(request, object_id)
    # print ("Got object:", self.obj)
        return self.obj

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "glyphs":
            kwargs["queryset"] = self.obj.glyphs
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def get_form(self, *args, **kwargs):
        form = super(SequenceAdmin, self).get_form(*args, **kwargs)
        form.base_fields["glyphs"].disabled = True

        return form

    def save_related(self, request, form, formsets, change):
        #super(SequenceAdmin, self).save_related(request, form, formsets, change)
        form.instance.glyphs.set(self.obj.glyphs.all())


class OSAdmin(admin.ModelAdmin):
    ordering = ('family', 'version')


class UnicodeBlockAdmin(admin.ModelAdmin):
    search_fields = ('name',)


for model in modelList:
    if model == Glyph:
        admin.site.register(model, GlyphAdmin)
    elif model == Font:
        admin.site.register(model, FontAdmin)
    elif model == OS:
        admin.site.register(model, OSAdmin)
    elif model == UnicodeBlock:
        admin.site.register(model, UnicodeBlockAdmin)
    elif model == Sequence:
        admin.site.register(model, SequenceAdmin)
    else:
        admin.site.register(model)
