from celery import shared_task
from configurator.models import Profile, Keyword

from webcrawlers.models import TargetWebProfileArticle

from webcrawlers.producer import reCrawlWebProfilesDataEvent, reCrawlWebKeywordDataEvent
from webcrawlers.models import TargetWebProfile
from youtubecrawlers.tasks import log_schedular

# @shared_task
# def reCrawlWebProfilesData():
#     print("-----------------------ReCrawling Web Profiles Data -------------------")
#     allWebProfiles = Profile.objects.filter(platform__name='web')
#     all_profile = allWebProfiles.count()
#     counter = 0
#     try:
#         for profile in allWebProfiles:
#             latestArticle = TargetWebProfileArticle.objects.filter(targetWebProfile__Profile=profile).order_by('-articlePublishedAt').first()
#             if latestArticle:
#                 latestArticleDate = latestArticle.articlePublishedAt
#                 target_web_profile = TargetWebProfile.objects.get(Profile__id=profile.id)
#                 target_web_profile_id = target_web_profile.id
#                 data = {
#                     'recrawl': True,
#                     'targetWebProfileId': profile.id,
#                     'taregtProfileurl': profile.profileUrl,
#                     'targetWebProfileId': target_web_profile_id,
#                     'latestArticleDate': latestArticleDate.strftime("%Y-%m-%d %H:%M:%S")
#                 }
#                 counter += 1
#                 reCrawlWebProfilesDataEvent(data)
#     except Exception as e:
#         print("Error in reCrawlWebProfilesData", e)
#     log_schedular("Web", all_profile)
#     print("Scheduled all the Web",counter)

@shared_task
def reCrawlWebProfilesData():
    print("----------------------- ReCrawling Web Profiles Data -------------------")
    allWebProfiles = Profile.objects.filter(platform__name='web')
    all_profile = allWebProfiles.count()
    counter = 0

    try:
        for profile in allWebProfiles:
            # latestArticle = TargetWebProfileArticle.objects.filter(targetWebProfile__Profile=profile).order_by('-articlePublishedAt').first()
                
            # # if latestArticle:
            # latestArticleDate = latestArticle.articlePublishedAt
            # if latestArticleDate is None:
            #     print(f"Warning: articlePublishedAt is None for profile ID {profile.id}")
            #     continue

            target_web_profile = TargetWebProfile.objects.get(Profile__id=profile.id)
            data = {
                'recrawl': True,
                'targetWebProfileId': profile.id,
                'taregtProfileurl': profile.profileUrl,
                'targetWebProfileId': target_web_profile.id,
                # 'latestArticleDate': latestArticleDate.strftime("%Y-%m-%d %H:%M:%S")
            }
            counter += 1
            topic = reCrawlWebProfilesDataEvent(data)
            print(f"reCrawlWebProfilesDataEvent all the Web all_profile:{topic}")


    except Exception as e:
        print("Error in reCrawlWebProfilesData:", e)

    log_schedular("Web", all_profile)
    print("Scheduled all the Web all_profile:", all_profile)

@shared_task
def reCrawlWebKeywordBasedData():
    print("-----------------------ReCrawling Keyword Based Data")
    allKeywords = Keyword.objects.all()
    try:
        for keyword in allKeywords:
            latestArticle = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword=keyword).order_by('-articlePublishedAt').first()
            if latestArticle:
                latestArticleDate = latestArticle.articlePublishedAt
                data = {
                    'recrawl': True,
                    'kewordId': keyword.id,
                    'taregtProfilekeyword': keyword.keyword,
                    'latestArticleDate': latestArticleDate.strftime("%Y-%m-%d %H:%M:%S")
                }
                reCrawlWebKeywordDataEvent(data)
    except Exception as e:
        print("Error in reCrawlKeywordBasedData", e)

        