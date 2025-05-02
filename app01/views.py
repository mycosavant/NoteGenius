# app01/views.py
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from . import models
from .utils import translate_text, summarize_text, rewrite_text

def index(request):
    return HttpResponse("歡迎來到筆記管理系統！")

def add_user(request):
    email = "user1@example.com"
    password = "password123"
    # 如果這個 email 的使用者已經存在，就不再建立
    if models.User.objects.filter(email=email).exists():
        return HttpResponse("使用者已存在，跳過新增。")
    # 否則才建立
    models.User.objects.create(email=email, password=password)
    return HttpResponse("使用者添加成功！")

def add_category(request):
    user = models.User.objects.first()
    if not user:
        return HttpResponse("請先添加一個使用者！")
    name = "技術筆記"
    # 同理：先檢查相同 user + name 的分類是否存在
    if models.Category.objects.filter(user=user, name=name).exists():
        return HttpResponse("分類已存在，跳過新增。")
    models.Category.objects.create(name=name, user=user)
    return HttpResponse("分類添加成功！")

def add_note(request):
    user = models.User.objects.first()
    category = models.Category.objects.first()
    if not user or not category:
        return HttpResponse("請先添加一個使用者與分類！")
    title = "我的第一篇筆記"
    content = "# 這是一篇 Markdown 筆記\n- 項目 1\n- 項目 2"
    # 先檢查完全相同的 note 是否已經有了
    if models.Note.objects.filter(user=user, category=category, title=title).exists():
        return HttpResponse("筆記已存在，跳過新增。")
    models.Note.objects.create(
        title=title,
        content=content,
        category=category,
        user=user
    )
    return HttpResponse("筆記添加成功！")

def delete_note(request):
    models.Note.objects.filter(title="我的第一篇筆記").delete()
    return HttpResponse("筆記刪除成功！")

# 以下三個不動
def translate_note(request, note_id):
    note = get_object_or_404(models.Note, id=note_id)
    translated = translate_text(note.content)
    note.translated_content = translated
    note.save(update_fields=["translated_content"])
    return JsonResponse({"translated_content": translated})

def summarize_note(request, note_id):
    note = get_object_or_404(models.Note, id=note_id)
    summary = summarize_text(note.content)
    note.summary = summary
    note.save(update_fields=["summary"])
    return JsonResponse({"summary": summary})

def rewrite_note(request, note_id):
    note = get_object_or_404(models.Note, id=note_id)
    rewritten = rewrite_text(note.content)
    note.rewritten_content = rewritten
    note.save(update_fields=["rewritten_content"])
    return JsonResponse({"rewritten_content": rewritten})
