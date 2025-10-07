from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from configurator.models import Keyword
from xcrawlers.models import TargetXProfileTweet
from xcrawlers.serializers import TargetXProfileTweetSerializer
from datetime import datetime, timedelta

from forsight.helper import paginate_queryset
import re
from itertools import chain

from django.db.models import F

from youtubecrawlers.serializers import TargetYoutubeProfileVideoSerializer
from youtubecrawlers.models import TargetYoutubeProfileVideo

from webcrawlers.models import TargetWebProfileArticle
from webcrawlers.serializers import TargetWebProfileArticleSerializer

from urllib.parse import urlparse

def profileLinkValidator(url):
    twitter_pattern = r'^https?://(www\.)?(x\.com|twitter\.com)/.+$'
    youtube_pattern = r'^https?://(www\.)?(youtube\.com|youtu\.be)/.+$'
    

    if re.match(twitter_pattern, url):
        return 'x'
    elif re.match(youtube_pattern, url):
        return 'youtube'
    else:
        parsed_domain = urlparse(url).netloc.replace("www.", "")
        for web_profile in settings.WEB_PROFILES:
            if parsed_domain in web_profile:  # ✅ check domain match
                return 'web'

    return None


def extractYoutubeChannelName(url):
    """
    Extracts the YouTube channel name from a given URL.

    Args:
    url (str): The YouTube channel URL.

    Returns:
    str: The extracted YouTube channel name.
    """
    # Regular expression to find the channel name in the URL
    pattern = r'@([\w\.-]+)'

    # Search for the pattern in the URL
    match = re.search(pattern, url)

    # Return the channel name if found, otherwise return None
    return match.group(1) if match else None

from itertools import chain, islice

DEFAULT_LIMIT_PER_PLATFORM = 500

def get_data_from_models(selectedProfiles, sentiments, platforms=None, limit_per_platform=DEFAULT_LIMIT_PER_PLATFORM):
    if not platforms:
        platforms = ["x", "youtube", "web"]

    result_sets = []

    if "x" in platforms:
        x_qs = TargetXProfileTweet.objects.filter(
            targetXProfile__profile__id__in=selectedProfiles,
            tweetSentiment__in=sentiments
        ).select_related('targetXProfile', 'targetXProfile__profile').annotate(
            source=F('targetXProfile__profile__id')
        ).order_by('-tweetCreatedAt')[:limit_per_platform]
        result_sets.append(x_qs)

    if "youtube" in platforms:
        yt_qs = TargetYoutubeProfileVideo.objects.filter(
            targetYoutubeProfile__profile__id__in=selectedProfiles,
            videoSentiment__in=sentiments
        ).select_related('targetYoutubeProfile', 'targetYoutubeProfile__profile').annotate(
            source=F('targetYoutubeProfile__profile__id')
        ).order_by('-videoPublishedAt')[:limit_per_platform]
        result_sets.append(yt_qs)

    if "web" in platforms:
        web_qs = TargetWebProfileArticle.objects.filter(
            targetWebProfile__Profile__id__in=selectedProfiles,
            articleSentiment__in=sentiments
        ).select_related('targetWebProfile', 'targetWebProfile__Profile').annotate(
            source=F('targetWebProfile__Profile__id')
        ).order_by('-articlePublishedAt')[:limit_per_platform]
        result_sets.append(web_qs)

    combined_queryset = sorted(chain(*result_sets), key=lambda x: getattr(x, 'tweetCreatedAt', getattr(x, 'videoPublishedAt', getattr(x, 'articlePublishedAt', None))), reverse=True)
    return combined_queryset

def getConfiguredSelectedProfileData(request, currentUserProfile, selectedProfiles, sentiments, platforms):
    combinedData = get_data_from_models(selectedProfiles, sentiments, platforms)
    paginated_profiles, pagination_data = paginate_queryset(combinedData, request)

    response_data = []

    for data in paginated_profiles:
        if isinstance(data, TargetXProfileTweet):
            serializer = TargetXProfileTweetSerializer(data)
        elif isinstance(data, TargetYoutubeProfileVideo):
            serializer = TargetYoutubeProfileVideoSerializer(data)
        elif isinstance(data, TargetWebProfileArticle):
            serializer = TargetWebProfileArticleSerializer(data)
        else:
            continue
        response_data.append(serializer.data)

    return Response({'data': response_data, 'pagination': pagination_data}, status=status.HTTP_200_OK)

