# your_app_name/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, NoteViewSet, TagViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'tags', TagViewSet)

from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', include(router.urls)),
]
