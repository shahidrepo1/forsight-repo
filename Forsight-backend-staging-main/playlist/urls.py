from django.urls import path
from playlist.views import (
                            playlist, 
                            create_playlist, 
                            delete_playlist,
                            update_playlist
                            )
urlpatterns = [

    path('', playlist, name='playlist'),
    path('create/', create_playlist, name='create_playlist'),
    path('delete/<int:pk>/', delete_playlist, name='delete_playlist'),
    path('update/<int:pk>/', update_playlist, name='update_playlist'),
    
    ]