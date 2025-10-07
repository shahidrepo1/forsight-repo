from django.contrib import admin
from django.urls import path
from reports.views import (
                            getConfiguredKeywordsDataReport,
                            getConfiguredProfilesDataReport,
                            getConfiguredNewsGPTReportData
                            
                            )

urlpatterns = [
    path('getConfiguredKeywordsReportData/',getConfiguredKeywordsDataReport,name='getConfiguredKeywordsReportData'),
    path('getConfiguredProfilesReportData/',getConfiguredProfilesDataReport,name='getConfiguredProfilesReportData'),
    path('getConfiguredNewsGPTReportData/',getConfiguredNewsGPTReportData,name='getConfiguredNewsGPTReportData'),

]

