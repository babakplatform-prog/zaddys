from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # THIS IS THE MAGIC LINE: It tells Django to send all /api/ requests to your menu app!
    path('api/', include('menu.urls')), 
]

# This allows Django to serve your uploaded food images in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)