from rest_framework import serializers 

from playlist.models import Playlist
from configurator.serializers import TargetKeywordSerializer, TargetProfileSerializer

class PlaylistSerializer(serializers.ModelSerializer):
    keywords = TargetKeywordSerializer(many=True)
    profiles = TargetProfileSerializer(many=True) 
    class Meta:
        model = Playlist
        exclude = ['user']