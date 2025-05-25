from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from .models import *
from .serializers import *
from .utils import *

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import permissions
from .permissions import IsSessionAuthenticated 
# ✅ 使用明文密碼登入
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': '請提供帳號與密碼'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        if user.password == password:  # 明文比對
            request.session['user_id'] = user.id  # 記錄 session
            return Response({'message': '登入成功', 'user_id': user.id})
        else:
            return Response({'error': '密碼錯誤'},
                            status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': '使用者不存在'}, status=status.HTTP_404_NOT_FOUND)


# ✅ 登出
@api_view(['POST'])
def logout_view(request):
    request.session.flush()  # 清除所有 session
    return Response({'message': '已登出'})


@api_view(['POST'])
def ai_chat_view(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({"error": "未登入"}, status=401)

    prompt = request.data.get("prompt", "").strip()
    note_id = request.data.get("note_id")

    result = handle_ai_chat(user_id, prompt, note_id)

    if "error" in result:
        return Response({"error": result["error"]},
                        status=result.get("status", 500))

    return Response(result, status=result["status"])


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'], url_path='me')
    def get_current_user(self, request):
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': '未登入'}, status=401)

        user = get_object_or_404(User, id=user_id)
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='query-password')
    def query_password(self, request):
        username = request.data.get('username')
        email = request.data.get('email')

        if not username or not email:
            return Response({'error': '請提供 username 和 email'}, status=400)

        try:
            user = self.queryset.get(username=username, email=email)
        except User.DoesNotExist:
            return Response({'error': '帳號或是email錯誤'}, status=404)

        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = request.data
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        # ✅ 所有驗證都集中在 view
        error_dict = {}

        # ➤ 檢查 username 是否重複
        if username and User.objects.filter(username=username).exists():
            error_dict['username'] = '帳號已存在，請使用其他帳號名稱。'

        # ➤ 檢查 email 是否重複
        if email and User.objects.filter(email=email).exists():
            error_dict['email'] = 'Email 已存在，請使用其他 Email。'

        # ➤ 檢查密碼長度
        if not password or len(password) < 6:
            error_dict[
                'password'] = "Password must be at least 6 characters long."

        # ➤ 如果有任何錯誤，直接回傳
        if error_dict:
            raise ValidationError(error_dict)

        # ✅ 全部通過才進行序列化與儲存
        serializer = self.get_serializer(data=data)

        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            raise ValidationError({"email": "帳號或 Email 已存在（資料庫層驗證）"})


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all().order_by('-created_at')
    serializer_class = NoteSerializer

    def get_queryset(self):
        user_id = self.request.session.get('user_id')
        if user_id:
            return Note.objects.filter(user_id=user_id).order_by('-created_at')
        return Note.objects.none()

    def perform_create(self, serializer):
        user_id = self.request.session.get('user_id')
        if not user_id:
            raise ValidationError("使用者未登入")
        user = get_object_or_404(User, id=user_id)
        serializer.save(
            user=user)  # ✅ 改為傳 user instance，搭配 NoteSerializer 裡的 user 欄位

    def perform_update(self, serializer):
        user_id = self.request.session.get('user_id')
        if serializer.instance.user_id != user_id:
            raise ValidationError("無權限修改此筆記")
        serializer.save()  # ✅ 保留原始 user 不變

    def perform_destroy(self, instance):
        user_id = self.request.session.get('user_id')
        if instance.user_id != user_id:
            raise ValidationError("無權限刪除此筆記")
        instance.delete()


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()  # ✅ 加上這行
    serializer_class = TagSerializer

    def get_queryset(self):
        user_id = self.request.session.get('user_id')
        if user_id:
            return Tag.objects.filter(user_id=user_id).order_by('name')
        return Tag.objects.none()

    def perform_create(self, serializer):
        user_id = self.request.session.get('user_id')
        if not user_id:
            raise ValidationError("使用者未登入")
        serializer.save(user_id=user_id)

    def perform_update(self, serializer):
        user_id = self.request.session.get('user_id')
        if serializer.instance.user_id != user_id:
            raise ValidationError("無權限修改此標籤")
        serializer.save()

    def perform_destroy(self, instance):
        user_id = self.request.session.get('user_id')
        if instance.user_id != user_id:
            raise ValidationError("無權限刪除此標籤")

        # ✅ 移除所有筆記中的這個標籤
        notes_with_tag = Note.objects.filter(tags=instance)
        for note in notes_with_tag:
            note.tags.remove(instance)

        instance.delete()

# NoteImageViewSet 用於處理筆記中的圖片上傳和管理
from .permissions import IsSessionAuthenticated  # ← 匯入這個

class NoteImageViewSet(viewsets.ModelViewSet):
    queryset = NoteImage.objects.all()
    serializer_class = NoteImageSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsSessionAuthenticated]  # ✅ 使用自訂 session 權限檢查

    def perform_create(self, serializer):
        user_id = self.request.session.get('user_id')
        note_id = self.request.data.get('note')
        if not user_id or not note_id:
            raise ValidationError("缺少使用者或筆記 ID")
        note = get_object_or_404(Note, id=note_id, user_id=user_id)
        serializer.save(note=note)
