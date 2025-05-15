from django.db import migrations
from faker import Faker
from django.utils import timezone
from django.contrib.auth.hashers import make_password  # 導入 make_password
from app01.models import User, Note, Tag

fake = Faker()

def create_fake_data(apps, schema_editor):
    # 創建或獲取 Tag
    tag1, created = Tag.objects.get_or_create(name="Programming")
    tag2, created = Tag.objects.get_or_create(name="Django")
    tag3, created = Tag.objects.get_or_create(name="Python")

    # 創建假資料的 User
    for _ in range(10):
        user = User.objects.create(
            username=fake.user_name(),
            email=fake.email(),
            password=make_password("password123")  # 加密密碼
        )
        user.save()

        # 創建假資料的 Note
        for _ in range(3):
            note = Note.objects.create(
                user=user,
                title=fake.sentence(),
                content=fake.text(),
                created_at=timezone.now(),
            )
            note.tags.add(tag1, tag2, tag3)
    
    print("Fake data inserted successfully!")

class Migration(migrations.Migration):
    dependencies = [
        ('app01', '0003_tag_remove_note_category_alter_note_options_and_more'),
    ]

    operations = [
        migrations.RunPython(create_fake_data),
    ]