def searchProfileData(request, ids, query, startDate, endDate,sentiments,report=False, platforms=None):

    from django.db.models import Q

    def build_or_query(field_name, search_string):
        terms = [term.strip() for term in search_string.split(',') if term.strip()]
        query = Q()
        for term in terms:
            query |= Q(**{f"{field_name}__icontains": term})
        return query
    
    tweetData = TargetXProfileTweet.objects.none()
    youtubeData = TargetYoutubeProfileVideo.objects.none()
    webData = TargetWebProfileArticle.objects.none()

    if not platforms:
        platforms = ["x", "youtube", "web"]
    if query is not None and startDate is not None and endDate is not None:
        print(f'query----------------------------------------------4 ')

        if "x" in platforms:
            tweetData = TargetXProfileTweet.objects.filter(
                targetXProfile__profile__id__in=ids,
                tweetCreatedAt__date__range=[startDate, endDate],
                tweetSentiment__in=sentiments
            ).filter(build_or_query('tweetText', query)).order_by('-tweetCreatedAt')

        if "youtube" in platforms:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__profile__id__in=ids,
                videoPublishedAt__date__range=[startDate, endDate],
                videoSentiment__in=sentiments
            ).filter(build_or_query('videoTitle', query)).order_by('-videoPublishedAt')

        if "web" in platforms:
            webData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__Profile__id__in=ids,
                articlePublishedAt__date__range=[startDate, endDate],
                articleSentiment__in=sentiments
            ).filter(build_or_query('articleTitle', query)).order_by('-articlePublishedAt')


    if query and startDate and not endDate:
        print(f'query----------------------------------------------5 ')

        if "x" in platforms:
            tweetData = TargetXProfileTweet.objects.filter(
                targetXProfile__profile__id__in=ids,
                tweetCreatedAt__gte=startDate
            ).filter(build_or_query('tweetText', query)).order_by('-tweetCreatedAt')

        if "youtube" in platforms:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__profile__id__in=ids,
                videoPublishedAt__gte=startDate
            ).filter(build_or_query('videoTitle', query)).order_by('-videoPublishedAt')

        if "web" in platforms:
            webData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__Profile__id__in=ids,
                articlePublishedAt__gte=startDate
            ).filter(build_or_query('articleTitle', query)).order_by('-articlePublishedAt')



    if query and endDate and not startDate:
        print(f'query----------------------------------------------6 ')

        if "x" in platforms:
            tweetData = TargetXProfileTweet.objects.filter(
                targetXProfile__profile__id__in=ids, 
                tweetCreatedAt__lte=endDate
            ).filter(build_or_query('tweetText', query)).order_by('-tweetCreatedAt')

        if 'youtube' in platforms:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__profile__id__in=ids, 
                videoPublishedAt__lte=endDate
            ).filter(build_or_query('videoTitle', query)).order_by('-videoPublishedAt')

        if "web" in platforms:
            webData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__Profile__id__in=ids, 
                articlePublishedAt__lte=endDate
            ).filter(build_or_query('articleTitle', query)).order_by('-articlePublishedAt')


    if query and not startDate and not endDate:
        print(f'query----------------------------------------------7 ')

        if 'x' in platforms:
            tweetData = TargetXProfileTweet.objects.filter(
                targetXProfile__profile__id__in=ids,
                tweetSentiment__in=sentiments
            ).filter(build_or_query('tweetText', query)).order_by('-tweetCreatedAt')

        if 'youtube' in platforms:

            youtubeData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__profile__id__in=ids,
                videoSentiment__in=sentiments
            ).filter(build_or_query('videoTitle', query)).order_by('-videoPublishedAt')

        if 'web' in platforms:

            webData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__Profile__id__in=ids,
                articleSentiment__in=sentiments
            ).filter(build_or_query('articleTitle', query)).order_by('-articlePublishedAt')


    if startDate and endDate and not query:
        print(f'query----------------------------------------------99 ')



        if 'x' in platforms:
            print("Fetching tweet data for platform 'x'")
            if not ids or ids == ['']:
                return {
                        "data": [],
                        "pagination": {
                            "count": 0,
                            "next": None,
                            "previous": None,
                            "page_size": 0,
                            "current_page": 1,
                            "total_pages": 1
                        }
                    }
            tweetData = TargetXProfileTweet.objects.filter(
                targetXProfile__profile__id__in=ids,
                tweetCreatedAt__date__range=[startDate, endDate],
                tweetSentiment__in=sentiments
           ).order_by('-tweetCreatedAt') 
            print("Tweet data count:", tweetData.count())

        if 'youtube' in platforms:
            print("Fetching YouTube video data")
            if not ids or ids == ['']:
                return {
                        "data": [],
                        "pagination": {
                            "count": 0,
                            "next": None,
                            "previous": None,
                            "page_size": 0,
                            "current_page": 1,
                            "total_pages": 1
                        }
                    }
            youtubeData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__profile__id__in=ids,
                # videoPublishedAt__gte=startDate, 
                # videoPublishedAt__lt=endDate,
                videoPublishedAt__date__range=[startDate, endDate],
                videoSentiment__in=sentiments
            ).order_by('-videoPublishedAt')
            print("YouTube video data count:", youtubeData.count())

        if 'web' in platforms:
            print("Fetching web article data")
            if not ids or ids == ['']:
                return {
                        "data": [],
                        "pagination": {
                            "count": 0,
                            "next": None,
                            "previous": None,
                            "page_size": 0,
                            "current_page": 1,
                            "total_pages": 1
                        }
                    }
            webData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__Profile__id__in=ids,
                articlePublishedAt__date__range=[startDate, endDate],
                articleSentiment__in=sentiments
            ).order_by('-articlePublishedAt')
            print("Web article data count:", webData.count())

    if startDate and not endDate and not query:
        print(f'query----------------------------------------------10 ')

        targetData = TargetXProfileTweet.objects.filter(
            targetXProfile__profile__id__in=ids,
            tweetCreatedAt__gte=startDate
        ).order_by('-tweetCreatedAt')


    if endDate and not startDate and not query:
        targetData = TargetXProfileTweet.objects.filter(
            targetXProfile__profile__id__in=ids,
            tweetCreatedAt__lte=endDate
        ).order_by('-tweetCreatedAt')


    if report == True:
        tweetSerializer = TargetXProfileTweetSerializer(tweetData, many=True)
        youtubeSerializer = TargetYoutubeProfileVideoSerializer(youtubeData, many=True)
        combinedData = tweetSerializer.data + youtubeSerializer.data
        return combinedData

    tweetSerializer = TargetXProfileTweetSerializer(tweetData, many=True)
    youtubeSerializer = TargetYoutubeProfileVideoSerializer(youtubeData, many=True)
    webSerializer = TargetWebProfileArticleSerializer(webData, many=True)
    combinedData = tweetSerializer.data + youtubeSerializer.data + webSerializer.data
    def extract_date(item):
        return (
            item.get('tweetCreatedAt') or
            item.get('videoPublishedAt') or
            item.get('articlePublishedAt') or
            datetime.min.isoformat()
        )
    combinedData.sort(key=extract_date, reverse=True)

    paginated_profiles, pagination_data = paginate_queryset(combinedData, request)
    
    response_data = {
        'data': list(paginated_profiles),
        'pagination': pagination_data
    }
    return response_data


