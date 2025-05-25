# Test/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('app01.urls')),  # API 端點在 /api/ 下
    path('', RedirectView.as_view(url='/api/', permanent=False)),  # 根路徑重定向到 /api/
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

