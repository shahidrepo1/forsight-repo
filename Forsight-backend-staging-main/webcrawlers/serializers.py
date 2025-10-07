from rest_framework import serializers
from django.conf import settings
from webcrawlers.models import TargetWebProfile, TargetWebProfileArticle


class TargetWebProfileSerializer(serializers.ModelSerializer):
    targetWebProfileId = serializers.IntegerField(source='id')
    class Meta:
        model = TargetWebProfile
        exclude = ['id','Profile','keyword']

class TargetWebProfileArticleSerializer(serializers.ModelSerializer):
    targetWebProfile = TargetWebProfileSerializer()
    webRecordDbId = serializers.IntegerField(source='id')
    uniqueIdentifier = serializers.SerializerMethodField()
    platform = serializers.CharField(default='web')
    
    
    class Meta:
        model = TargetWebProfileArticle
        exclude = ['id']

    
    def get_uniqueIdentifier(self, obj):
        if obj.targetWebProfile.Profile is not None:
            return obj.targetWebProfile.Profile.platform.name+"-"+ str(obj.id)
        if obj.targetWebProfile.keyword is not None:
            platforms = obj.targetWebProfile.keyword.platforms.all()
            for platform in platforms:
                if platform.name == "web":
                    return platform.name+"-"+ str(obj.id)
    
    