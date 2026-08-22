from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# ADD THESE 3 LINES TO RENAME YOUR ADMIN PANEL
admin.site.site_header = "Zaddys Creamery and Grills Admin Panel"
admin.site.site_title = "Zaddys Admin Portal"
admin.site.index_title = "Welcome to Zaddys Control Panel"



def api_status(request):
    return JsonResponse({
        'service': 'ZADDYS API',
        'status': 'ok',
        'api': '/api/',
    })


urlpatterns = [
    path('', api_status, name='api-status'),
    path('admin/', admin.site.urls),
    
    # THIS IS THE MAGIC LINE: It tells Django to send all /api/ requests to your menu app!
    path('api/', include('menu.urls')), 
]

# This allows Django to serve your uploaded food images in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)