from django.urls import path
from xcrawlers.views import (
    getTaregtProfiles,
    )


urlpatterns = [
    path('getConfiguredProfilesData/',getTaregtProfiles,name='getTaregtProfiles'),
    
]
