from django.contrib import admin

from .models import TargetWebProfile, TargetWebProfileArticle

admin.site.register(TargetWebProfile)
admin.site.register(TargetWebProfileArticle)