import json
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from .models import User, Note, Tag
def index(request):
    return HttpResponse("Welcome to the Note API")
@csrf_exempt
@require_http_methods(["POST"])
def create_note(request):
    """
    建立新筆記
    JSON BODY:
      {
        "user_id": 1,
        "title": "標題",
        "content": "內容",
        "parent_id": 2,         # 可選
        "tags": ["tag1","tag2"] # 可選
      }
    """
    data = json.loads(request.body or "{}")
    user = get_object_or_404(User, id=data.get("user_id"))
    note = Note.objects.create(
        user=user,
        title=data.get("title", ""),
        content=data.get("content", ""),
        parent_id=data.get("parent_id")
    )
    for name in data.get("tags", []):
        tag, _ = Tag.objects.get_or_create(name=name)
        note.tags.add(tag)
    return JsonResponse({
        "id": note.id,
        "user_id": note.user_id,
        "title": note.title,
        "content": note.content,
        "parent_id": note.parent_id,
        "tags": [t.name for t in note.tags.all()],
        "created_at": note.created_at,
    }, status=201)

@csrf_exempt
@require_http_methods(["GET"])
def list_notes(request):
    """
    列出所有筆記
    """
    qs = Note.objects.all().order_by("-created_at")
    data = [{
        "id": n.id,
        "user_id": n.user_id,
        "title": n.title,
        "content": n.content,
        "parent_id": n.parent_id,
        "tags": [t.name for t in n.tags.all()],
        "created_at": n.created_at,
    } for n in qs]
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_http_methods(["GET"])
def retrieve_note(request, note_id):
    """
    讀取單筆筆記
    """
    n = get_object_or_404(Note, id=note_id)
    return JsonResponse({
        "id": n.id,
        "user_id": n.user_id,
        "title": n.title,
        "content": n.content,
        "parent_id": n.parent_id,
        "tags": [t.name for t in n.tags.all()],
        "created_at": n.created_at,
    })

@csrf_exempt
@require_http_methods(["PUT"])
def update_note(request, note_id):
    """
    更新筆記（含標籤）
    JSON BODY 可只傳想改的欄位：
      {
        "title": "...",
        "content": "...",
        "parent_id": 3,
        "tags": ["new","list"]
      }
    """
    n = get_object_or_404(Note, id=note_id)
    data = json.loads(request.body or "{}")
    n.title     = data.get("title", n.title)
    n.content   = data.get("content", n.content)
    n.parent_id = data.get("parent_id", n.parent_id)
    n.save()
    if "tags" in data:
        n.tags.clear()
        for name in data["tags"]:
            tag, _ = Tag.objects.get_or_create(name=name)
            n.tags.add(tag)
    return JsonResponse({
        "id": n.id,
        "user_id": n.user_id,
        "title": n.title,
        "content": n.content,
        "parent_id": n.parent_id,
        "tags": [t.name for t in n.tags.all()],
        "created_at": n.created_at,
    })

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_note(request, note_id):
    """
    刪除筆記
    """
    n = get_object_or_404(Note, id=note_id)
    n.delete()
    return HttpResponse(status=204)


@csrf_exempt
@require_http_methods(["GET"])
def notes_by_tag(request, tag_name):
    """
    以標籤名稱查詢所有含該標籤的筆記
    URL 範例: GET /app01/notes/tag/python/
    """
    # 1. 取得 Tag，不存在自動 404
    tag = get_object_or_404(Tag, name=tag_name)
    # 2. 透過 related_name 拿到所有關聯的 Note
    notes = tag.notes.all().order_by("-created_at")
    data = [{
        "id":         n.id,
        "user_id":    n.user_id,
        "title":      n.title,
        "content":    n.content,
        "parent_id":  n.parent_id,
        "tags":       [t.name for t in n.tags.all()],
        "created_at": n.created_at,
    } for n in notes]
    return JsonResponse(data, safe=False)
@csrf_exempt
@require_http_methods(["GET"])
def search_notes(request):
    """
    以 title 關鍵字做模糊搜尋
    URL 範例: GET /app01/notes/search/?title=測試
    """
    q = request.GET.get("title", "")
    # __icontains 不分大小寫模糊比對
    notes = Note.objects.filter(title__icontains=q).order_by("-created_at")
    data = [{
        "id":         n.id,
        "user_id":    n.user_id,
        "title":      n.title,
        "content":    n.content,
        "parent_id":  n.parent_id,
        "tags":       [t.name for t in n.tags.all()],
        "created_at": n.created_at,
    } for n in notes]
    return JsonResponse(data, safe=False)