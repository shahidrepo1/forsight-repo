from django.urls import path
from configurator.views import (
                                CrawlLogListView,
                                ExportYoutubeVideosExcel,
                                SchedularLogListView,
                                getConfiguredProfiles,
                                addNewProfile,
                                getConfiguredKeywords,
                                addNewKeyword,
                                getConfiguredProfilesData,
                                getConfiguredKeywordsData,
                                deleteProfile,
                                deleteKeyword,
                                deleteData,
                                checkStatus,
                                suspendKeyword,
                                updateSentiment,
                                getSingelData,
                                CustomPromptViewSet,
                                get_topic_modeling,
                                )

from django.urls import path, include
from rest_framework import routers
router = routers.DefaultRouter()
router.register(r'prompts', CustomPromptViewSet, basename='prompt')

urlpatterns = [
    path('getConfiguredProfiles/',getConfiguredProfiles,name='getConfiguredProfiles'),
    path('getConfiguredKeywords/',getConfiguredKeywords,name='getConfiguredKeywords'),
    path('addNewProfile/',addNewProfile,name='addNewProfile'),
    path('deleteProfile/',deleteProfile,name='deleteProfile'),
    path('deleteKeyword/',deleteKeyword,name='deleteKey'),
    path('suspendKeyword/', suspendKeyword, name='suspend-keyword'),
    path('addNewKeyword/',addNewKeyword,name='addNewKeyword'),
    path('getConfiguredProfilesData/',getConfiguredProfilesData,name='getConfiguredProfilesData'),
    path('getConfiguredKeywordsData/',getConfiguredKeywordsData,name='getConfiguredKeywordsData'),
    path('deleteData/',deleteData,name='deleteData'),
    path('updateSentiment/<str:platform>/<str:id>/',updateSentiment,name='updateSentiment'),
    path('data/<str:platform>/<str:id>/',getSingelData, name = "getSingleData"),
    path('checkStatus/',checkStatus,name='checkStatus'),


    path('crawl-logs/', CrawlLogListView.as_view(), name='crawl-logs'),
    path('schedular_logs/', SchedularLogListView.as_view(), name='scheduler-log-list'),
    path('data/', ExportYoutubeVideosExcel.as_view(), name='data'),

    ##GPT Prompts
    path('api/', include(router.urls)),
    path("getTopicModeling/", get_topic_modeling, name="get_ai_responses"),




    
]
