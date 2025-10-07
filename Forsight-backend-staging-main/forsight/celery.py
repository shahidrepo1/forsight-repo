from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.conf import settings
from celery.schedules import crontab
from datetime import timedelta


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'forsight.settings')
app = Celery('Forsight')
app.conf.enable_utc = False
app.conf.update(timezone = 'Asia/Karachi')
app.config_from_object(settings, namespace='CELERY')
app.autodiscover_tasks()


app.conf.beat_schedule = {
    'reCrawl_X_Profiles': {
        'task': 'xcrawlers.tasks.reCrawlXProfilesData',
        'schedule':timedelta(hours=3), 
    },
    # 'reCrawl_X_Keywords': {
    #     'task': 'xcrawlers.tasks.reCrawlKeywordBasedData',
    #     'schedule': timedelta(hours=3),
    # },
    'reCrawl_Youtube_Profiles': {
       'task': 'youtubecrawlers.tasks.reCrawlYoutubeProfilesData',
       'schedule': timedelta(hours=3),
    },
    # 'reCrawl_Youtube_Keywords': {
    #    'task': 'youtubecrawlers.tasks.reCrawlYoutubeKeywordsData',
    #    'schedule': timedelta(hours=3),
    # },
    'reCrawl_Web_Profiles': {
         'task': 'webcrawlers.tasks.reCrawlWebProfilesData',
         'schedule': timedelta(hours=3),
    },
    # 'reCrawl_Web_Keywords': {
    #      'task': 'webcrawlers.tasks.reCrawlWebKeywordBasedData',
    #      'schedule': timedelta(minutes=59),
    # },
    }


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
