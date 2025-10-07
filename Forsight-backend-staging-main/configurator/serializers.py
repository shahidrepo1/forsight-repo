from rest_framework import serializers
from configurator.models import Profile,Keyword, SchedularLog, CrawlLog
from xcrawlers.models import TargetXProfileTweet
from youtubecrawlers.models import TargetYoutubeProfileVideo
from webcrawlers.models import TargetWebProfileArticle
from django.utils.timezone import localtime
from rest_framework import serializers
from django.utils.timezone import localtime
from .models import SchedularLog
from configurator.models import CustomPrompt

class TargetProfileSerializer(serializers.ModelSerializer):
    targetProfileDbId = serializers.IntegerField(source='id')
    platform = serializers.StringRelatedField()
    dataCount = serializers.SerializerMethodField()
    class Meta:
        model = Profile
        exclude = ['profileName','user','createdAt','id']

    def get_dataCount(self, obj):
        xDataCount = TargetXProfileTweet.objects.filter(targetXProfile__profile=obj).count()
        youtubeDataCount = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__profile=obj).count()
        facebookDataCount = 0
        webDataCount = TargetWebProfileArticle.objects.filter(targetWebProfile__Profile=obj).count()
        totalDataCount = xDataCount + youtubeDataCount + facebookDataCount + webDataCount
        return totalDataCount
 

class TargetKeywordSerializer(serializers.ModelSerializer):
    targetKeywordDbId = serializers.IntegerField(source='id')
    platforms = serializers.SerializerMethodField()
    # dataCount = serializers.SerializerMethodField()
    # xDataCount = serializers.SerializerMethodField()
    # youtubeDataCount = serializers.SerializerMethodField()
    # facebookDataCount = serializers.SerializerMethodField()
    # webDataCount = serializers.SerializerMethodField()
    counts = serializers.SerializerMethodField()
    class Meta:
        model = Keyword
        exclude = ['user','createdAt','id','status']

    
    def get_platforms(self, obj):
        platforms = obj.platforms.all()
        platformNames = ['x', 'youtube', 'facebook', 'web']
        responseData = []

        if platforms:
            for platform in platforms:
                if platform.name.lower() in platformNames:
                    platformName = platform.name.lower()
                    platformStatus = obj.status
                    platformEnabled = True
                    data = {
                        'platform': platformName,
                        'status': platformStatus,
                        'enabled': platformEnabled
                    }
                    responseData.append(data)

        existingPlatforms = [data['platform'] for data in responseData]
        for platformName in platformNames:
            if platformName not in existingPlatforms:
                data = {
                    'platform': platformName,
                    'status': False,
                    'enabled': False
                }
                responseData.append(data)
        responseData = sorted(responseData, key=lambda x: platformNames.index(x['platform']))
        return responseData
    

    
    def get_counts(self, obj):
        xDataCount = TargetXProfileTweet.objects.select_related('targetXProfile').prefetch_related('targetXProfile__Keyword').filter(targetXProfile__Keyword=obj).count()
        youtubeDataCount = TargetYoutubeProfileVideo.objects.select_related('targetYoutubeProfile').prefetch_related('targetYoutubeProfile__keyword').filter(targetYoutubeProfile__keyword=obj).count()
        facebookDataCount = 0
        webDataCount = TargetWebProfileArticle.objects.select_related('targetWebProfile').prefetch_related('targetWebProfile__keyword').filter(targetWebProfile__keyword=obj).count()
        totalDataCount = xDataCount + youtubeDataCount + facebookDataCount + webDataCount
        counts = {
            'xDataCount': xDataCount,
            'youtubeDataCount': youtubeDataCount,
            'facebookDataCount': facebookDataCount,
            'webDataCount': webDataCount,
            'totalDataCount': totalDataCount
        }
        return counts
    

# class CrawlLogSerializer(serializers.ModelSerializer):
#     startedAt = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
#     finishedAt = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", allow_null=True)
#     processDuration = serializers.SerializerMethodField()

#     class Meta:
#         model = CrawlLog
#         fields = [
#             'id',
#             'profileName',
#             'profilePlatform',
#             'startedAt',
#             'finishedAt',
#             'status',
#             'recordsCrawled',
#             'errorMessage',
#             'processDuration'
#         ]

#     def get_processDuration(self, obj):
#         if obj.startedAt and obj.finishedAt:
#             duration = obj.finishedAt - obj.startedAt
#             return str(duration).split('.')[0]  # Format as HH:MM:SS, remove microseconds
#         return None

class CrawlLogSerializer(serializers.ModelSerializer):
    startedAt = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    finishedAt = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", allow_null=True)
    processDuration = serializers.SerializerMethodField()

    class Meta:
        model = CrawlLog
        fields = [
            'id',
            'profileName',
            'profilePlatform',
            'startedAt',
            'finishedAt',
            'status',
            'recordsCrawled',
            'errorMessage',
            'processDuration'
        ]

    def get_processDuration(self, obj):
        if obj.startedAt and obj.finishedAt:
            duration = obj.finishedAt - obj.startedAt
            return str(duration).split('.')[0]  # Format as HH:MM:SS, remove microseconds
        return None

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if rep['recordsCrawled'] == 0 and rep['errorMessage'] is None and rep['status'] == 'SUCCESS':
            rep['errorMessage'] = "No New Data Found! "
        return rep


class SchedularLogSerializer(serializers.ModelSerializer):
    started_at = serializers.SerializerMethodField()

    class Meta:
        model = SchedularLog
        fields = ['platform', 'profile_count', 'started_at', 'status']

    def get_started_at(self, obj):
        return localtime(obj.started_at).strftime("%b %d, %Y at %I:%M %p")


class CustomPromptSerializer(serializers.ModelSerializer):
    prompt = serializers.CharField(source='prompt_text')

    class Meta:
        model = CustomPrompt
        fields = ['id', 'prompt', 'created_at']