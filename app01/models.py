

from django.db import models

class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # 密碼通常需要加密儲存，後續可使用 Django 的認證系統
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.email

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Note(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()  # 支援 Markdown 格式，使用 TextField 儲存
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='notes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    translated_content = models.TextField(blank=True, null=True)  # AI 翻譯後的內容（英文）
    summary = models.TextField(blank=True, null=True)             # AI 生成的摘要
    rewritten_content = models.TextField(blank=True, null=True)   # AI 改寫後的版本

    def __str__(self):
        return self.title