from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from account.models import UserProfile
from configurator.models import Profile, Keyword, Platform
from configurator.serializers import TargetProfileSerializer,TargetKeywordSerializer
from xcrawlers.models import TargetXProfile, TargetXProfileTweet
from configurator.models import Profile, Keyword, Platform
from configurator.serializers import TargetProfileSerializer,TargetKeywordSerializer
from xcrawlers.models import TargetXProfile, TargetXProfileTweet
from datetime import datetime, timedelta

from configurator.helper import (getAllConfiguredKeywordsData, 
                                 getSelectedKeywordsData,
                                 extractYoutubeChannelName,
                                 getConfiguredSelectedProfileData)
from configurator.helper import (getAllConfiguredKeywordsData, 
                                 getSelectedKeywordsData,
                                 getConfiguredSelectedProfileData,
                                 profileLinkValidator,
                                 extractPlatformIds,
                                 searchProfileData,
                                    searchKeywordData
                                 )

from forsight.helper import paginate_queryset
from forsight.helper import generateWordCloudData
from xcrawlers.producer import createNewXProfileBasedTarget, createNewKeywordBasedTarget
from xcrawlers.models import TargetXProfile, TargetXProfileTweet
from xcrawlers.serializers import (TargetXProfileSerializer, 
                                   TargetXProfileTweetSerializer,
                                   TargetXProfileAllFiledsTweetSerializer,
                                   TargetXProfileAllFiledsSerializer)

from youtubecrawlers.models import TargetYoutubeProfile, TargetYoutubeProfileVideo
from youtubecrawlers.serializers import TargetYoutubeProfileVideoSerializer
from youtubecrawlers.producer import createNewYoutbeProfileBasedTarget, createNewYoutubeKeywordBasedTarget

from webcrawlers.models import TargetWebProfile, TargetWebProfileArticle,topicModeling
from webcrawlers.serializers import TargetWebProfileArticleSerializer
from webcrawlers.producer import createNewWebProfileBasedTarget, createNewWebKeywordBasedTarget

from rest_framework.views import APIView
from .models import CrawlLog, SchedularLog
from .serializers import CrawlLogSerializer, SchedularLogSerializer
from django.utils.dateparse import parse_date
from datetime import datetime, time
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.http import HttpResponse
from openpyxl import Workbook
import datetime
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.http import HttpResponse
from openpyxl import Workbook
import datetime

from django.utils.timezone import localtime
from django.http import JsonResponse
from rest_framework.decorators import api_view

