from django.contrib import admin
from .models import User, Note, Tag, NoteTag

admin.site.register(User)
admin.site.register(Tag)
admin.site.register(NoteTag)

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "created_at")
    list_filter  = ("user",)
    # 移除 filter_horizontal，改用預設 widget
    # 如有需要可改用 raw_id_fields = ("tags",)
    # raw_id_fields = ("tags",)
