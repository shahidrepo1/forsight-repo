import hashlib
import json

from django.core.cache import cache
from django.db.models import Count, Sum

from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from configurator.models import CrawlLog, Profile, Keyword
from forsight.helper import generateWordCloudData
from webcrawlers.models import TargetWebProfileArticle
from xcrawlers.models import TargetXProfile, TargetXProfileTweet
from youtubecrawlers.models import TargetYoutubeProfile, TargetYoutubeProfileVideo

from webcrawlers.models import TargetWebProfile

CACHE_TIMEOUT = 60 * 5  # Cache for 5 minutes

def getProfileDataDonutChart(ids, search, startDate, endDate, sentiments, platforms=None):
    # Default to all platforms if none are specified
    if not platforms:
        platforms = ["x", "youtube", "web"]
    from django.db.models import Q, Count
    def build_or_query(field_name, search_string):
        terms = [term.strip() for term in search_string.split(',') if term.strip()]
        query = Q()
        for term in terms:
            query |= Q(**{f"{field_name}__icontains": term})
        return query
    
    combinedData = []

    # x (X)
    if "x" in platforms:
        tweetData = TargetXProfileTweet.objects.filter(
            targetXProfile__profile__id__in=ids,
            tweetSentiment__in=sentiments
        )
        if search:
            # tweetData = tweetData.filter(tweetText__icontains=search)
            tweetData = tweetData.filter(build_or_query('tweetText', search))

        if startDate and endDate:
            tweetData = tweetData.filter(tweetCreatedAt__date__range=[startDate, endDate])
        tweetData = tweetData.values('tweetSentiment').annotate(count=Count('id'))
        combinedData.extend(tweetData)

    # YouTube
    if "youtube" in platforms:
        youtubeData = TargetYoutubeProfileVideo.objects.filter(
            targetYoutubeProfile__profile__id__in=ids,
            videoSentiment__in=sentiments
        )
        if search:
            # youtubeData = youtubeData.filter(videoTitle__icontains=search)
            youtubeData = youtubeData.filter(build_or_query('videoTitle', search))

        if startDate and endDate:
            youtubeData = youtubeData.filter(videoPublishedAt__date__range=[startDate, endDate])
        youtubeData = youtubeData.values('videoSentiment').annotate(count=Count('id'))
        combinedData.extend(youtubeData)

    # Web Articles
    if "web" in platforms:
        webData = TargetWebProfileArticle.objects.filter(
            targetWebProfile__Profile__id__in=ids,
            articleSentiment__in=sentiments
        )
        if search:
            # webData = webData.filter(articleTitle__icontains=search)
            webData = webData.filter(build_or_query('articleTitle', search))

        if startDate and endDate:
            webData = webData.filter(articlePublishedAt__date__range=[startDate, endDate])
        webData = webData.values('articleSentiment').annotate(count=Count('id'))
        combinedData.extend(webData)

    # Initialize response dictionary
    responseData = {
        'negative': 0,
        'neutral': 0,
        'positive': 0,
    }

    # Aggregate sentiment counts
    for item in combinedData:
        sentiment = item.get('tweetSentiment') or item.get('videoSentiment') or item.get('articleSentiment')
        count = item['count']
        if sentiment == 'positive':
            responseData['positive'] += count
        elif sentiment == 'negative':
            responseData['negative'] += count
        elif sentiment == 'neutral':
            responseData['neutral'] += count

    return responseData

