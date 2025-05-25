# your_app_name/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from django.contrib.auth import views as auth_views

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'tags', TagViewSet)
router.register(r'note-images', NoteImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('ai-chat/', ai_chat_view, name='ai-chat'),
]
