from django.contrib import admin
from configurator.models import Platform,Profile,Keyword, CustomPrompt

admin.site.register(Platform)
admin.site.register(Profile)
admin.site.register(Keyword)
admin.site.register(CustomPrompt)