def getAllConfiguredKeywordsData(request,currentUserProfile):
    keywords = Keyword.objects.prefetch_related('platforms').filter(user=currentUserProfile)
    targetTweets = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__in=keywords).order_by('-id')
    paginated_profiles,pagination_data = paginate_queryset(targetTweets, request)
    serializer = TargetXProfileTweetSerializer(paginated_profiles, many=True)
    response_data = {
        'data': serializer.data,
        'pagination': pagination_data
    }
    return Response(response_data, status=status.HTTP_200_OK)


def getSelectedKeywordsData(request, currentUserProfile, youtube, x, web, facebook, sentiments, platforms=None):
    
    if not platforms:
        platforms = ['x', 'youtube', 'web']
    print('PLATFORM HERE....', platforms)

    targetTweets = []
    targetYoutubeVideos = []
    targetWebArticles = []

    if "x" in platforms and x is not None:
        targetTweets = TargetXProfileTweet.objects.filter(
            targetXProfile__Keyword__id__in=x,
            tweetSentiment__in=sentiments
        ).order_by('-id')

    if "youtube" in platforms and youtube is not None:
        targetYoutubeVideos = TargetYoutubeProfileVideo.objects.filter(
            targetYoutubeProfile__keyword__id__in=youtube,
            videoSentiment__in=sentiments
        ).order_by('-id')

    if "web" in platforms and web is not None:
        targetWebArticles = TargetWebProfileArticle.objects.filter(
            targetWebProfile__keyword__id__in=web,
            articleSentiment__in=sentiments
        ).order_by('-id')

    combinedData = list(chain(targetTweets, targetYoutubeVideos, targetWebArticles))
    
    paginated_profiles, pagination_data = paginate_queryset(combinedData, request)
    response_data = []

    for data in paginated_profiles:
        if isinstance(data, TargetXProfileTweet):
            serializer = TargetXProfileTweetSerializer(data)
        elif isinstance(data, TargetYoutubeProfileVideo):
            serializer = TargetYoutubeProfileVideoSerializer(data)
        elif isinstance(data, TargetWebProfileArticle):
            serializer = TargetWebProfileArticleSerializer(data)
        else:
            continue  # Skip unknown types

        response_data.append(serializer.data)

    return Response({
        'data': response_data,
        'pagination': pagination_data
    }, status=status.HTTP_200_OK)


