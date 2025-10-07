from django.db import models
from account.models import UserProfile


class Platform(models.Model):
    platform_choices = platform_choice = (
        ('X', 'X'),
        ('Facebook', 'Facebook'),
        ('Web', 'Web'),
        ('YouTube', 'YouTube'),
    )
    name = models.CharField(max_length=50, choices=platform_choices)
    logo = models.ImageField(upload_to='platformLogo/', null=True, blank=True)

    def __str__(self):
        return self.name


class Profile(models.Model):
    user = models.ManyToManyField(UserProfile, related_name='user_profile')
    profileName = models.CharField(max_length=100,unique=True, null=True, blank=True)
    profileUrl = models.URLField(unique=True)
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE, related_name='profiles')
    createdAt = models.DateTimeField(auto_now=True)
    status = models.BooleanField(default=True)
    dataCount = models.IntegerField(default=0)
    # aiModelsEnabled = models.JSONField(default=list, blank=True)
    ## new field for topic modeling...
    topicModeling = models.BooleanField(default=False)

    def __str__(self):
        return f"profile taregt by {self.id} - {self.profileUrl} ({self.platform.name})"


class Keyword(models.Model):
    user = models.ManyToManyField(UserProfile, related_name='profile')
    keyword = models.CharField(max_length=100)
    suspended = models.BooleanField(default=False, null=True, blank=True)
    platforms = models.ManyToManyField(Platform, related_name='platform_list')
    createdAt = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)
    xDataCount = models.IntegerField(default=0)
    youtubeDataCount = models.IntegerField(default=0)
    facebookDataCount = models.IntegerField(default=0)
    webDataCount = models.IntegerField(default=0)
    dataCount = models.IntegerField(default=0)

    def __str__(self):
        return self.keyword+" - "+str(self.platforms.all())


class CrawlLog(models.Model):
    profileName = models.TextField(null=True, blank=True)
    profilePlatform = models.TextField(null=True, blank=True)
    startedAt = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('RUNNING', 'Running'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed')
    ])

    finishedAt = models.DateTimeField(null=True, blank=True)
    recordsCrawled = models.IntegerField(default=0)
    errorMessage = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"CrawlLog(profile_id={self.profileName}, status={self.status})"


class SchedularLog(models.Model):
    platform = models.CharField(max_length=100)
    profile_count = models.IntegerField()
    started_at = models.DateTimeField(auto_now_add=True)  # auto-set on creation
    status = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.platform} | {self.status} | {self.started_at.strftime('%Y-%m-%d %H:%M:%S')}"


class CustomPrompt(models.Model):
    prompt_text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.prompt_text