def getKeywordDataDonutChart(x,youtube,web, search, startDate, endDate,sentiments, platforms=None):
    
    responseData = {
        
        'negative': 0,
        'neutral': 0,
        'positive': 0,
    }
    if platforms:
        if "web" in platforms and "x" not in platforms and "youtube" not in platforms:
            x = None
            youtube = None
        elif "x" in platforms and "youtube" in platforms and "web" not in platforms:
            web = None
        elif "youtube" in platforms and "web" in platforms and "x" not in platforms:
            x = None
        elif "x" in platforms and "web" in platforms and "youtube" not in platforms:
            youtube = None
        elif "x" in platforms and "youtube" not in platforms and "web" not in platforms:
            youtube = None
            web = None
        elif "youtube" in platforms and "x" not in platforms and "web" not in platforms:
            x = None
            web = None
        elif "web" in platforms and "x" not in platforms and "youtube" not in platforms:
            x = None
            youtube = None

    if search and startDate and endDate:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetText__icontains=search,
                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                    tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in xData:
                sentiment = item['tweetSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoTitle__icontains=search,
                                                    videoPublishedAt__date__range=[startDate, endDate],
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in youtubeData:
                sentiment = item['videoSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count
        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleTitle__icontains=search,
                                                    articlePublishedAt__date__range=[startDate, endDate],
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in webData:
                sentiment = item['articleSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count
        

    elif startDate and endDate:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                    tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in xData:
                sentiment = item['tweetSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count
        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoPublishedAt__date__range=[startDate, endDate],
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in youtubeData:
                sentiment = item['videoSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count

        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articlePublishedAt__date__range=[startDate, endDate],
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in webData:
                sentiment = item['articleSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count

    elif search:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetText__icontains=search,
                                                    tweetSentiment__in=sentiments
                                                    
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            
            for item in xData:
                sentiment = item['tweetSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoTitle__icontains=search,
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            
            for item in youtubeData:
                sentiment = item['videoSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count
        
        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleTitle__icontains=search,
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            
            for item in webData:
                sentiment = item['articleSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count
    
    else:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                       tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                        )
            
            for item in xData:
                sentiment = item['tweetSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count
        if youtube is not None:

        
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                        )
            
            for item in youtubeData:
                sentiment = item['videoSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count
        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                        )
            
            for item in webData:
                sentiment = item['articleSentiment']
                count = item['count']
                if sentiment == 'positive':
                    responseData['positive'] += count
                elif sentiment == 'negative':
                    responseData['negative'] += count
                elif sentiment == 'neutral':
                    responseData['neutral'] += count

    return responseData


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sentimentDonutChart(request):
    active = request.query_params.get('active')
    search = request.query_params.get('query')
    startDate = request.query_params.get('startDate')
    endDate = request.query_params.get('endDate')
    source = request.query_params.get('source')
    x = request.query_params.get('x', None)
    facebook = request.query_params.get('facebook', None)
    web = request.query_params.get('web', None)
    youtube = request.query_params.get('youtube', None)
    sentiments = request.query_params.get('sentiments', None)
    platforms = request.query_params.get('platforms', None)
    if active and source:
        if active == 'profile':
            source = source.split(',')
            if sentiments is not None:
                sentiments = sentiments.split(',')
            if search:
                search = search.strip()
            responseData = getProfileDataDonutChart(source, search, startDate, endDate, sentiments, platforms=platforms)
            return Response(responseData, status=status.HTTP_200_OK)
        elif active == 'keyword':
            x_ids = x.split(',') if x else None
            youtube_ids = youtube.split(',') if youtube else None
            web_ids = web.split(',') if web else None
            facebook_ids = facebook.split(',') if facebook else None
            sentiments = sentiments.split(',')
            responseData = getKeywordDataDonutChart(x_ids,youtube_ids,web_ids, search, startDate, endDate,sentiments, platforms=platforms)
            print('111111111111111111111111111111', responseData)

            return Response(responseData, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Invalid Request, source or active profiles/keywords missing"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        resposneData = {
            'negative': 0,
            'neutral': 0,
            'positive': 0
        }
        return Response(resposneData, status=status.HTTP_200_OK)


def getProfileDataBarChart(ids, search, startDate, endDate, sentiments, platforms=None):
    # If no platforms are selected, include all platforms by default
    from django.db.models import Q

    def build_or_query(field_name, search_string):
        terms = [term.strip() for term in search_string.split(',') if term.strip()]
        query = Q()
        for term in terms:
            query |= Q(**{f"{field_name}__icontains": term})
        return query
    if not platforms:
        platforms = ["x", "youtube", "web"]

    tweetData = youtubeData = webData = []

    if "x" in platforms:
        tweetData = TargetXProfileTweet.objects.filter(
            targetXProfile__profile__id__in=ids,
            tweetSentiment__in=sentiments
        )
        if search:
            # tweetData = tweetData.filter(tweetText__icontains=search)
            tweetData = tweetData.filter(build_or_query('tweetText', search))

        if startDate and endDate:
            tweetData = tweetData.filter(tweetCreatedAt__date__range=[startDate, endDate])
        tweetData = tweetData.values('tweetSentiment').annotate(count=Count('id'))

    if "youtube" in platforms:
        youtubeData = TargetYoutubeProfileVideo.objects.filter(
            targetYoutubeProfile__profile__id__in=ids,
            videoSentiment__in=sentiments
        )
        if search:
            # youtubeData = youtubeData.filter(videoTitle__icontains=search)
            youtubeData = youtubeData.filter(build_or_query('videoTitle', search))

        if startDate and endDate:
            youtubeData = youtubeData.filter(videoPublishedAt__date__range=[startDate, endDate])
        youtubeData = youtubeData.values('videoSentiment').annotate(count=Count('id'))

    if "web" in platforms:
        webData = TargetWebProfileArticle.objects.filter(
            targetWebProfile__Profile__id__in=ids,
            articleSentiment__in=sentiments
        )
        if search:
            # webData = webData.filter(articleTitle__icontains=search)
            webData = webData.filter(build_or_query('articleTitle', search))

        if startDate and endDate:
            webData = webData.filter(articlePublishedAt__date__range=[startDate, endDate])
        webData = webData.values('articleSentiment').annotate(count=Count('id'))

    combinedData = list(tweetData) + list(youtubeData) + list(webData)

    # Initialize counts
    positive_counts = [0, 0, 0, 0]  # x, facebook, web, youtube
    negative_counts = [0, 0, 0, 0]
    neutral_counts = [0, 0, 0, 0]

    for item in combinedData:
        sentiment = item.get('tweetSentiment') or item.get('videoSentiment') or item.get('articleSentiment')
        count = item['count']
        index = 0  # Default to Twitter (X)
        
        if 'tweetSentiment' in item:
            index = 0  # X (Twitter)
        elif 'videoSentiment' in item:
            index = 3  # YouTube
        elif 'articleSentiment' in item:
            index = 2  # Web
        
        if sentiment == 'positive':
            positive_counts[index] += count
        elif sentiment == 'negative':
            negative_counts[index] += count
        elif sentiment == 'neutral':
            neutral_counts[index] += count

    responseData = {
        'platforms': ['x', 'facebook', 'web', 'youtube'],
        'negative': negative_counts,
        'neutral': neutral_counts,
        'positive': positive_counts,
    }

    return responseData


def getKeywordDataBarChart(x,youtube,web, search, startDate, endDate,sentiments, platforms=None):

    if not platforms:
        platforms = ['x', 'youtube', 'web']

    positive_counts = [0,0,0,0]
    negative_counts = [0,0,0,0]
    neutral_counts = [0,0,0,0]

    if search and startDate and endDate:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetText__icontains=search,
                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                    tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in xData:
                sentiment = item['tweetSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[0] += count
                elif sentiment == 'negative':
                    negative_counts[0] += count
                elif sentiment == 'neutral':
                    neutral_counts[0] += count

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoTitle__icontains=search,
                                                    videoPublishedAt__date__range=[startDate, endDate],
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in youtubeData:
                sentiment = item['videoSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[3] += count
                elif sentiment == 'negative':
                    negative_counts[3] += count
                elif sentiment == 'neutral':
                    neutral_counts[3] += count

        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleTitle__icontains=search,
                                                    articlePublishedAt__date__range=[startDate, endDate],
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in webData:
                sentiment = item['articleSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[2] += count
                elif sentiment == 'negative':
                    negative_counts[2] += count
                elif sentiment == 'neutral':
                    neutral_counts[2] += count
    

    elif startDate and endDate:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                    tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in xData:
                sentiment = item['tweetSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[0] += count
                elif sentiment == 'negative':
                    negative_counts[0] += count
                elif sentiment == 'neutral':
                    neutral_counts[0] += count

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoPublishedAt__date__range=[startDate, endDate],
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in youtubeData:
                sentiment = item['videoSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[3] += count
                elif sentiment == 'negative':
                    negative_counts[3] += count
                elif sentiment == 'neutral':
                    neutral_counts[3] += count

        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articlePublishedAt__date__range=[startDate, endDate],
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in webData:
                sentiment = item['articleSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[2] += count
                elif sentiment == 'negative':
                    negative_counts[2] += count
                elif sentiment == 'neutral':
                    neutral_counts[2] += count


        
    elif search:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetText__icontains=search,
                                                    tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in xData:
                sentiment = item['tweetSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[0] += count
                elif sentiment == 'negative':
                    negative_counts[0] += count
                elif sentiment == 'neutral':
                    neutral_counts[0] += count

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoTitle__icontains=search,
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in youtubeData:
                sentiment = item['videoSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[3] += count
                elif sentiment == 'negative':
                    negative_counts[3] += count
                elif sentiment == 'neutral':
                    neutral_counts[3] += count

        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleTitle__icontains=search,
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            for item in webData:
                sentiment = item['articleSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[2] += count
                elif sentiment == 'negative':
                    negative_counts[2] += count
                elif sentiment == 'neutral':
                    neutral_counts[2] += count
    else:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                       tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                        )
            for item in xData:
                sentiment = item['tweetSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[0] += count
                elif sentiment == 'negative':
                    negative_counts[0] += count
                elif sentiment == 'neutral':
                    neutral_counts[0] += count

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                        )
            for item in youtubeData:
                sentiment = item['videoSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[3] += count
                elif sentiment == 'negative':
                    negative_counts[3] += count
                elif sentiment == 'neutral':
                    neutral_counts[3] += count

        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                        )
            for item in webData:
                sentiment = item['articleSentiment']
                count = item['count']
                if sentiment == 'positive':
                    positive_counts[2] += count
                elif sentiment == 'negative':
                    negative_counts[2] += count
                elif sentiment == 'neutral':
                    neutral_counts[2] += count

                    
    # Ensure platforms defaults to all if None or empty
    if platforms[0] == '':  
        platforms = ['x', 'facebook', 'web', 'youtube']

    platform_indices = {'x': 0, 'facebook': 1, 'web': 2, 'youtube': 3}
    all_platforms = ['x', 'facebook', 'web', 'youtube']

    # Create full lists with zero values
    final_negative = [0] * len(all_platforms)
    final_neutral = [0] * len(all_platforms)
    final_positive = [0] * len(all_platforms)

    # Ensure platforms is always a list
    if isinstance(platforms, str):
        platforms = platforms.split(',')  # Convert string to a list
        platforms = [p.strip() for p in platforms]  # Remove spaces

    print('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    print('Corrected platforms:', platforms)
    print('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')

    # Populate the values for selected platforms
    for platform in platforms:
        if platform not in platform_indices:
            print(f"Warning: Platform '{platform}' not recognized!")
            continue  # Skip unknown platforms

        index = platform_indices[platform]
        final_negative[index] = negative_counts[index]
        final_neutral[index] = neutral_counts[index]
        final_positive[index] = positive_counts[index]

    responseData = {
        'platforms': all_platforms,  # Always include all platforms
        'negative': final_negative,
        'neutral': final_neutral,
        'positive': final_positive,
    }

    return responseData




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sentimentsBarChart(request):
    active = request.query_params.get('active')
    source = request.query_params.get('source')
    search = request.query_params.get('query')
    startDate = request.query_params.get('startDate')
    endDate = request.query_params.get('endDate')
    x = request.query_params.get('x', None)
    facebook = request.query_params.get('facebook', None)
    web = request.query_params.get('web', None)
    youtube = request.query_params.get('youtube', None)
    sentiments = request.query_params.get('sentiments', None)
    platforms = request.query_params.get('platforms', None)

    if active and source:
        if active == 'profile':
            source = source.split(',')
            if sentiments is not None:
                sentiments = sentiments.split(',')
            if search:
                search = search.strip()
                print('****************')
                print('The platforms in sentimentsBarChart', type(search))
                print('****************')

            responseData = getProfileDataBarChart(source, search, startDate, endDate,sentiments, platforms=platforms)
            return Response(responseData, status=status.HTTP_200_OK)
        elif active == 'keyword':
            x_ids = x.split(',') if x else None
            youtube_ids = youtube.split(',') if youtube else None
            web_ids = web.split(',') if web else None
            facebook_ids = facebook.split(',') if facebook else None
            if sentiments is not None:
                sentiments = sentiments.split(',')
            responseData = getKeywordDataBarChart(x_ids,youtube_ids, web_ids,search, startDate, endDate,sentiments, platforms=platforms)
            return Response(responseData, status=status.HTTP_200_OK)
        else:
            return Response({'message':'Invalid Request, source or active profiles/keywords missing'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        resposneData = {
            'platforms': [],
            'positive': [],
            'negative': [],
            'neutral': []
        }
        return Response(resposneData, status=status.HTTP_200_OK)


def getProfileDataPieChart(ids, search, startDate, endDate, sentiments, platforms=None):
    from django.db.models import Q
    def build_or_query(field_name, search_string):
        terms = [term.strip() for term in search_string.split(',') if term.strip()]
        query = Q()
        for term in terms:
            query |= Q(**{f"{field_name}__icontains": term})
        return query
    

    # Default to all platforms if none are specified
    if not platforms:
        platforms = ["x", "youtube", "web"]

    combinedData = []
    facebookDataCount = 0  # Assuming no Facebook data in current model

    # x (X)
    if "x" in platforms:
        tweetData = TargetXProfileTweet.objects.filter(
            targetXProfile__profile__id__in=ids,
            tweetSentiment__in=sentiments
        )
        if search:
            # tweetData = tweetData.filter(tweetText__icontains=search)
            tweetData = tweetData.filter(build_or_query('tweetText', search))

        if startDate and endDate:
            tweetData = tweetData.filter(tweetCreatedAt__date__range=[startDate, endDate])
        tweetData = tweetData.values('tweetSentiment').annotate(count=Count('id'))
        combinedData.extend(tweetData)

    # YouTube
    if "youtube" in platforms:
        youtubeData = TargetYoutubeProfileVideo.objects.filter(
            targetYoutubeProfile__profile__id__in=ids,
            videoSentiment__in=sentiments
        )
        if search:
            # youtubeData = youtubeData.filter(videoTitle__icontains=search)
            youtubeData = youtubeData.filter(build_or_query('videoTitle', search))

        if startDate and endDate:
            youtubeData = youtubeData.filter(videoPublishedAt__date__range=[startDate, endDate])
        youtubeData = youtubeData.values('videoSentiment').annotate(count=Count('id'))
        combinedData.extend(youtubeData)

    # Web Articles
    if "web" in platforms:
        webData = TargetWebProfileArticle.objects.filter(
            targetWebProfile__Profile__id__in=ids,
            articleSentiment__in=sentiments
        )
        if search:
            webData = webData.filter(articleTitle__icontains=search)
            webData = webData.filter(build_or_query('articleTitle', search))

        if startDate and endDate:
            webData = webData.filter(articlePublishedAt__date__range=[startDate, endDate])
        webData = webData.values('articleSentiment').annotate(count=Count('id'))
        combinedData.extend(webData)

    # Aggregate total counts per platform
    total_count = sum([item['count'] for item in combinedData])
    webDataCount = sum([item['count'] for item in webData]) if "web" in platforms else 0
    youtubeDataCount = sum([item['count'] for item in youtubeData]) if "youtube" in platforms else 0
    xDataCount = sum([item['count'] for item in tweetData]) if "x" in platforms else 0
    totalCount = total_count + facebookDataCount

    # Response
    responseData = {
        'x': xDataCount,
        'facebook': facebookDataCount,
        'web': webDataCount,
        'youtube': youtubeDataCount,
        'totalCount': totalCount
    }
    
    return responseData


def getKeywordDataPieChart(x,youtube, web,search, startDate, endDate,sentiments, platforms=None):
    
    facebookDataCount = 0
    webDataCount = 0
    youtubeDataCount = 0
    xDataCount = 0
    totalCount = 0

    if search and startDate and endDate:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetText__icontains=search,
                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                    tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            xDataCount = sum([item['count'] for item in xData])

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoTitle__icontains=search,
                                                    videoPublishedAt__date__range=[startDate, endDate],
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            youtubeDataCount = sum([item['count'] for item in youtubeData])

        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleTitle__icontains=search,
                                                    articlePublishedAt__date__range=[startDate, endDate],
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            webDataCount = sum([item['count'] for item in webData])

        
    elif startDate and endDate:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                    tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            xDataCount = sum([item['count'] for item in xData])

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoPublishedAt__date__range=[startDate, endDate],
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            youtubeDataCount = sum([item['count'] for item in youtubeData])

        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articlePublishedAt__date__range=[startDate, endDate],
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            webDataCount = sum([item['count'] for item in webData])

        
    elif search:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetText__icontains=search,
                                                    tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            xDataCount = sum([item['count'] for item in xData])

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoTitle__icontains=search,
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            youtubeDataCount = sum([item['count'] for item in youtubeData])

        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleTitle__icontains=search,
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                    )
            webDataCount = sum([item['count'] for item in webData])

        
    else:
        if x is not None:
            xData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                       tweetSentiment__in=sentiments
                                                    ).values('tweetSentiment'
                                                    ).annotate(count=Count('id')
                                                        )
            xDataCount = sum([item['count'] for item in xData])

        if youtube is not None:
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoSentiment__in=sentiments
                                                    ).values('videoSentiment'
                                                    ).annotate(count=Count('id')
                                                        )
            youtubeDataCount = sum([item['count'] for item in youtubeData])

        if web is not None:
            webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleSentiment__in=sentiments
                                                    ).values('articleSentiment'
                                                    ).annotate(count=Count('id')
                                                        )
            webDataCount = sum([item['count'] for item in webData]) 
    
    totalCount = xDataCount + facebookDataCount + webDataCount + youtubeDataCount
    if platforms:
        responseData = {
            'x': xDataCount if 'x' in platforms else 0,
            'facebook': facebookDataCount if 'facebook' in platforms else 0,
            'web': webDataCount if 'web' in platforms else 0,
            'youtube': youtubeDataCount if 'youtube' in platforms else 0,
        }

        responseData['totalCount'] = sum(responseData.values())

        print('responseData inside the platforms', responseData)
        return responseData

    responseData = {
            'x': xDataCount,
            'facebook': facebookDataCount,
            'web': webDataCount,
            'youtube': youtubeDataCount,
            'totalCount': totalCount
        }
    print('responseData inside the data piechart', responseData)
    return responseData

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def platformPychart(request):
    active = request.query_params.get('active')
    source = request.query_params.get('source')
    search = request.query_params.get('query')
    startDate = request.query_params.get('startDate')
    endDate = request.query_params.get('endDate')
    x = request.query_params.get('x', None)
    facebook = request.query_params.get('facebook', None)
    web = request.query_params.get('web', None)
    youtube = request.query_params.get('youtube', None)
    sentiments = request.query_params.get('sentiments', None)
    platforms = request.query_params.get('platforms', None)
    
    if active and source:
        if active == 'profile':
            source = source.split(',')
            if sentiments is not None:
                sentiments = sentiments.split(',')
            data = getProfileDataPieChart(source, search, startDate, endDate, sentiments, platforms)
            return Response(data, status=status.HTTP_200_OK)
        elif active == 'keyword':
            youtube_ids = youtube.split(',') if youtube else None
            x_ids = x.split(',') if x else None
            web_ids = web.split(',') if web else None
            facebook_ids = facebook.split(',') if facebook else None
            if sentiments is not None:
                sentiments = sentiments.split(',')
            data = getKeywordDataPieChart(x_ids,youtube_ids,web_ids, search, startDate, endDate, sentiments, platforms=platforms)
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({'message':'Invalid Request, source or active profiles/keywords missing'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        resposneData = {
            'x': 0,
            'facebook': 0,
            'web': 0,
            'youtube': 0,
            'totalCount': 0
        }
        return Response(resposneData, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sunburst_chart_view(request):
    data = Keyword.objects.values('platforms__name', 'keyword').annotate(keyword_count=Count('id'))
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trending_words_view(request):
    data = TargetXProfileTweet.objects.values('tweetKeyword', 'tweetSentiment').annotate(keyword_count=Count('id')).order_by('-keyword_count')
    return Response(data)


def getActiveProfilesData(ids, search, startDate, endDate, sentiments, platforms=None):
    if not platforms:
        platforms = ["x", "youtube", "web"]

    combinedData = []
    print('------------------------------------------')
    print('Platform is... ', search)
    print('------------------------------------------')
    from django.db.models import Q

    def build_or_query(field_name, search_string):
        terms = [term.strip() for term in search_string.split(',') if term.strip()]
        query = Q()
        for term in terms:
            query |= Q(**{f"{field_name}__icontains": term})
        return query
    
    if "x" in platforms:
        tweets = TargetXProfileTweet.objects.select_related(
            "targetXProfile", "targetXProfile__profile"
        ).filter(
            targetXProfile__profile__id__in=ids,
            tweetSentiment__in=sentiments
        )
        if search:
            # tweets = tweets.filter(tweetText__icontains=search)
            tweets = tweets.filter(build_or_query('tweetText', search))

        if startDate and endDate:
            tweets = tweets.filter(tweetCreatedAt__date__range=[startDate, endDate])
        combinedData += list(tweets.values_list("tweetText", flat=True))
    
    if "youtube" in platforms:
        videos = TargetYoutubeProfileVideo.objects.select_related(
            "targetYoutubeProfile", "targetYoutubeProfile__profile"
        ).filter(
            targetYoutubeProfile__profile__id__in=ids,
            videoSentiment__in=sentiments
        )
        if search:
            # videos = videos.filter(videoTitle__icontains=search)
            videos = videos.filter(build_or_query('videoTitle', search))

        if startDate and endDate:
            videos = videos.filter(videoPublishedAt__date__range=[startDate, endDate])
        combinedData += list(videos.values_list("videoTitle", flat=True))
    
    if "web" in platforms:
        articles = TargetWebProfileArticle.objects.select_related(
            "targetWebProfile", "targetWebProfile__Profile"
        ).filter(
            targetWebProfile__Profile__id__in=ids,
            articleSentiment__in=sentiments
        )
        if search:
            # articles = articles.filter(articleDescription__icontains=search)
            articles = articles.filter(build_or_query('articleDescription', search))

        if startDate and endDate:
            articles = articles.filter(articlePublishedAt__date__range=[startDate, endDate])
        combinedData += list(articles.values_list("articleDescription", flat=True))
        
    if combinedData:
        cleared_data = []

        for item in combinedData:
            if item is None:
                continue
            if not isinstance(item, str):
                continue
            if item:
                cleared_data.append(item[:99999])

        if not cleared_data:
            return []
        return generateWordCloudData(cleared_data)    
    return []


def getXKeywordsDataWordCloud(x, search, startDate, endDate,sentiments):
        
        if search and startDate and endDate:
            activeKeywords = TargetXProfile.objects.filter(Keyword__id__in=x)
            activeKeywordsTweets = TargetXProfileTweet.objects.filter(targetXProfile__in=activeKeywords,
                                                                    tweetText__icontains=search,
                                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                                    tweetSentiment__in=sentiments
                                                                    ).values_list('tweetText', flat=True)
        elif search and startDate:
            activeKeywords = TargetXProfile.objects.filter(Keyword__id__in=x)
            activeKeywordsTweets = TargetXProfileTweet.objects.filter(targetXProfile__in=activeKeywords,
                                                                    tweetText__icontains=search,
                                                                    tweetCreatedAt__gte=startDate,
                                                                    tweetSentiment__in=sentiments
                                                                    ).values_list('tweetText', flat=True)
        elif search and endDate:
            activeKeywords = TargetXProfile.objects.filter(Keyword__id__in=x)
            activeKeywordsTweets = TargetXProfileTweet.objects.filter(targetXProfile__in=activeKeywords,
                                                                    tweetText__icontains=search,
                                                                    tweetCreatedAt__lte=endDate,
                                                                    tweetSentiment__in=sentiments
                                                                    ).values_list('tweetText', flat=True)
        elif startDate and endDate:
            activeKeywords = TargetXProfile.objects.filter(Keyword__id__in=x)
            activeKeywordsTweets = TargetXProfileTweet.objects.filter(targetXProfile__in=activeKeywords,
                                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                                    tweetSentiment__in=sentiments
                                                                    ).values_list('tweetText', flat=True)
        elif search:
            activeKeywords = TargetXProfile.objects.filter(Keyword__id__in=x)
            activeKeywordsTweets = TargetXProfileTweet.objects.filter(targetXProfile__in=activeKeywords,
                                                                    tweetText__icontains=search,
                                                                    tweetSentiment__in=sentiments
                                                                    ).values_list('tweetText', flat=True)
        else:
    
            activeKeywords = TargetXProfile.objects.filter(Keyword__id__in=x)
            activeKeywordsTweets = TargetXProfileTweet.objects.filter(targetXProfile__in=activeKeywords,
                                                                    tweetSentiment__in=sentiments
                                                                      ).values_list('tweetText', flat=True)
        
        xKeywordData = activeKeywordsTweets
        if xKeywordData.count() > 0:
            return xKeywordData
        else:
            return []

def getYoutubeKeywordsDataWordCloud(youtube, search, startDate, endDate,sentiments):
            
            if search and startDate and endDate:
                activeKeywords = TargetYoutubeProfile.objects.filter(keyword__id__in=youtube)
                activeKeywordsVideos = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__in=activeKeywords,
                                                                        videoTitle__icontains=search,
                                                                        videoPublishedAt__date__range=[startDate, endDate],
                                                                        videoSentiment__in=sentiments
                                                                        ).values_list('videoTitle', flat=True)
            elif search and startDate:
                activeKeywords = TargetYoutubeProfile.objects.filter(keyword__id__in=youtube)
                activeKeywordsVideos = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__in=activeKeywords,
                                                                        videoTitle__icontains=search,
                                                                        videoPublishedAt__gte=startDate,
                                                                        videoSentiment__in=sentiments
                                                                        ).values_list('videoTitle', flat=True)
            elif search and endDate:
                activeKeywords = TargetYoutubeProfile.objects.filter(keyword__id__in=youtube)
                activeKeywordsVideos = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__in=activeKeywords,
                                                                        videoTitle__icontains=search,
                                                                        videoPublishedAt__lte=endDate,
                                                                        videoSentiment__in=sentiments
                                                                        ).values_list('videoTitle', flat=True)
            elif startDate and endDate:
                activeKeywords = TargetYoutubeProfile.objects.filter(keyword__id__in=youtube)
                activeKeywordsVideos = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__in=activeKeywords,
                                                                        videoPublishedAt__date__range=[startDate, endDate],
                                                                        videoSentiment__in=sentiments
                                                                        ).values_list('videoTitle', flat=True)
            elif search:
                activeKeywords = TargetYoutubeProfile.objects.filter(keyword__id__in=youtube)
                activeKeywordsVideos = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__in=activeKeywords,
                                                                        videoTitle__icontains=search,
                                                                        videoSentiment__in=sentiments
                                                                        ).values_list('videoTitle', flat=True)
            else:
        
                activeKeywords = TargetYoutubeProfile.objects.filter(keyword__id__in=youtube)
                activeKeywordsVideos = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__in=activeKeywords,
                                                                        videoSentiment__in=sentiments
                                                                                ).values_list('videoTitle', flat=True)
            
            youtubeKeywordData = activeKeywordsVideos
            if youtubeKeywordData.count() > 0:
                return youtubeKeywordData
            else:
                return []


def getWebKeywordsDataWordCloud(web, search, startDate, endDate,sentiments):
                
                if search and startDate and endDate:
                    activeKeywords = TargetWebProfile.objects.filter(keyword__id__in=web)
                    activeKeywordsArticles = TargetWebProfileArticle.objects.filter(targetWebProfile__in=activeKeywords,
                                                                            articleTitle__icontains=search,
                                                                            articlePublishedAt__date__range=[startDate, endDate],
                                                                            articleSentiment__in=sentiments
                                                                            ).values_list('articleDescription', flat=True)
                elif search and startDate:
                    activeKeywords = TargetWebProfile.objects.filter(keyword__id__in=web)
                    activeKeywordsArticles = TargetWebProfileArticle.objects.filter(targetWebProfile__in=activeKeywords,
                                                                            articleTitle__icontains=search,
                                                                            articlePublishedAt__gte=startDate,
                                                                            articleSentiment__in=sentiments
                                                                            ).values_list('articleDescription', flat=True)
                elif search and endDate:
                    activeKeywords = TargetWebProfile.objects.filter(keyword__id__in=web)
                    activeKeywordsArticles = TargetWebProfileArticle.objects.filter(targetWebProfile__in=activeKeywords,
                                                                            articleTitle__icontains=search,
                                                                            articlePublishedAt__lte=endDate,
                                                                            articleSentiment__in=sentiments
                                                                            ).values_list('articleDescription', flat=True)
                elif startDate and endDate:
                    activeKeywords = TargetWebProfile.objects.filter(keyword__id__in=web)
                    activeKeywordsArticles = TargetWebProfileArticle.objects.filter(targetWebProfile__in=activeKeywords,
                                                                            articlePublishedAt__date__range=[startDate, endDate],
                                                                            articleSentiment__in=sentiments
                                                                            ).values_list('articleDescription', flat=True)
                elif search:
                    activeKeywords = TargetWebProfile.objects.filter(keyword__id__in=web)
                    activeKeywordsArticles = TargetWebProfileArticle.objects.filter(targetWebProfile__in=activeKeywords,
                                                                            articleTitle__icontains=search,
                                                                            articleSentiment__in=sentiments
                                                                            ).values_list('articleDescription', flat=True)
                else:
            
                    activeKeywords = TargetWebProfile.objects.filter(keyword__id__in=web)
                    activeKeywordsArticles = TargetWebProfileArticle.objects.filter(targetWebProfile__in=activeKeywords,
                                                                            articleSentiment__in=sentiments
                                                                            ).values_list('articleDescription', flat=True)
                
                webKeywordData = activeKeywordsArticles
                if webKeywordData.count() > 0:
                    return webKeywordData
                else:
                    return []
   
def getActiveKeywordsData(x, youtube, web, ids, search, startDate, endDate, sentiments, platforms=None):
    if not platforms:
        platforms = ["x", "youtube", "web"]

    combinedData = []

    if "x" in platforms and x is not None:
        xKeywordData = getXKeywordsDataWordCloud(x, search, startDate, endDate, sentiments) or []
        combinedData += list(xKeywordData)

    if "youtube" in platforms and youtube is not None:
        youtubeKeywordData = getYoutubeKeywordsDataWordCloud(youtube, search, startDate, endDate, sentiments) or []
        combinedData += list(youtubeKeywordData)

    if "web" in platforms and web is not None:
        webKeywordData = getWebKeywordsDataWordCloud(web, search, startDate, endDate, sentiments) or []
        combinedData += list(webKeywordData)

    if combinedData:
        combinedData = [item[:9999999] for item in combinedData]  # Limit string length
        return generateWordCloudData(combinedData)

    return []


## api with caching the data 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generateWordCloud(request):
    active = request.query_params.get('active')
    source = request.query_params.get('source')  # source is either profile or keyword ids separated by comma
    search = request.query_params.get('query')
    startDate = request.query_params.get('startDate')
    endDate = request.query_params.get('endDate')
    x = request.query_params.get('x', None)
    facebook = request.query_params.get('facebook', None)
    web = request.query_params.get('web', None)
    youtube = request.query_params.get('youtube', None)
    sentiments = request.query_params.get('sentiments', None)
    platforms = request.query_params.get('platforms', None)

    # Convert lists to strings for hashing (since query parameters may be lists)
    params_dict = {
        "active": active,
        "source": source,
        "search": search,
        "startDate": startDate,
        "endDate": endDate,
        "x": x,
        "facebook": facebook,
        "web": web,
        "youtube": youtube,
        "sentiments": sentiments,
        "platforms": platforms,
    }

    # Generate a unique cache key using MD5 hash
    cache_key = "wordcloud_" + hashlib.md5(json.dumps(params_dict, sort_keys=True).encode()).hexdigest()
    
    # 🔥 Check cache first
    cached_response = cache.get(cache_key)
    if cached_response:
        return Response(cached_response, status=status.HTTP_200_OK)

    if active and source:
        source = source.split(',')
        sentiments = sentiments.split(',') if sentiments else []
        
        if active == 'profile':
            if search:
                search = search.strip()
            topWordsData = getActiveProfilesData(source, search, startDate, endDate, sentiments, platforms)
        elif active == 'keyword':
            x_ids = x.split(',') if x else None
            youtube_ids = youtube.split(',') if youtube else None
            web_ids = web.split(',') if web else None
            facebook_ids = facebook.split(',') if facebook else None
            topWordsData = getActiveKeywordsData(x_ids, youtube_ids, web_ids, source, search, startDate, endDate, sentiments, platforms)
            
            if topWordsData is None:
                return Response([], status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Invalid Request, source or active profiles/keywords missing'}, status=status.HTTP_400_BAD_REQUEST)

        # 🔥 Store response in cache
        cache.set(cache_key, topWordsData, timeout=CACHE_TIMEOUT)
        
        return Response(topWordsData, status=status.HTTP_200_OK)
    
    return Response([], status=status.HTTP_200_OK)

from django.db.models import Q
def build_or_query(field_name, terms):
    q = Q()
    for term in terms:
        q |= Q(**{f"{field_name}__icontains": term.strip()})
    return q


from django.db.models import Q
def build_or_query(field_name, terms):
    q = Q()
    for term in terms:
        q |= Q(**{f"{field_name}__icontains": term.strip()})
    return q

# new code with comma based search
def getProfileTotalRecords(ids, search, startDate, endDate, sentiments, platforms=None):
    # Default to all platforms if none are specified
    if not platforms:
        platforms = ["x", "youtube", "web"]

    # Initialize counts
    XDataCount = 0
    youtubeDataCount = 0
    webDataCount = 0

    # Fetch counts based on selected platforms
    if "x" in platforms:
        qs = TargetXProfileTweet.objects.filter(
            targetXProfile__profile__id__in=ids,
            tweetSentiment__in=sentiments
        )
        if search:
            qs = qs.filter(build_or_query('tweetText', search))
        if startDate and endDate:
            qs = qs.filter(tweetCreatedAt__date__range=[startDate, endDate])
        elif startDate:
            qs = qs.filter(tweetCreatedAt__gte=startDate)
        elif endDate:
            qs = qs.filter(tweetCreatedAt__lte=endDate)
        XDataCount = qs.count()


    if "youtube" in platforms:
        qs = TargetYoutubeProfileVideo.objects.filter(
            targetYoutubeProfile__profile__id__in=ids,
            videoSentiment__in=sentiments
        )
        if search:
            qs = qs.filter(build_or_query('videoTitle', search))
        if startDate and endDate:
            qs = qs.filter(videoPublishedAt__date__range=[startDate, endDate])
        elif startDate:
            qs = qs.filter(videoPublishedAt__gte=startDate)
        elif endDate:
            qs = qs.filter(videoPublishedAt__lte=endDate)
        youtubeDataCount = qs.count()


    if "web" in platforms:
        qs = TargetWebProfileArticle.objects.filter(
            targetWebProfile__Profile__id__in=ids,
            articleSentiment__in=sentiments
        )
        if search:
            qs = qs.filter(build_or_query('articleTitle', search))
        if startDate and endDate:
            qs = qs.filter(articlePublishedAt__date__range=[startDate, endDate])
        elif startDate:
            qs = qs.filter(articlePublishedAt__gte=startDate)
        elif endDate:
            qs = qs.filter(articlePublishedAt__lte=endDate)
        webDataCount = qs.count()


    facebookDataCount = 0  # Not implemented yet

    totalCount = XDataCount + facebookDataCount + webDataCount + youtubeDataCount
    return totalCount


# def getProfileTotalRecords(ids, search, startDate, endDate, sentiments, platforms=None):
#     # Default to all platforms if none are specified
#     if not platforms:
#         platforms = ["x", "youtube", "web"]

#     # Initialize counts
#     XDataCount = 0
#     youtubeDataCount = 0
#     webDataCount = 0

#     # Fetch counts based on selected platforms
#     if "x" in platforms:
#         if search and startDate and endDate:
#             XDataCount = TargetXProfileTweet.objects.filter(
#                 targetXProfile__profile__id__in=ids,
#                 tweetText__icontains=search,
#                 tweetCreatedAt__date__range=[startDate, endDate],
#                 tweetSentiment__in=sentiments
#             ).count()
#         elif search and startDate:
#             XDataCount = TargetXProfileTweet.objects.filter(
#                 targetXProfile__profile__id__in=ids,
#                 tweetText__icontains=search,
#                 tweetCreatedAt__gte=startDate
#             ).count()
#         elif search and endDate:
#             XDataCount = TargetXProfileTweet.objects.filter(
#                 targetXProfile__profile__id__in=ids,
#                 tweetText__icontains=search,
#                 tweetCreatedAt__lte=endDate
#             ).count()
#         elif startDate and endDate:
#             XDataCount = TargetXProfileTweet.objects.filter(
#                 targetXProfile__profile__id__in=ids,
#                 tweetCreatedAt__date__range=[startDate, endDate],
#                 tweetSentiment__in=sentiments
#             ).count()
#         elif search:
#             XDataCount = TargetXProfileTweet.objects.filter(
#                 targetXProfile__profile__id__in=ids,
#                 tweetText__icontains=search,
#                 tweetSentiment__in=sentiments
#             ).count()
#         else:
#             XDataCount = TargetXProfileTweet.objects.filter(
#                 targetXProfile__profile__id__in=ids,
#                 tweetSentiment__in=sentiments
#             ).count()

#     if "youtube" in platforms:
#         if search and startDate and endDate:
#             youtubeDataCount = TargetYoutubeProfileVideo.objects.filter(
#                 targetYoutubeProfile__profile__id__in=ids,
#                 videoTitle__icontains=search,
#                 videoPublishedAt__date__range=[startDate, endDate],
#                 videoSentiment__in=sentiments
#             ).count()
#         elif startDate and endDate:
#             youtubeDataCount = TargetYoutubeProfileVideo.objects.filter(
#                 targetYoutubeProfile__profile__id__in=ids,
#                 videoPublishedAt__date__range=[startDate, endDate],
#                 videoSentiment__in=sentiments
#             ).count()
#         elif search:
#             youtubeDataCount = TargetYoutubeProfileVideo.objects.filter(
#                 targetYoutubeProfile__profile__id__in=ids,
#                 videoTitle__icontains=search,
#                 videoSentiment__in=sentiments
#             ).count()
#         else:
#             youtubeDataCount = TargetYoutubeProfileVideo.objects.filter(
#                 targetYoutubeProfile__profile__id__in=ids,
#                 videoSentiment__in=sentiments
#             ).count()

#     if "web" in platforms:
#         if search and startDate and endDate:
#             webDataCount = TargetWebProfileArticle.objects.filter(
#                 targetWebProfile__Profile__id__in=ids,
#                 articleTitle__icontains=search,
#                 articlePublishedAt__date__range=[startDate, endDate],
#                 articleSentiment__in=sentiments
#             ).count()
#         elif startDate and endDate:
#             webDataCount = TargetWebProfileArticle.objects.filter(
#                 targetWebProfile__Profile__id__in=ids,
#                 articlePublishedAt__date__range=[startDate, endDate],
#                 articleSentiment__in=sentiments
#             ).count()
#         elif search:
#             webDataCount = TargetWebProfileArticle.objects.filter(
#                 targetWebProfile__Profile__id__in=ids,
#                 articleTitle__icontains=search,
#                 articleSentiment__in=sentiments
#             ).count()
#         else:
#             webDataCount = TargetWebProfileArticle.objects.filter(
#                 targetWebProfile__Profile__id__in=ids,
#                 articleSentiment__in=sentiments
#             ).count()

#     facebookDataCount = 0  # Not implemented yet

#     totalCount = XDataCount + facebookDataCount + webDataCount + youtubeDataCount
#     return totalCount


def getKeywordTotalRecords(x,youtube,web, search, startDate, endDate,sentiments, platforms=None):

    if not platforms:
        platforms = ['x', 'youtube', 'web']
    facebookDataCount = 0
    webDataCount = 0
    youtubeDataCount = 0
    xDataCount = 0
    totalCount = 0

    if search and startDate and endDate:
        if x is not None:
            xDataCount = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetText__icontains=search,
                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                    tweetSentiment__in=sentiments
                                                    ).count()
        if youtube is not None:
            youtubeDataCount = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoTitle__icontains=search,
                                                    videoPublishedAt__date__range=[startDate, endDate],
                                                    videoSentiment__in=sentiments
                                                    ).count()
            
        if web is not None:
            webDataCount = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleTitle__icontains=search,
                                                    articlePublishedAt__date__range=[startDate, endDate],
                                                    articleSentiment__in=sentiments
                                                    ).count()
            
    elif startDate and endDate:
        if x is not None:
            xDataCount = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetCreatedAt__date__range=[startDate, endDate],
                                                    tweetSentiment__in=sentiments
                                                    ).count()
        if youtube is not None:
            youtubeDataCount = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoPublishedAt__date__range=[startDate, endDate],
                                                    videoSentiment__in=sentiments
                                                    ).count()
        if web is not None:
            webDataCount = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articlePublishedAt__date__range=[startDate, endDate],
                                                    articleSentiment__in=sentiments
                                                    ).count()
            
    elif search:
        if x is not None:

            xDataCount = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                    tweetText__icontains=search,
                                                    tweetSentiment__in=sentiments
                                                    ).count()
        if youtube is not None:
            youtubeDataCount = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoTitle__icontains=search,
                                                    videoSentiment__in=sentiments
                                                    ).count()
        if web is not None:
            webDataCount = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleTitle__icontains=search,
                                                    articleSentiment__in=sentiments
                                                    ).count()
    else:
        if x is not None:
            xDataCount = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                         tweetSentiment__in=sentiments
                                                    ).count()
        if youtube is not None:
            youtubeDataCount = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                    videoSentiment__in=sentiments
                                                    ).count()
        if web is not None:
            webDataCount = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                    articleSentiment__in=sentiments
                                                    ).count()
            
    # XDataCount = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=ids).count()
    totalCount = xDataCount + facebookDataCount + webDataCount + youtubeDataCount
    totalCount = sum([
        xDataCount if "x" in platforms else 0,
        youtubeDataCount if "youtube" in platforms else 0,
        webDataCount if "web" in platforms else 0,
        facebookDataCount if "facebook" in platforms else 0
    ])
    print('####### Total Count', totalCount)
    return totalCount


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def totalRecords(request):
    active = request.query_params.get('active')
    source = request.query_params.get('source')
    search = request.query_params.get('query')
    startDate = request.query_params.get('startDate')
    endDate = request.query_params.get('endDate')
    x = request.query_params.get('x', None)
    facebook = request.query_params.get('facebook', None)
    web = request.query_params.get('web', None)
    youtube = request.query_params.get('youtube', None)
    sentiments = request.query_params.get('sentiments', None)
    plaforms = request.query_params.get('platforms', None)
    
    search = request.query_params.get('query')
    search = search.split(',') if search else []

    if active and source:
        if active == 'profile':
            source = source.split(',')
            if sentiments is not None:
                sentiments = sentiments.split(',')
            totalCount = getProfileTotalRecords(source, search, startDate, endDate, sentiments, plaforms)

            return Response({'totalCount': totalCount}, status=status.HTTP_200_OK)
        elif active == 'keyword':
            x_ids = x.split(',') if x else None
            youtube_ids = youtube.split(',') if youtube else None
            web_ids = web.split(',') if web else None
            facebook_ids = facebook.split(',') if facebook else None
            if sentiments is not None:
                sentiments = sentiments.split(',')
            totalCount = getKeywordTotalRecords(x_ids,youtube_ids,web_ids, search, startDate, endDate,sentiments, platforms=plaforms)
            return Response({'totalCount': totalCount}, status=status.HTTP_200_OK)
        else:
            return Response({'message':'Invalid Request, source or active profiles/keywords missing'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        responseData = {
            'totalCount': 0
        }
        return Response(responseData, status=status.HTTP_200_OK)
    

from django.utils.dateparse import parse_date
from datetime import datetime, time
@api_view(['GET'])
def crawl_log_status_summary(request):
    start_date_str = request.query_params.get('startDate')
    end_date_str = request.query_params.get('endDate')

    logs = CrawlLog.objects.all()

    if start_date_str and end_date_str:
        try:
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)

            if not start_date or not end_date:
                raise ValueError("Invalid date format")

            start_datetime = datetime.combine(start_date, time.min)
            end_datetime = datetime.combine(end_date, time.max)

            logs = logs.filter(startedAt__range=(start_datetime, end_datetime))
        except Exception as e:
            return Response({
                "error": f"Invalid date input. Use format YYYY-MM-DD. Error: {str(e)}"
            }, status=400)

    status_counts = logs.values('status').annotate(count=Count('status'))

    data = {'RUNNING': 0, 'SUCCESS': 0, 'FAILED': 0}
    for entry in status_counts:
        status = entry['status']
        data[status] = entry['count']

    return Response(data)


def crawllog_status_chart(request):
    start_date_str = request.GET.get('startDate')
    end_date_str = request.GET.get('endDate')

    logs = CrawlLog.objects.all()

    if start_date_str and end_date_str:
        try:
            start_date = parse_date(start_date_str)
            end_date = parse_date(end_date_str)

            if not start_date or not end_date:
                raise ValueError("Invalid date format")

            start_datetime = datetime.combine(start_date, time.min)
            end_datetime = datetime.combine(end_date, time.max)

            logs = logs.filter(startedAt__range=(start_datetime, end_datetime))
        except Exception as e:
            return JsonResponse({
                "error": f"Invalid date input. Use format YYYY-MM-DD. Error: {str(e)}"
            }, status=400)

    platforms = logs.values_list('profilePlatform', flat=True).distinct()

    running_counts = []
    success_counts = []
    failed_counts = []

    for platform in platforms:
        running_count = logs.filter(profilePlatform=platform, status='RUNNING').count()
        success_count = logs.filter(profilePlatform=platform, status='SUCCESS').count()
        failed_count = logs.filter(profilePlatform=platform, status='FAILED').count()

        running_counts.append(running_count)
        success_counts.append(success_count)
        failed_counts.append(failed_count)

    data = {
        "platforms": list(platforms),
        "running": running_counts,
        "success": success_counts,
        "failed": failed_counts
    }

    return JsonResponse(data)