def extractPlatformIds(ids):
    xIds = []
    youtubeIds = []
    webIds = []
    facebookIds = []

    for id in ids:
        platform, platform_id = id.split('-')
        if platform == 'x':
            xIds.append(platform_id)
        elif platform == 'youtube':
            youtubeIds.append(platform_id)
        elif platform == 'web':
            webIds.append(platform_id)
        elif platform == 'facebook':
            facebookIds.append(platform_id)

    return xIds, youtubeIds, webIds, facebookIds


def getXKeywordsData(request, ids, query, startDate, endDate,sentiments,report=False):
    
    if query is not None and startDate is not None and endDate is not None:
        targetData = TargetXProfileTweet.objects.filter(
            targetXProfile__Keyword__id__in=ids, 
            tweetText__icontains=query, 
            tweetCreatedAt__date__range=[startDate, endDate],
            tweetSentiment__in=sentiments
        ).order_by('-id')

    if query and startDate and not endDate:
        targetData = TargetXProfileTweet.objects.filter(
            targetXProfile__Keyword__id__in=ids, 
            tweetText__icontains=query, 
            tweetCreatedAt__gte=startDate,
            tweetSentiment__in=sentiments
        ).order_by('-id')

    if query and endDate and not startDate:
        targetData = TargetXProfileTweet.objects.filter(
            targetXProfile__Keyword__id__in=ids, 
            tweetText__icontains=query, 
            tweetCreatedAt__lte=endDate,
            tweetSentiment__in=sentiments
        ).order_by('-id')

    if query and not startDate and not endDate:
        targetData = TargetXProfileTweet.objects.filter(
            targetXProfile__Keyword__id__in=ids, 
            tweetText__icontains=query,
            tweetSentiment__in=sentiments
        ).order_by('-id')

    if startDate and endDate and not query:
        targetData = TargetXProfileTweet.objects.filter(
            targetXProfile__Keyword__id__in=ids,
            tweetCreatedAt__date__range=[startDate, endDate],
            tweetSentiment__in=sentiments
        ).order_by('-tweetCreatedAt')

    if startDate and not endDate and not query:
        targetData = TargetXProfileTweet.objects.filter(
            targetXProfile__Keyword__id__in=ids,
            tweetCreatedAt__gte=startDate,
            tweetSentiment__in=sentiments
        ).order_by('-tweetCreatedAt')

    if endDate and not startDate and not query:
        targetData = TargetXProfileTweet.objects.filter(
            targetXProfile__Keyword__id__in=ids,
            tweetCreatedAt__lte=endDate,
            tweetSentiment__in=sentiments
        ).order_by('-tweetCreatedAt')

    if report == True:
        serializer = TargetXProfileTweetSerializer(targetData, many=True)
        return serializer.data
    
    serializer = TargetXProfileTweetSerializer(targetData, many=True)
    
    return serializer.data


