
from django.urls import path

from visualizations.views import (
                                crawl_log_status_summary,
                                crawllog_status_chart,
                                sentimentDonutChart,
                                sentimentsBarChart,
                                platformPychart,
                                sunburst_chart_view,
                                trending_words_view,
                                generateWordCloud,
                                totalRecords
                                )   


urlpatterns = [
    path('generateWordCloud/',generateWordCloud,name='wordcloud'),
    path('donut/',sentimentDonutChart,name='sentimentDonutChart'),
    path('barchart/',sentimentsBarChart,name='barchart'),
    path('piechart/',platformPychart,name='platformPychart'),
    path('sunburst/',sunburst_chart_view,name='sunburst_chart_view'),
    path('trending/',trending_words_view,name='trending_words_view'),
    path('totalRecords/',totalRecords,name='totalRecords'),
    
    #crawl log charts
    path('logcharts/', crawl_log_status_summary, name='crawl_log_status_summary'),
    path('crawllog-status-chart/', crawllog_status_chart, name='crawllog-status-chart'),

]
