from django.db import models

class User(models.Model):
    username   = models.CharField(max_length=100, unique=True, verbose_name='使用者帳號')
    email      = models.EmailField(unique=True,      verbose_name='使用者郵箱')
    password   = models.CharField(max_length=128,    verbose_name='加密後的密碼')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='註冊時間')

    class Meta:
        db_table = 'users'
        verbose_name = '使用者'
        verbose_name_plural = '使用者'

    def __str__(self):
        return self.username


class Note(models.Model):
    user       = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notes',
        verbose_name='使用者'
    )
    # 自我關聯欄位 note_id（可用來實作子筆記或回覆），允許空值 #當初沒討論清楚 這邊似乎有點疑惑
    parent     = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='note_id',
        related_name='children',
        verbose_name='父筆記'
    )
    title      = models.CharField(max_length=200, verbose_name='筆記標題')
    content    = models.TextField(            verbose_name='筆記內容')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    # 多對多關聯
    tags       = models.ManyToManyField(
        'Tag',
        through='NoteTag',
        related_name='notes',
        verbose_name='標籤'
    )

    class Meta:
        db_table = 'notes'
        verbose_name = '筆記'
        verbose_name_plural = '筆記'

    def __str__(self):
        return self.title


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='標籤名稱')

    class Meta:
        db_table = 'tags'
        verbose_name = '標籤'
        verbose_name_plural = '標籤'

    def __str__(self):
        return self.name


class NoteTag(models.Model):
    note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,
        related_name='note_tags',
        verbose_name='筆記'
    )
    tag  = models.ForeignKey(
        Tag,
        on_delete=models.CASCADE,
        related_name='note_tags',
        verbose_name='標籤'
    )

    class Meta:
        db_table = 'note_tags'
        unique_together = (('note', 'tag'),)
        verbose_name = '筆記-標籤 關聯'
        verbose_name_plural = '筆記-標籤 關聯'

    def __str__(self):
        return f'{self.note.title} – {self.tag.name}'
