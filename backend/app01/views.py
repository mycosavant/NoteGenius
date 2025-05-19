# your_app_name/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import User, Note, Tag
from .serializers import UserSerializer, NoteSerializer, TagSerializer

from .utils import call_gemini#gemini_api


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all().order_by('-created_at')
    serializer_class = NoteSerializer

    @action(detail=False, methods=['get'], url_path='by-tag/(?P<tag_name>[^/.]+)')
    def notes_by_tag(self, request, tag_name=None):
        tag = get_object_or_404(Tag, name=tag_name)
        notes = self.queryset.filter(tags=tag)
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        query = request.query_params.get('title', '')
        notes = self.queryset.filter(title__icontains=query)
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)
    #新增：Gemini 改寫功能
    @action(detail=True, methods=['post'], url_path='rewrite')
    def rewrite(self, request, pk=None):
        print(" 進入 rewrite()")
        note = self.get_object()
        print("原始內容：", note.content)

        prompt = f"請幫我改寫以下筆記內容，使其更清楚流暢：\n{note.content}"

        try:
            rewritten = call_gemini(prompt)
        except Exception as e:
            print(" Gemini 呼叫失敗：", e)
            return Response({"error": str(e)}, status=500)

        return Response({
        "note_id": note.id,
        "original": note.content,
        "rewritten": rewritten
    })
    @action(detail=True, methods=['post'], url_path='summarize')
    def summarize(self, request, pk=None):
        note = self.get_object()
        prompt = f"請將以下內容進行摘要（用中文寫出1~3句總結）：\n{note.content}"
        result = call_gemini(prompt)
        return Response({
            "note_id": note.id,
            "summary": result
        })

    @action(detail=True, methods=['post'], url_path='translate')
    def translate(self, request, pk=None):
        note = self.get_object()
        lang = request.data.get("lang", "en")  # "en" = 翻成英文, "zh" = 翻成中文
        if lang == "zh":
            prompt = f"請將以下英文翻譯為中文：\n{note.content}"
        else:
            prompt = f"Please translate the following Chinese text into English:\n{note.content}"
        result = call_gemini(prompt)
        return Response({
            "note_id": note.id,
            "translated_to": "Chinese" if lang == "zh" else "English",
            "result": result
        })

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer