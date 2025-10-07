from django.db import models
from configurator.models import Profile, Keyword

from configurator.models import Profile, Keyword


class TargetXProfile(models.Model):
    Keyword = models.ForeignKey(Keyword, on_delete=models.CASCADE,null=True, blank=True, related_name='target_x_keywords')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE,null=True, blank=True, related_name='target_x_profiles')
    targetProfileXId = models.CharField(max_length=200, null=True, blank=True)
    targetProfileName = models.CharField(max_length=100, null=True, blank=True)
    targetProfileScreenName = models.CharField(max_length=100, null=True, blank=True)
    isBlueTickVerified = models.BooleanField(default=False)
    defaultProfile = models.BooleanField(default=False)
    targetProfileCreatedAt = models.DateTimeField(null=True, blank=True)
    targetProfileDescription = models.TextField(null=True, blank=True)
    targetProfileDisplayUrl = models.CharField(max_length=100, null=True, blank=True)
    targetProfileFastFollowersCount = models.IntegerField(null=True, blank=True)
    targetProfileLink = models.CharField(max_length=100, null=True, blank=True)
    targetProfileFavouritesCount = models.IntegerField(null=True, blank=True)
    targetProfileFollowersCount = models.IntegerField(null=True, blank=True)
    targetProfileFriendsCount = models.IntegerField(null=True, blank=True)
    targetProfileGeographicalLocation = models.CharField(max_length=100, null=True, blank=True)
    targetProfileMediaCount = models.IntegerField(null=True, blank=True)
    targetProfileNormalFollowersCount = models.IntegerField(null=True, blank=True)
    targetProfileStatusesCount = models.IntegerField(null=True, blank=True)


    def __str__(self):
        if self.profile:
            return self.profile.profileUrl
        elif self.Keyword:
            return self.Keyword.keyword



class TargetXProfileTweet(models.Model):
    sentiment_choices = (
        ('positive', 'positive'),
        ('negative', 'negative'),
        ('neutral', 'neutral'),
    )
    targetXProfile = models.ForeignKey(TargetXProfile, on_delete=models.CASCADE)
    tweetText = models.TextField(null=True, blank=True)
    tweetViews = models.IntegerField(null=True, blank=True)
    tweetKeyword = models.CharField(max_length=500, null=True, blank=True) ## review this field
    cleanTweetText = models.TextField(null=True, blank=True)
    tweetReplies = models.IntegerField(null=True, blank=True)
    tweetQuoteCount = models.IntegerField(null=True, blank=True)
    tweetFavoriteCount = models.IntegerField(null=True, blank=True)
    retweetCount = models.IntegerField(null=True, blank=True)
    tweetBookmarkCount = models.IntegerField(null=True, blank=True)
    tweetCreatedAt = models.DateTimeField(null=True, blank=True)
    tweetImageLink = models.CharField(max_length=100, null=True, blank=True)
    tweetImageData = models.TextField(null=True, blank=True) ## review this field
    tweetOriginalLink = models.CharField(max_length=100, null=True, blank=True)
    tweetVideo = models.CharField(max_length=1000, null=True,blank=True)
    tweetImage = models.CharField(max_length=1000, null=True,blank=True)
    tweetSentiment = models.CharField(max_length=100, null=True, blank=True,default='neutral',choices=sentiment_choices)

    ocrResult = models.JSONField(null=True, blank=True)
    frResult = models.JSONField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["tweetCreatedAt"]),
            models.Index(fields=["tweetSentiment"]),
            models.Index(fields=["targetXProfile"]),
        ]