import json
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.db.models import Q

from .models import User, Note, Tag

def index(request):
    return HttpResponse("Welcome to the Note API")

# 公用函數
def note_to_json(note):
    return {
        "id": note.id,
        "user_id": note.user_id,
        "title": note.title,
        "content": note.content,
        "parent_id": note.parent_id,
        "tags": [t.name for t in note.tags.all()],
        "created_at": note.created_at.isoformat(),
    }

def update_note_tags(note, tags_data):
    if tags_data:
        note.tags.clear()
        for name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=name)
            note.tags.add(tag)

# Note CRUD
@csrf_exempt
@require_http_methods(["POST"])
def create_note(request):
    data = json.loads(request.body or "{}")
    user = get_object_or_404(User, id=data.get("user_id"))
    note = Note.objects.create(
        user=user,
        title=data.get("title", ""),
        content=data.get("content", ""),
        parent_id=data.get("parent_id")
    )
    update_note_tags(note, data.get("tags"))
    return JsonResponse(note_to_json(note), status=201)

@csrf_exempt
@require_http_methods(["GET"])
def list_notes(request):
    qs = Note.objects.all().order_by("-created_at")
    data = [note_to_json(n) for n in qs]
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_http_methods(["GET"])
def retrieve_note(request, note_id):
    n = get_object_or_404(Note, id=note_id)
    return JsonResponse(note_to_json(n))

@csrf_exempt
@require_http_methods(["PUT"])
def update_note(request, note_id):
    n = get_object_or_404(Note, id=note_id)
    data = json.loads(request.body or "{}")
    n.title = data.get("title", n.title)
    n.content = data.get("content", n.content)
    n.parent_id = data.get("parent_id", n.parent_id)
    n.save()
    update_note_tags(n, data.get("tags"))
    return JsonResponse(note_to_json(n))

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_note(request, note_id):
    n = get_object_or_404(Note, id=note_id)
    n.delete()
    return HttpResponse(status=204)

@csrf_exempt
@require_http_methods(["GET"])
def notes_by_tag(request, tag_name):
    tag = get_object_or_404(Tag, name=tag_name)
    notes = tag.notes.all().order_by("-created_at")
    data = [note_to_json(n) for n in notes]
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_http_methods(["GET"])
def search_notes(request):
    q = request.GET.get("title", "")
    notes = Note.objects.filter(title__icontains=q).order_by("-created_at")
    data = [note_to_json(n) for n in notes]
    return JsonResponse(data, safe=False)

# User CRUD
@csrf_exempt
@require_http_methods(["GET"])
def list_users(request):
    users = User.objects.all()
    data = [{"id": u.id, "username": u.username, "email": u.email or ""} for u in users]
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_http_methods(["POST"])
def create_user(request):
    data = json.loads(request.body or "{}")
    username = data.get("username")
    password = data.get("password")
    email = data.get("email", "")

    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)

    user = User.objects.create(
        username=username,
        password=make_password(password),
        email=email
    )
    return JsonResponse({"id": user.id, "username": user.username, "email": user.email}, status=201)

@csrf_exempt
@require_http_methods(["GET"])
def retrieve_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    return JsonResponse({"id": user.id, "username": user.username, "email": user.email or ""})

@csrf_exempt
@require_http_methods(["PUT"])
def update_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    data = json.loads(request.body or "{}")
    user.username = data.get("username", user.username)
    if "email" in data:
        user.email = data.get("email", user.email)
    user.save()
    return JsonResponse({"id": user.id, "username": user.username, "email": user.email})

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.delete()
    return HttpResponse(status=204)

# Tag CRUD
@csrf_exempt
@require_http_methods(["GET"])
def list_tags(request):
    tags = Tag.objects.all()
    data = [{"name": t.name} for t in tags]
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_http_methods(["POST"])
def create_tag(request):
    data = json.loads(request.body or "{}")
    name = data.get("name")
    if not name:
        return JsonResponse({"error": "Tag name is required"}, status=400)
    tag, created = Tag.objects.get_or_create(name=name)
    return JsonResponse({"name": tag.name}, status=201 if created else 200)

@csrf_exempt
@require_http_methods(["GET"])
def tag_detail(request, tag_name):
    tag = get_object_or_404(Tag, name=tag_name)
    return JsonResponse({"name": tag.name})

@csrf_exempt
@require_http_methods(["PUT"])
def update_tag(request, tag_name):
    tag = get_object_or_404(Tag, name=tag_name)
    data = json.loads(request.body or "{}")
    new_name = data.get("name")
    if not new_name:
        return JsonResponse({"error": "New tag name is required"}, status=400)
    tag.name = new_name
    tag.save()
    return JsonResponse({"name": tag.name})

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_tag(request, tag_name):
    tag = get_object_or_404(Tag, name=tag_name)
    tag.delete()
    return HttpResponse(status=204)

@csrf_exempt
@require_http_methods(["GET"])
def retrieve_tag(request, tag_id):
    tag = get_object_or_404(Tag, id=tag_id)
    return JsonResponse({"id": tag.id, "name": tag.name})