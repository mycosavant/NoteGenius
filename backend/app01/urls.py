from django.urls import path
from . import views

urlpatterns = [
    # CRUD for Note
    path('notes/',                   views.list_notes,    name='list_notes'),
    path('notes/create/',            views.create_note,   name='create_note'),
    path('notes/<int:note_id>/',     views.retrieve_note, name='retrieve_note'),
    path('notes/<int:note_id>/update/', views.update_note, name='update_note'),
    path('notes/<int:note_id>/delete/', views.delete_note, name='delete_note'),
    # --- 新增的查詢功能 ---
    # 以 tag 查筆記
    path('notes/tag/<str:tag_name>/',       views.notes_by_tag, name='notes_by_tag'),
    # 以 title 關鍵字模糊查筆記
    path('notes/search/',                   views.search_notes, name='search_notes'),
 ]

