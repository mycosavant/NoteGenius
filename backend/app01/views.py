# your_app_name/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import User, Note, Tag
from .serializers import UserSerializer, NoteSerializer, TagSerializer

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

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer