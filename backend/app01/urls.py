# your_app_name/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, NoteViewSet, TagViewSet
from django.contrib.auth import views as auth_views
from .views import login_view, logout_view  # ← 加在 import 區塊

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'tags', TagViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),  # ✅ 新增
    path('logout/', logout_view, name='logout'),  # ✅ 新增
]
