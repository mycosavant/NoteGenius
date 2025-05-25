from rest_framework import serializers 
from .models import User, Note, Tag, NoteTag, NoteImage  # ✅ 加入 NoteImage


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class NoteImageSerializer(serializers.ModelSerializer):  # ✅ 新增 NoteImage 序列化器
    class Meta:
        model = NoteImage
        fields = ['id', 'image', 'uploaded_at']


class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(child=serializers.CharField(), write_only=True)
    parent = serializers.PrimaryKeyRelatedField(queryset=Note.objects.all(), allow_null=True, required=False)
    images = NoteImageSerializer(many=True, read_only=True)  # ✅ 額外加上筆記中的圖片欄位

    class Meta:
        model = Note
        fields = [
            'id', 'user', 'title', 'content', 'parent', 'tags', 'tag_names',
            'images',  # ✅ 確保圖片資料也包含在筆記的輸出中
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        user = validated_data['user']
        note = Note.objects.create(**validated_data)
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(user=user, name=name)
            NoteTag.objects.create(note=note, tag=tag)
        return note

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            instance.note_tags.all().delete()
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(user=instance.user, name=name)
                NoteTag.objects.create(note=instance, tag=tag)
        return instance


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'created_at']
        read_only_fields = ['id', 'created_at']
