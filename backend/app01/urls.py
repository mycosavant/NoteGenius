from django.urls import path
from . import views
import os
from dotenv import load_dotenv

# 載入 .env
load_dotenv()

# 環境變數檢查
required_env_vars = ['API_PREFIX_NOTES', 'API_PREFIX_USERS', 'API_PREFIX_TAGS']
missing_vars = [var for var in required_env_vars if os.getenv(var) is None]
if missing_vars:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

NOTES_PREFIX = os.getenv('API_PREFIX_NOTES', 'notes')
USERS_PREFIX = os.getenv('API_PREFIX_USERS', 'users')
TAGS_PREFIX = os.getenv('API_PREFIX_TAGS', 'tags')

urlpatterns = [
    # CRUD for Note
    path(f'{NOTES_PREFIX}/', views.list_notes, name='list_notes'),
    path(f'{NOTES_PREFIX}/create/', views.create_note, name='create_note'),
    path(f'{NOTES_PREFIX}/<int:note_id>/', views.retrieve_note, name='retrieve_note'),
    path(f'{NOTES_PREFIX}/<int:note_id>/update/', views.update_note, name='update_note'),
    path(f'{NOTES_PREFIX}/<int:note_id>/delete/', views.delete_note, name='delete_note'),
    path(f'{NOTES_PREFIX}/tag/<str:tag_name>/', views.notes_by_tag, name='notes_by_tag'),
    path(f'{NOTES_PREFIX}/search/', views.search_notes, name='search_notes'),

    # CRUD for User
    path(f'{USERS_PREFIX}/', views.list_users, name='list_users'),
    path(f'{USERS_PREFIX}/create/', views.create_user, name='create_user'),
    path(f'{USERS_PREFIX}/<int:user_id>/', views.retrieve_user, name='retrieve_user'),
    path(f'{USERS_PREFIX}/<int:user_id>/update/', views.update_user, name='update_user'),
    path(f'{USERS_PREFIX}/<int:user_id>/delete/', views.delete_user, name='delete_user'),

    # CRUD for Tag
    path(f'{TAGS_PREFIX}/', views.list_tags, name='list_tags'),
    path(f'{TAGS_PREFIX}/create/', views.create_tag, name='create_tag'),
    path(f'{TAGS_PREFIX}/<int:tag_id>/', views.retrieve_tag, name='retrieve_tag'),
    path(f'{TAGS_PREFIX}/<str:tag_name>/update/', views.update_tag, name='update_tag'),
    path(f'{TAGS_PREFIX}/<str:tag_name>/delete/', views.delete_tag, name='delete_tag'),
]