def getYouTubeKeywordsData(request, ids, query, startDate, endDate,sentiments,report=False):
        
        if query is not None and startDate is not None and endDate is not None:
            targetData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__keyword__id__in=ids, 
                videoTitle__icontains=query, 
                videoPublishedAt__date__range=[startDate, endDate],
                videoSentiment__in=sentiments
            ).order_by('-id')
    
        if query and startDate and not endDate:
            targetData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__keyword__id__in=ids, 
                videoTitle__icontains=query, 
                videoPublishedAt__gte=startDate,
                videoSentiment__in=sentiments
            ).order_by('-id')
    
        if query and endDate and not startDate:
            targetData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__keyword__id__in=ids, 
                videoTitle__icontains=query, 
                videoPublishedAt__lte=endDate,
                videoSentiment__in=sentiments
            ).order_by('-id')
    
        if query and not startDate and not endDate:
            targetData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__keyword__id__in=ids, 
                videoTitle__icontains=query,
                videoSentiment__in=sentiments
            ).order_by('-id')
    
        if startDate and endDate and not query:
            targetData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__keyword__id__in=ids,
                videoPublishedAt__date__range=[startDate, endDate],
                videoSentiment__in=sentiments
            ).order_by('-videoPublishedAt')
    
        if startDate and not endDate and not query:
            targetData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__keyword__id__in=ids,
                videoPublishedAt__gte=startDate,
                videoSentiment__in=sentiments
            ).order_by('-videoPublishedAt')
    
        if endDate and not startDate and not query:
            targetData = TargetYoutubeProfileVideo.objects.filter(
                targetYoutubeProfile__keyword__id__in=ids,
                videoPublishedAt__lte=endDate,
                videoSentiment__in=sentiments
            ).order_by('-videoPublishedAt')
    
        if report == True:
            serializer = TargetYoutubeProfileVideoSerializer(targetData, many=True)
            return serializer.data
        
        serializer = TargetYoutubeProfileVideoSerializer(targetData, many=True)
        return serializer.data


def getWebKeywordsData(request, ids, query, startDate, endDate,sentiments,report=False):
        
        if query is not None and startDate is not None and endDate is not None:
            targetData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__keyword__id__in=ids, 
                articleTitle__icontains=query, 
                articlePublishedAt__date__range=[startDate, endDate],
                articleSentiment__in=sentiments
            ).order_by('-id')
    
        if query and startDate and not endDate:
            targetData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__keyword__id__in=ids, 
                articleTitle__icontains=query, 
                articlePublishedAt__gte=startDate,
                articleSentiment__in=sentiments
            ).order_by('-id')
    
        if query and endDate and not startDate:
            targetData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__keyword__id__in=ids, 
                articleTitle__icontains=query, 
                articlePublishedAt__lte=endDate,
                articleSentiment__in=sentiments
            ).order_by('-id')
    
        if query and not startDate and not endDate:
            targetData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__keyword__id__in=ids, 
                articleTitle__icontains=query,
                articleSentiment__in=sentiments
            ).order_by('-id')
    
        if startDate and endDate and not query:
            targetData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__keyword__id__in=ids,
                articlePublishedAt__date__range=[startDate, endDate],
                articleSentiment__in=sentiments
            ).order_by('-articlePublishedAt')
    
        if startDate and not endDate and not query:
            targetData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__keyword__id__in=ids,
                articlePublishedAt__gte=startDate,
                articleSentiment__in=sentiments
            ).order_by('-articlePublishedAt')
    
        if endDate and not startDate and not query:
            targetData = TargetWebProfileArticle.objects.filter(
                targetWebProfile__keyword__id__in=ids,
                articlePublishedAt__lte=endDate,
                articleSentiment__in=sentiments
            ).order_by('-articlePublishedAt')
    
        if report == True:
            serializer = TargetWebProfileArticleSerializer(targetData, many=True)
            return serializer.data
        
        serializer = TargetWebProfileArticleSerializer(targetData, many=True)
        return serializer.data

def searchKeywordData(request,x,youtube,web, ids, query, startDate, endDate,sentiments,report=False):
    xData = []
    youtubeData = []
    webData = []
    if x is not None:
        xData =getXKeywordsData(request, x, query, startDate, endDate,sentiments,report)
    if youtube is not None:
        youtubeData = getYouTubeKeywordsData(request, youtube, query, startDate, endDate,sentiments,report)
    if web is not None:
        webData = getWebKeywordsData(request, web, query, startDate, endDate,sentiments,report)

    combinedData = xData + youtubeData + webData
    paginated_profiles, pagination_data = paginate_queryset(combinedData, request)
    if report == True:
        return combinedData
    response_data = {
        'data': list(paginated_profiles),
        'pagination': pagination_data
    }
    return response_data


