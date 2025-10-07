from django.db import models
from configurator.models import Keyword, Profile
from account.models import User


class Playlist(models.Model):
    name = models.CharField(max_length=100)
    keywords = models.ManyToManyField(Keyword, related_name='keywords')
    profiles = models.ManyToManyField(Profile, related_name='profiles')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user')

    def __str__(self):
        return self.name 