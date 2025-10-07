from django.db import models

from configurator.models import Profile,Keyword


class TargetWebProfile(models.Model):
    Profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='web_profiles', null=True, blank=True)
    keyword = models.ForeignKey(Keyword, on_delete=models.CASCADE, related_name='web_keyword', null=True, blank=True)
    platformName = models.CharField(max_length=10000, null=True, blank=True)


    ## new field for topic modeling...
    topicModeling = models.BooleanField(default=False)
    
    def __str__(self):
        if self.Profile:
            return self.Profile.profileUrl
        else:
            return str(self.platformName)
        

class TargetWebProfileArticle(models.Model):
    sentiment_choices = [
        ('positive', 'positive'),
        ('negative', 'negative'),
        ('neutral', 'neutral')
    ]

    targetWebProfile = models.ForeignKey(TargetWebProfile, on_delete=models.CASCADE, related_name='articles', null=True, blank=True)
    articleTitle = models.TextField(null=True, blank=True)
    articleDescription = models.TextField(null=True, blank=True)
    originalThumbnail = models.URLField(null=True, blank=True)
    articlePublishedAt = models.DateTimeField(null=True, blank=True)
    originalArticleUrl = models.URLField(null=True, blank=True)
    articleSentiment = models.CharField(max_length=100, null=True, blank=True,choices=sentiment_choices, default='neutral')
    media = models.ImageField(upload_to='', null=True, blank=True)
    thumbnail = models.ImageField(upload_to='', null=True, blank=True)

    ocrResult = models.JSONField(null=True, blank=True)
    frResult = models.JSONField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["articlePublishedAt"], name="idx_article_published_at"),
            models.Index(fields=["articleSentiment"], name="idx_article_sentiment"),
            models.Index(fields=["targetWebProfile"], name="idx_article_target_profile"),
        ]
    

class topicModeling(models.Model):
    ids = models.JSONField()  # list of integers
    images = models.JSONField()  # list of image URLs
    urls = models.JSONField()  # list of article URLs
    
    topic_title = models.CharField(max_length=255, null=True, blank=True)  # ✅ allow null
    topic_content = models.TextField(null=True, blank=True)

    sentiment = models.CharField(max_length=20, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.topic_title} ({self.sentiment})"

