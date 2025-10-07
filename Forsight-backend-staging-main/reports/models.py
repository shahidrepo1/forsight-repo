from django.db import models
from account.models import UserProfile

class ReportSttNewsGpt(models.Model):
    user = models.ForeignKey(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name='user_report'
    )

    title = models.TextField(null=True,blank=True)
    createdAt = models.DateTimeField(auto_now_add=False,null=True,blank=True)
    reportText=models.TextField(null=True,blank=True)

    def __str__(self):
        return self.title[:50]