from datetime import datetime, timedelta

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def checkStatus(request):
    return Response({'message': 'Forsight Central Service is Up'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addNewProfile(request):
    targetProfileUrl = request.data.get('profile')
    platformName = request.data.get('platform')
    ai_models_enabled =  request.data.get('platform',[])
    platform = profileLinkValidator(targetProfileUrl)
    topic_modeling =  request.data.get('topicModeling', False)


    if platform == 'x' or 'youtube' or 'web':
        platformName = platform
        if not platformName or not targetProfileUrl:
            return Response({'message': 'Profile URL and platform are required'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'message': 'Invalid profile URL'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        currentUserProfile = UserProfile.objects.select_related('user').get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({'message': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

    platform_instance, created = Platform.objects.get_or_create(name=platformName)

    profileInstance, created = Profile.objects.get_or_create(
        profileUrl=targetProfileUrl,
        topicModeling=topic_modeling,
        defaults={'platform': platform_instance}
    )
    profileInstance.user.add(currentUserProfile)

    if platformName.lower() == 'x':
        if created:
            targetXProfileInstance = TargetXProfile.objects.create(profile=profileInstance)
            createNewXProfileBasedTarget(
                {'taregtProfileurl':targetProfileUrl,
                 'targetXProfileId': targetXProfileInstance.id,
                 'ai_models_enabled': ai_models_enabled
                }
                 )
        else:
            try:
                targetXProfileInstance = TargetXProfile.objects.get(profile=profileInstance)
            except TargetXProfile.DoesNotExist:
                pass  # Handle the case where the TargetXProfile does not exist
    
    #https://www.youtube.com/@ARYDigitalasia, https://www.youtube.com/@MovieExplaineUP, https://www.youtube.com/@SamEckholm, https://www.youtube.com/@Warthunder
    if platformName.lower() == 'youtube':
        if created:
            targetYoutubeProfileInstance = TargetYoutubeProfile.objects.create(profile=profileInstance)
            channelName = extractYoutubeChannelName(targetProfileUrl)
            createNewYoutbeProfileBasedTarget(
                {
                    "taregtProfile":channelName,
                    "targetYoutubeDbProfileId":targetYoutubeProfileInstance.id,
                  'ai_models_enabled': ai_models_enabled

                }
                
                )
        else:
            try:
                targetYoutubeProfileInstance = TargetYoutubeProfile.objects.get(profile=profileInstance)
            except TargetYoutubeProfile.DoesNotExist:
                pass

    if platformName.lower() == 'web':
        if created:
            targetWebProfileInstance = TargetWebProfile.objects.create(Profile=profileInstance)
            createNewWebProfileBasedTarget(
                {'taregtProfileurl':targetProfileUrl,
                 'targetWebProfileId': targetWebProfileInstance.id,
               'ai_models_enabled': ai_models_enabled,
               "topicModeling": topic_modeling,

                }
                 )
        else:
            try:
                targetWebProfileInstance = TargetWebProfile.objects.get(Profile=profileInstance)
            except TargetWebProfile.DoesNotExist:
                pass

    return Response({'message': 'Profile added successfully'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addNewKeyword(request):
    keyword = request.data.get('keyword')
    platforms = request.data.get('platforms')

    if not keyword or not platforms:
        return Response({'error': 'Keyword and platforms are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        currentUserProfile = UserProfile.objects.select_related('user').get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

    platform_instances = []
    for platform in platforms:
        platformInstance, created = Platform.objects.get_or_create(name=platform)
        platform_instances.append(platformInstance)

    keywordInstance, created = Keyword.objects.get_or_create(keyword=keyword)
    keywordInstance.user.add(currentUserProfile)
    keywordInstance.platforms.add(*platform_instances)
    keywordInstance.save()

    if 'X' in platforms or 'x' in platforms:
        if created:
            createNewKeywordBasedTarget(
                {'taregtProfilekeyword':keyword,
                 'kewordId': keywordInstance.id,
                })
        else:
            try:
                targetXProfileInstance = TargetXProfile.objects.get(Keyword=keywordInstance)
            except TargetXProfile.DoesNotExist:
                pass  # Handle the case where the TargetXProfile does not existt

    if 'youtube' in platforms:
        if created:
            createNewYoutubeKeywordBasedTarget(
                {'taregtKeyword':keyword,
                 'keywordId': keywordInstance.id,
                })
        else:
            try:
                targetYoutubeProfileInstance = TargetYoutubeProfile.objects.get(Keyword=keywordInstance)
            except TargetYoutubeProfile.DoesNotExist:
                pass
    if 'web' in platforms:
        if created:
            createNewWebKeywordBasedTarget(
                {'taregtProfilekeyword':keyword,
                 'kewordId': keywordInstance.id,
                })
        else:
            try:
                targetWebProfileInstance = TargetWebProfile.objects.get(keyword=keywordInstance)
            except TargetWebProfile.DoesNotExist:
                pass
            

    return Response({'message': 'Keyword added successfully'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getConfiguredProfiles(request):
    current_user_profile = UserProfile.objects.select_related('user').get(user=request.user)
    search_profile = request.GET.get('profile', None)
    # profiles = Profile.objects.select_related('platform').filter(user=current_user_profile).order_by('-id')
    profiles = Profile.objects.prefetch_related('user'
                                                ).select_related('platform'
                                                ).filter(user=current_user_profile).order_by('-id')

    if search_profile:
        profiles = profiles.filter(profileUrl__icontains=search_profile)
    ## i have intentionally removed pagination for now dont remove teh code of pagination ##
    # paginated_profiles,pagination_data = paginate_queryset(profiles, request)
    # serializer = TargetProfileSerializer(paginated_profiles, many=True)
    serializer = TargetProfileSerializer(profiles, many=True)
    response_data = {
        'profiles': serializer.data,
        # 'pagination': pagination_data
    }
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getConfiguredKeywords(request):
    current_user_profile = UserProfile.objects.select_related('user').get(user=request.user)
    search_keyword = request.GET.get('keyword', None)

    keywords = Keyword.objects.prefetch_related('user', 'platforms').filter(user=current_user_profile).order_by('-id')
    print(f"Total Keywords Before Filtering: {keywords.count()}")  # Debugging

    if search_keyword:
        keywords = keywords.filter(keyword__icontains=search_keyword)
        print(f"Total Keywords After Filtering ('{search_keyword}'): {keywords.count()}")  # Debugging

    ## i have intentionally removed pagination for now dont remove teh code of pagination ##
    # paginated_keywords, pagination_data = paginate_queryset(keywords, request)
    # serializer = TargetKeywordSerializer(paginated_keywords, many=True)
    serializer = TargetKeywordSerializer(keywords, many=True)
    response_data = {
        'keywords': serializer.data,
        # 'pagination': pagination_data
    }
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteProfile(request):
    profileId = request.data.get('profileId')
    try:
        profile = Profile.objects.get(id=profileId)
    except Profile.DoesNotExist:
        return Response({'message': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    profile.delete()
    return Response({'message': 'Profile deleted successfully'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteKeyword(request):
    keywordId = request.data.get('keywordId')
    try:
        keyword = Keyword.objects.get(id=keywordId)
    except Keyword.DoesNotExist:
        return Response({'message': 'Keyword not found'}, status=status.HTTP_404_NOT_FOUND)

    keyword.delete()
    return Response({'message': 'Keyword deleted successfully'}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suspendKeyword(request):
    keyword_id = request.data.get('keywordId')
    new_status = request.data.get('suspended')  # Get the status from the frontend

    if new_status is None:
        return Response({'message': 'Missing "suspended" flag in request'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        keyword = Keyword.objects.get(id=keyword_id)
    except Keyword.DoesNotExist:
        return Response({'message': 'Keyword not found'}, status=status.HTTP_404_NOT_FOUND)

    # Set the `suspended` status based on frontend input
    keyword.suspended = new_status
    keyword.save()
    
    status_text = "suspended" if keyword.suspended else "unsuspended"
    return Response({'message': f"Keyword '{keyword.keyword}' {status_text} successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getSingelData(request,platform,id):

    if platform == 'x':
        try:
            id = id.split('-')[1]
            print("\n\n id is ",id)
            data = TargetXProfileTweet.objects.get(id=id)
            print("\n\n data is ",data)
            serializer = TargetXProfileAllFiledsTweetSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except TargetXProfileTweet.DoesNotExist:
            return Response({'message': 'Data not found'}, status=status.HTTP_404_NOT_FOUND)
    if platform == 'youtube':
        try:
            id = id.split('-')[1]
            data = TargetYoutubeProfileVideo.objects.get(id=id)
            serializer = TargetYoutubeProfileVideoSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except TargetYoutubeProfileVideo.DoesNotExist:
            return Response({'message': 'Data not found'}, status=status.HTTP_404_NOT_FOUND)
        
    if platform == 'web':
        try:
            id = id.split('-')[1]
            data = TargetWebProfileArticle.objects.get(id=id)
            serializer = TargetWebProfileArticleSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except TargetWebProfileArticle.DoesNotExist:
            return Response({'message': 'Data not found'}, status=status.HTTP_404_NOT_FOUND)
        
    
    return Response({'message': 'invalid platform'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getConfiguredProfilesData(request):
    currentUserProfile = None
    source = request.query_params.get('source')
    active = request.query_params.get('active')
    query = request.query_params.get('query',None)
    startDate = request.query_params.get('startDate',None)
    endDate = request.query_params.get('endDate',None)
    sentiments = request.query_params.get('sentiments',None)
    platforms = request.query_params.get('platforms',None)


    if source and active and query or startDate or endDate:
        source = source.split(',')
        sentiment= sentiments.split(',')
        if query:
            query = query.strip()
        responseData = searchProfileData(request,source,query,startDate,endDate,sentiment,report=False, platforms=platforms)
        print('may ource and active and query or startDate or endDate: k andar hoon 2', source, sentiment)
        import time
        start = time.time()
        # query
        print(" may ource and active and query or startDate or endDate: k andar hoon 2 Time taken: ", time.time() - start)
        return Response(responseData, status=status.HTTP_200_OK)

    if source and active:
        source = source.split(',')
        sentiments= sentiments.split(',')
        print('may source and active k andar hoon 3', source, platforms)

        serializer = getConfiguredSelectedProfileData(request,currentUserProfile,source,sentiments, platforms)
        import time
        start = time.time()
        # query
        print("may source and active k andar hoon 3 Time taken: ", time.time() - start)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    else:
        pagination_data = {
        'count': 0,
        'next': None,
        'previous': None,
        'page_size': 0,
        'current_page': 0,
        'total_pages': 0,
    }
    
        response_data = {
         'data': [],
         'pagination': pagination_data 
        }

        return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getConfiguredKeywordsData(request):
    # currentUserProfile = UserProfile.objects.select_related('user').get(user=request.user)
    currentUserProfile = None
    active = request.query_params.get('active')
    source = request.query_params.get('source',None) ## source is either profile or keyword ids separated by comma
    youtube = request.query_params.get('youtube',None)
    x = request.query_params.get('x',None)
    web = request.query_params.get('web',None)
    facebook = request.query_params.get('facebook',None)
    platforms = request.query_params.get('platforms', None)

    print('--------------------')
    print('platforms', platforms)
    print('--------------------')

    query = request.query_params.get('query',None)
    startDate = request.query_params.get('startDate',None)
    endDate = request.query_params.get('endDate',None)
    sentiments = request.query_params.get('sentiments',None)

    if source and active and query or startDate or endDate:
        source_ids = source.split(',') if source else None
        x_ids = x.split(',') if x else None
        youtube_ids = youtube.split(',') if youtube else None
        web_ids = web.split(',') if web else None
        facebook_ids = facebook.split(',') if facebook else None
        sentiments= sentiments.split(',')
        responseData = searchKeywordData(request,x_ids,youtube_ids,web_ids,source,query,startDate,endDate,sentiments)
        return Response(responseData, status=status.HTTP_200_OK)
        
    if active or youtube or x or web or facebook:
        source_ids = source.split(',') if source else None
        youtube_ids = youtube.split(',') if youtube else None
        x_ids = x.split(',') if x else None
        web_ids = web.split(',') if web else None
        facebook_ids = facebook.split(',') if facebook else None
        sentiments= sentiments.split(',')

        serializer = getSelectedKeywordsData(request, currentUserProfile, youtube_ids, x_ids, web_ids, facebook_ids,sentiments, platforms=platforms)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    else:
        pagination_data = {
        'count': 0,
        'next': None,
        'previous': None,
        'page_size': 0,
        'current_page': 0,
        'total_pages': 0,
    }
    
        response_data = {
         'data': [],
         'pagination': pagination_data 
        }

        return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search(request):
    source = request.query_params.get('source')
    active = request.query_params.get('active')
    query = request.query_params.get('query',None)
    startDate = request.query_params.get('startDate',None)
    endDate = request.query_params.get('endDate',None)

    if active == 'profile' and source:
        source = source.split(',')
        responseData = searchProfileData(request,source,query,startDate,endDate)
        return Response(responseData, status=status.HTTP_200_OK)
    
    elif active == 'keyword' and source:
        pass

    else:
        return Response({'message': 'provide source and active status'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteData(request):
    ids = request.data.get('ids')
    ids = ids.split(',')
    xIds , youtubeIds, webIds, facebookIds = extractPlatformIds(ids)
    if xIds:    
        xtweets = TargetXProfileTweet.objects.filter(id__in=xIds)
        for id in xIds:
            data = TargetXProfileTweet.objects.get(id=id)
            if data.targetXProfile.profile:
                profile = data.targetXProfile.profile
                profile.dataCount -= 1
                profile.save()
            if data.targetXProfile.Keyword:
                keyword = data.targetXProfile.Keyword
                keyword.xDataCount -= 1
                keyword.save()
        xtweets.delete()
        
    if youtubeIds:
        youtubeVideos =TargetYoutubeProfileVideo.objects.filter(id__in=youtubeIds)
        for id in youtubeIds:
            data = TargetYoutubeProfileVideo.objects.get(id=id)
            if data.targetYoutubeProfile.profile:
                profile = data.targetYoutubeProfile.profile
                profile.dataCount -= 1
                profile.save()
            if data.targetYoutubeProfile.keyword:
                keyword = data.targetYoutubeProfile.keyword
                keyword.youtubeDataCount -= 1
                keyword.save()

        youtubeVideos.delete()

    if webIds:
        webArticles = TargetWebProfileArticle.objects.filter(id__in=webIds)
        for id in webIds:
            data = TargetWebProfileArticle.objects.get(id=id)
            if data.targetWebProfile.Profile:
                profile = data.targetWebProfile.Profile
                profile.dataCount -= 1
                profile.save()
            if data.targetWebProfile.keyword:
                keyword = data.targetWebProfile.keyword
                keyword.webDataCount -= 1
                keyword.save()
        webArticles.delete()
    return Response({'message': 'Data deleted successfully'}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def updateSentiment(request,platform,id):
    sentiment = request.data.get('sentiment')
    possible_sentiments = ['positive', 'negative', 'neutral']
    if platform == 'x':
        try: 
            id = id.split('-')[1]
            data = TargetXProfileTweet.objects.get(id=id)
        except TargetXProfileTweet.DoesNotExist:
            return Response({'message': 'Data not found'}, status=status.HTTP_404_NOT_FOUND)
        if sentiment.lower() not in possible_sentiments:
            return Response({'message': 'Invalid sentiment'}, status=status.HTTP_400_BAD_REQUEST)
        data.tweetSentiment = sentiment.lower()
        data.save()
        return Response({'message': 'Sentiment updated successfully'}, status=status.HTTP_200_OK)

    if platform == 'youtube':
        try:
            id = id.split('-')[1]
            data = TargetYoutubeProfileVideo.objects.get(id=id)
        except TargetYoutubeProfileVideo.DoesNotExist:
            return Response({'message': 'Data not found'}, status=status.HTTP_404_NOT_FOUND)
        if sentiment.lower() not in possible_sentiments:
            return Response({'message': 'Invalid sentiment'}, status=status.HTTP_400_BAD_REQUEST)
        data.videoSentiment = sentiment.lower()
        data.save()
        return Response({'message': 'Sentiment updated successfully'}, status=status.HTTP_200_OK)
    
    if platform == 'web':
        try:
            id = id.split('-')[1]
            data = TargetWebProfileArticle.objects.get(id=id)
        except TargetWebProfileArticle.DoesNotExist:
            return Response({'message': 'Data not found'}, status=status.HTTP_404_NOT_FOUND)
        if sentiment.lower() not in possible_sentiments:
            return Response({'message': 'Invalid sentiment'}, status=status.HTTP_400_BAD_REQUEST)
        data.articleSentiment = sentiment.lower()
        data.save()
        return Response({'message': 'Sentiment updated successfully'}, status=status.HTTP_200_OK)
    
    return Response({'message': 'Invalid platform'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def getConfiguredKeywordsDataReport(request):
    # currentUserProfile = UserProfile.objects.select_related('user').get(user=request.user)
    currentUserProfile = None
    active = request.query_params.get('active')
    source = request.query_params.get('source') ## source is either profile or keyword ids separated by comma
    query = request.query_params.get('query',None)
    startDate = request.query_params.get('startDate',None)
    endDate = request.query_params.get('endDate',None)

    if source and active and query or startDate or endDate:
        source = source.split(',')
        responseData = searchKeywordData(request,source,query,startDate,endDate)
        return Response(responseData, status=status.HTTP_200_OK)
    
    if source and active:
        source = source.split(',')
        # serializer = getSelectedKeywordsData(request,currentUserProfile,source)
        targetTweets = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=source).order_by('-id')
        # paginated_profiles,pagination_data = paginate_queryset(targetTweets, request)
        serializer = TargetXProfileTweetSerializer(targetTweets, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    else:
        pagination_data = {
        'count': 0,
        'next': None,
        'previous': None,
        'page_size': 0,
        'current_page': 0,
        'total_pages': 0,
    }
    
        response_data = {
         'data': [],
         'pagination': pagination_data 
        }

        return Response(response_data, status=status.HTTP_200_OK)


class CrawlLogListView(APIView):
    def get(self, request):
        start_date_str = request.query_params.get('startDate')
        end_date_str = request.query_params.get('endDate')

        logs = CrawlLog.objects.all()

        # Apply optional date filters
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
                }, status=status.HTTP_400_BAD_REQUEST)

        logs = logs.order_by('-startedAt')

        # Apply your custom paginator
        paginated_logs, pagination_data = paginate_queryset(logs, request, page_size=15)
        serializer = CrawlLogSerializer(paginated_logs, many=True)

        return Response({
            'data': serializer.data,
            'pagination': pagination_data
        }, status=status.HTTP_200_OK)
    
    
class SchedularLogListView(APIView):
    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        logs = SchedularLog.objects.all()

        if start_date_str and end_date_str:
            try:
                start_date = parse_date(start_date_str)
                end_date = parse_date(end_date_str)

                if not start_date or not end_date:
                    raise ValueError("Invalid date format")

                start_datetime = datetime.combine(start_date, time.min)
                end_datetime = datetime.combine(end_date, time.max)

                logs = logs.filter(started_at__range=(start_datetime, end_datetime))

            except Exception as e:
                return Response({
                    "error": f"Invalid date input. Use format YYYY-MM-DD. Error: {str(e)}"
                }, status=status.HTTP_400_BAD_REQUEST)

        logs = logs.order_by('-started_at')
        serializer = SchedularLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ExportYoutubeVideosExcel(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        wb = Workbook()
        ws = wb.active
        ws.title = "Web Profile Articles"

        headers = [
            "ID",
            "Target Web Profile ID",
            "Article Title",
            "Article Description",
            "Original Thumbnail",
            "Published At",
            "Original Article URL",
            "Article Sentiment",
            "Media",
            "Thumbnail"
        ]
        ws.append(headers)

        # Define start and end datetime for May 15, 2025
        start_date = datetime(2025, 5, 15)
        end_date = start_date + timedelta(days=1)

        articles = TargetWebProfileArticle.objects.filter(
            articlePublishedAt__gte=start_date,
            articlePublishedAt__lt=end_date
        ).order_by('-articlePublishedAt')

        for article in articles:
            ws.append([
                article.id,
                article.targetWebProfile_id if article.targetWebProfile else '',
                article.articleTitle or '',
                article.articleDescription or '',
                article.originalThumbnail or '',
                article.articlePublishedAt.strftime('%Y-%m-%d %H:%M:%S') if article.articlePublishedAt else '',
                article.originalArticleUrl or '',
                article.articleSentiment or '',
                article.media.url if article.media else '',
                article.thumbnail.url if article.thumbnail else '',
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="web_profile_articles_20250515.xlsx"'
        wb.save(response)
        return response

from configurator.models import CustomPrompt
from .serializers import CustomPromptSerializer
from rest_framework import viewsets

class CustomPromptViewSet(viewsets.ModelViewSet):
    queryset = CustomPrompt.objects.all().order_by('-created_at')
    serializer_class = CustomPromptSerializer

from urllib.parse import urlparse

def get_base_url(url: str) -> str:
    if not url:
        return ""
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"


@api_view(["GET"])
def get_topic_modeling(request):
    """
    Returns all saved AI Responses in the structure required by frontend with pagination.
    """
    responses = topicModeling.objects.all().order_by("-created_at")

    # Apply your custom paginator
    paginated_responses, pagination_data = paginate_queryset(responses, request, page_size=15)

    data = []
    for resp in paginated_responses:
        sources = []
        # Map urls to source objects (use index as name if no explicit names are available)
        for i, url in enumerate(resp.urls):
            sources.append({
                "name": get_base_url(url),
                "url": url,
            })

        data.append({
            "id": str(resp.id),
            "content": {
                "title": resp.topic_title,
                "description": resp.topic_content,
                "createdAt": resp.created_at
            },
            "images": resp.images,
            "sources": sources
        })

    return JsonResponse({
        "data": data,
        "pagination": pagination_data
    }, safe=False, status=200)
