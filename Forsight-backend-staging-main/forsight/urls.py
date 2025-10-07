from django.contrib import admin
from django.urls import path,include
from configurator.views import search,checkStatus
from django.conf import settings
from django.conf.urls.static import static
from youtubecrawlers.views import DeleteLatestVideosPerProfileView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/',include('account.urls')),
    path('api/configurator/',include('configurator.urls')),
    path('api/xcrawlers/',include('xcrawlers.urls')),
    path('api/visualizations/',include('visualizations.urls')),
    path('api/search/',search,name='search'),
    path('api/checkStatus/',checkStatus,name='checkStatus'),
    path('api/reports/',include('reports.urls')),
    path('api/playlist/',include('playlist.urls')),
    path('', include('django_prometheus.urls')),  # This adds /metrics endpoint

    path('delete-latest-videos/', DeleteLatestVideosPerProfileView.as_view(), name='delete-latest-videos'),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
