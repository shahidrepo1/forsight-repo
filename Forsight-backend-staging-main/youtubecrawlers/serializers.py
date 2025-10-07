from youtubecrawlers.models import TargetYoutubeProfile, TargetYoutubeProfileVideo
from rest_framework import serializers
from django.conf import settings

class TargetYoutubeProfileSerializer(serializers.ModelSerializer):
    targetYoutubeProfileId = serializers.IntegerField(source='id')
    channelSubscribersCount= serializers.SerializerMethodField()
    channelVideoCount = serializers.SerializerMethodField()
    channelViewCount = serializers.SerializerMethodField()

    class Meta:
        model = TargetYoutubeProfile
        exclude = ['id','profile','keyword']

    def humanize_number(self, value):
        if value is None:
            return None
        if value >= 1_000_000:
            return f'{value // 1_000_000}M'
        elif value >= 1_000:
            return f'{value // 1_000}K'
        return str(value)
    
    def get_channelSubscribersCount(self, obj):
        return self.humanize_number(obj.channelSubscribersCount)
    
    def get_channelVideoCount(self, obj):
        return self.humanize_number(obj.channelVideoCount)
    
    def get_channelViewCount(self, obj):
        return self.humanize_number(obj.channelViewCount)
    


class TargetYoutubeProfileVideoSerializer(serializers.ModelSerializer):
    targetYoutubeProfile = TargetYoutubeProfileSerializer()
    ytRecordDbId = serializers.IntegerField(source='id')
    uniqueIdentifier = serializers.SerializerMethodField()
    platform = serializers.CharField(default='youtube')
    videoViewCount = serializers.SerializerMethodField()


    class Meta:
        model = TargetYoutubeProfileVideo
        fields = '__all__'
        # exclude = ['videoLink','videoThumbnail']

    def humanize_number(self, value):
        if value is None:
            return None
        if value >= 1_000_000:
            return f'{value // 1_000_000}M'
        elif value >= 1_000:
            return f'{value // 1_000}K'
        else:
            return str(value)
    
    def get_videoViewCount(self, obj):
        return self.humanize_number(obj.videoViewCount)
    
    def get_channelSubscribers(self, obj):
        return self.humanize_number(obj.targetYoutubeProfile.channelSubscribers)
    
    def get_channelVideoCount(self, obj):
        return self.humanize_number(obj.targetYoutubeProfile.channelVideoCount)
    
    def get_channelViewCount(self, obj):
        return self.humanize_number(obj.targetYoutubeProfile.channelViewCount)
    
    def get_uniqueIdentifier(self, obj):
        if obj.targetYoutubeProfile.profile is not None:
            return obj.targetYoutubeProfile.profile.platform.name+"-"+ str(obj.id)
        if obj.targetYoutubeProfile.keyword is not None:
            platforms = obj.targetYoutubeProfile.keyword.platforms.all()
            for platform in platforms:
                if platform.name == "youtube":
                    return platform.name+"-"+ str(obj.id)
    