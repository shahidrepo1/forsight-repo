from celery import shared_task
from webcrawlers.models import TargetWebProfile, TargetWebProfileArticle
from webcrawlers.producer import reCrawlWebProfilesDataEvent
from youtubecrawlers.models import TargetYoutubeProfileVideo
from youtubecrawlers.producer import reCrawlYoutubeProfilesDataEvent,reCrawlYoutubeKeywordsDataEvent
from configurator.models import Profile,Keyword, SchedularLog
from django.utils import timezone



from django.utils.timezone import now, localtime

def log_schedular(platform_name, all_profile):
    print("----------------------- ReCrawling X Profiles Data --16161616161661616-----------------")

    try:
        log = SchedularLog.objects.create(
            platform=platform_name,
            profile_count=all_profile,
            started_at=localtime(now()),  # optional, auto_now_add is better
            status='completed'
        )
        print(f"Log created for {platform_name} at {localtime(log.started_at)}")
    except Exception as e:
        print(f"Failed to create crawl log: {e}")
    finally:
        print("----------------------- ReCrawling X Profiles Data --1171717171717171717717171717-----------------")


import re
# @shared_task
# def reCrawlYoutubeProfilesData():
#     print("-----------------------ReCrawling Web Profiles Data -------------------")
#     allYoutubeProfiles = Profile.objects.filter(platform__name='youtube')
#     all_profile = allYoutubeProfiles.count()
#     counter = 0
#     try:
#         for profile in allYoutubeProfiles:
#             latestVideo = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__profile=profile).first()
#             if latestVideo:
#                 print("-------------chanl name is",latestVideo.targetYoutubeProfile.channelName)
#                 print("----------------video title is",latestVideo.videoTitle)
#                 channelName = latestVideo.targetYoutubeProfile.channelName
#                 # senatized
#                 data   = {
#                             'recrawl':True,
#                             'profileId':profile.id,
#                             # 'targerProfileLink':profile.profileUrl,
#                             'taregtProfile':channelName,
#                             'targetYoutubeDbProfileId':latestVideo.targetYoutubeProfile.id,
#                             'latestRecordDate':None
#                         }
#                 print("data is",data)
#                 counter = counter + 1
#                 reCrawlYoutubeProfilesDataEvent(data)
#             else:
#                 print(f"Warning: No articles found for profile ID {profile.id}")
#     except Exception as e:
#         print("Error in reCrawlWebProfilesData", e)
#     log_schedular("Youtube", counter)
#     print("Scheduled all the Youtube profiles:", counter)

from youtubecrawlers.models import TargetYoutubeProfile
@shared_task
def reCrawlYoutubeProfilesData():
    print("-----------------------ReCrawling YouTube Profiles Data -------------------")
    allYoutubeProfiles = Profile.objects.filter(platform__name='youtube')
    counter = 0

    try:
        for profile in allYoutubeProfiles:
            # ✅ Always try to get the related TargetYoutubeProfile first
            target_youtube_profile = TargetYoutubeProfile.objects.filter(profile=profile).first()

            if not target_youtube_profile:
                print(f"Skipped: No TargetYoutubeProfile entry for profile ID {profile.id}")
                continue

            channelName = target_youtube_profile.channelName
            targetYoutubeDbProfileId = target_youtube_profile.id

            # Check if channel name is missing
            if not channelName:
                # Try to fallback from profile.profileUrl
                profile_url = profile.profileUrl or ""
                match = re.search(r"@([\w\-\_]+)", profile_url)
                if match:
                    channelName = match.group(1)
                    print(f"No channel name in DB for profile ID {profile.id}, using fallback: {channelName}")
                else:
                    print(f"Skipped: No valid channel name or fallback for profile ID {profile.id}")
                    continue

            # Prepare data
            data = {
                'recrawl': True,
                'profileId': profile.id,
                'taregtProfile': channelName,
                'targetYoutubeDbProfileId': targetYoutubeDbProfileId,
                'latestRecordDate': None
            }

            print("✅ Data prepared:", data)
            counter += 1
            reCrawlYoutubeProfilesDataEvent(data)

    except Exception as e:
        print("❌ Error in reCrawlYoutubeProfilesData", e)

    log_schedular("Youtube", counter)
    print("✅ Scheduled YouTube profiles:", counter)


@shared_task
def reCrawlYoutubeKeywordsData():
    print("-----------------------ReCrawling Youtube Keywords Data")
    allYoutubekeywords = Keyword.objects.filter(platforms__name='youtube', suspended=False)
    print("allYoutubekeywords are", list(allYoutubekeywords.values_list('id', 'keyword')))
    for keyword in allYoutubekeywords:
        latestVideo = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword=keyword).order_by('-videoPublishedAt').first()
        print("keyword is ",keyword)
        if latestVideo:
            latestVideoDate = latestVideo.videoPublishedAt
            channelName = latestVideo.targetYoutubeProfile.channelName
            # senatized
            data   = {
                        'recrawl':True,
                        'keywordId':keyword.id,
                        'taregtKeyword':channelName,
                        'targetYoutubeDbProfileId':latestVideo.targetYoutubeProfile.id,
                        'latestRecordDate':latestVideoDate.strftime("%Y-%m-%d %H:%M:%S")
                    }
            reCrawlYoutubeKeywordsDataEvent(data)