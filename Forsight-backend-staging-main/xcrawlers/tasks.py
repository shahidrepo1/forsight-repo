from celery import shared_task
from configurator.models import Profile, Keyword
from xcrawlers.models import TargetXProfileTweet
from xcrawlers.producer import reCrawlXProfilesDataEvent, reCrawlXKeywordDataEvent
from youtubecrawlers.tasks import log_schedular

@shared_task
def check_status():
    print("Checking status")
    # return "Status Checked"


@shared_task
def reCrawlXProfilesData():
    print("----------------------- ReCrawling X Profiles Data --1010101010101-----------------")
    allProfiles = Profile.objects.filter(platform__name='x')
    counter = 0   # ✅ counts only scheduled ones

    try:
        for profile in allProfiles:
            latestTweet = (
                TargetXProfileTweet.objects
                .filter(targetXProfile__profile=profile)
                .order_by('-tweetCreatedAt')
                .first()
            )

            if not latestTweet:
                print(f"Skipped: No tweets found for profile ID {profile.id}")
                continue

            data = {
                'recrawl': True,
                'profileId': profile.id,
                'targerProfileLink': profile.profileUrl,
                'targetXprofileId': latestTweet.targetXProfile.id,
                'latestTweetDate': latestTweet.tweetCreatedAt.strftime("%Y-%m-%d %H:%M:%S"),
            }

            print("✅ Data prepared:", data)
            counter += 1
            reCrawlXProfilesDataEvent(data)

        print("----------------------- ReCrawling X Profiles Data --151515151515151515151515-----------------")

    except Exception as e:
        print("❌ Error in reCrawlXProfilesData:", e)


    finally:
        log_schedular("X", counter)
        print("+++++++++++++++>>>>>>>>>>>>>>>>>>>>>>>>")
        print(f"✅ Scheduled X profiles: {counter}")

@shared_task
def reCrawlKeywordBasedData():
    print("-----------------------ReCrawling Keyword Based Data")
    allKeywords = Keyword.objects.all()
    try:
        for keyword in allKeywords:
            latestTweet = TargetXProfileTweet.objects.filter(targetXProfile__Keyword=keyword).order_by('-tweetCreatedAt').first()
            if latestTweet:
                latestTweetDate = latestTweet.tweetCreatedAt
                data   = {
                            'recrawl':True,
                            'keywordId':keyword.id,
                            'targetProfileKeword':keyword.keyword,
                            'latestTweetDate':latestTweetDate.strftime("%Y-%m-%d %H:%M:%S")
                        }
                reCrawlXKeywordDataEvent(data)
    except Exception as e:
        print("Error in reCrawlKeywordBasedData",e)