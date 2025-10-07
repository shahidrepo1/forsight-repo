from django.db import models
from configurator.models import Profile, Keyword

class TargetYoutubeProfile(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='youtube_profiles', null=True, blank=True)
    keyword = models.ForeignKey(Keyword, on_delete=models.CASCADE, related_name='youtube_profiles', null=True, blank=True)
    channelName = models.CharField(max_length=100, null=True, blank=True)
    channelSubscribersCount = models.FloatField(default=0)
    channelDescription = models.TextField(null=True, blank=True)
    channelUrl = models.URLField(null=True, blank=True)
    channelVideoCount = models.IntegerField(default=0)
    channelViewCount = models.IntegerField(default=0)
    channelPublishedAt = models.DateTimeField(null=True, blank=True)
    channelCountry = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        
        if self.profile:
            if self.channelName:
                return self.channelName+ ' - ' +self.profile.profileUrl  
            return self.profile.profileUrl
        
        elif self.keyword:
            return self.keyword.keyword
        
        
            
class TargetYoutubeProfileVideo(models.Model):
    sentiment_choices = [
        ('positive', 'positive'),
        ('negative', 'negative'),
        ('neutral', 'neutral')
    ]
    targetYoutubeProfile = models.ForeignKey(TargetYoutubeProfile, on_delete=models.CASCADE, related_name='videos', null=True, blank=True)
    videoTitle = models.TextField(null=True, blank=True)
    videoDuration = models.IntegerField(default=0, null=True, blank=True)
    videoViewCount = models.BigIntegerField(default=0)
    originalVideoUrl = models.URLField(null=True, blank=True)
    originalVideoTumbnailUrl = models.URLField(null=True, blank=True)
    videoPublishedAt = models.DateTimeField(null=True, blank=True)
    videoLink = models.ImageField(upload_to='', null=True, blank=True)
    videoThumbnail = models.ImageField(upload_to='', null=True, blank=True)
    videoSentiment = models.CharField(max_length=100, null=True, blank=True,choices=sentiment_choices, default='neutral')

    
    ## New added fields
    videoCommentsCount = models.IntegerField(default=0,null=True,blank=True)
    videoLikesCount = models.IntegerField(default=0, blank=True, null=True)
    videoTranscription = models.TextField(null=True, blank=True)

    ## AI models
    frVideoResult = models.JSONField(null=True, blank=True)  # For storing AI result
    srVideoResult = models.JSONField(null=True, blank=True)  # For storing AI result
    sttVideoResult = models.JSONField(null=True, blank=True)  # For storing AI result
    

    class Meta:
        indexes = [
            models.Index(fields=["videoPublishedAt"]),
            models.Index(fields=["videoSentiment"]),
            models.Index(fields=["targetYoutubeProfile"]),
        ]

    