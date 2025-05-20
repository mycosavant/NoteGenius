# your_app_name/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import User, Note, Tag
from .serializers import UserSerializer, NoteSerializer, TagSerializer

from .utils import call_gemini  # 你自己的 Gemini AI 工具

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all().order_by('-created_at')
    serializer_class = NoteSerializer

    # 根據 tag 名稱查找 note
    @action(detail=False, methods=['get'], url_path='by-tag/(?P<tag_name>[^/.]+)')
    def notes_by_tag(self, request, tag_name=None):
        tag = get_object_or_404(Tag, name=tag_name)
        notes = self.queryset.filter(tags=tag)
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)

    # 根據 title 查詢 note
    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        query = request.query_params.get('title', '')
        notes = self.queryset.filter(title__icontains=query)
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)

    # ✅ 新增：單筆 note 的 Gemini AI 功能
    @action(detail=True, methods=['post'], url_path='ai')
    def ai(self, request, pk=None):
        note = self.get_object()
        user_prompt = request.data.get("prompt", "").strip()

        if not user_prompt:
            return Response({"error": "請提供 prompt 文字"}, status=400)

        full_prompt = f"{user_prompt}\n\n以下是筆記內容：\n{note.content}"

        try:
            result = call_gemini(full_prompt)
        except Exception as e:
            print("Gemini 呼叫失敗：", e)
            return Response({"error": str(e)}, status=500)

        return Response({
            "note_id": note.id,
            "prompt": user_prompt,
            "result": result
        })


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
