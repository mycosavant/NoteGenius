# your_app_name/serializers.py
from rest_framework import serializers
from .models import User, Note, Tag, NoteTag


class TagSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tag
        fields = ['id', 'name']


from rest_framework import serializers
from .models import User, Note, Tag, NoteTag


class TagSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tag
        fields = ['id', 'name']


class NoteSerializer(serializers.ModelSerializer):
    # ✅ 回傳用：完整標籤物件
    tags = TagSerializer(many=True, read_only=True)

    # ✅ 寫入用：標籤名稱陣列
    tag_names = serializers.SlugRelatedField(many=True,
                                             slug_field='name',
                                             queryset=Tag.objects.all(),
                                             write_only=True,
                                             source='tags')

    # user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    parent = serializers.PrimaryKeyRelatedField(queryset=Note.objects.all(),
                                                allow_null=True,
                                                required=False)

    class Meta:
        model = Note
        fields = [
            'id', 'user', 'title', 'content', 'parent', 'tags', 'tag_names',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        note = Note.objects.create(**validated_data)
        note.tags.clear()
        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            NoteTag.objects.create(note=note, tag=tag)
        return note

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags_data is not None:
            instance.note_tags.all().delete()
            for tag_name in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                NoteTag.objects.create(note=instance, tag=tag)
        return instance


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'created_at']
        read_only_fields = ['id', 'created_at']
