from django.urls import path
from . import views

urlpatterns = [
    path('add_user/', views.add_user),
    path('add_category/', views.add_category),
    path('add_note/', views.add_note),
    path('delete_note/', views.delete_note),
    # 移除 path('', views.index)，因為根路徑已在 Test/urls.py 中處理
    #ai api
    path('note/<int:note_id>/translate/', views.translate_note, name='note_translate'),
    path('note/<int:note_id>/summarize/', views.summarize_note, name='note_summarize'),
    path('note/<int:note_id>/rewrite/', views.rewrite_note, name='note_rewrite'),
]
