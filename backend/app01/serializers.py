# your_app_name/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, Note, Tag, NoteTag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class NoteSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Tag.objects.all(),
        required=False
    )
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    parent = serializers.PrimaryKeyRelatedField(queryset=Note.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Note
        fields = ['id', 'user', 'title', 'content', 'parent', 'tags', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        note = Note.objects.create(**validated_data)
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
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)