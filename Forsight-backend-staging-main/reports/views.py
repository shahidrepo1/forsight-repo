import re
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import tempfile
from django.conf import settings
from rest_framework.decorators import api_view
from django.conf import settings
from datetime import datetime
from account.models import UserProfile
from reports.serializers import ReportSttNewsGptSerializer
from xcrawlers.models import TargetXProfileTweet
from xcrawlers.serializers import TargetXProfileTweetSerializer
from configurator.views import searchKeywordData, searchProfileData
from youtubecrawlers.models import TargetYoutubeProfileVideo
from youtubecrawlers.serializers import TargetYoutubeProfileVideoSerializer
from weasyprint import HTML
from bs4 import BeautifulSoup

from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings

from .utils import parse_html_tables, markdown_to_pdf_english_from_parsed_data
from visualizations.views import (
                                    getKeywordDataDonutChart,
                                    getKeywordDataBarChart,
                                    getKeywordDataPieChart,
                                    getProfileDataDonutChart,
                                    getProfileDataBarChart,
                                    getProfileDataPieChart
                                    )

from webcrawlers.models import TargetWebProfileArticle
from webcrawlers.serializers import TargetWebProfileArticleSerializer
from reports.utils import (markdown_to_pdf, markdown_to_pdf_english, parse_markdown_tables,
                            serve_pdf,
                            utc_date_time,
                            text_to_pdf
                         )


def senatizeProfileLink(profileLink):
    # Pattern to match both X.com (Twitter) and YouTube profile links
    x_pattern = re.compile(r"https://www\.x\.com/([^/]+)")
    youtube_pattern = re.compile(r"https://www\.youtube\.com/@([^/]+)")
    
    # Check for X.com profile link
    x_match = x_pattern.search(profileLink)
    if x_match:
        return x_match.group(1)

    # Check for YouTube profile link
    youtube_match = youtube_pattern.search(profileLink)
    if youtube_match:
        return youtube_match.group(1)
    
    # If neither match, return None
    return None

@api_view(['GET'])
def getConfiguredKeywordsDataReport(request):
    currentUserProfile = None
    print("query_params",request.query_params)
    active = request.query_params.get('active')
    source = request.query_params.get('source')
    query = request.query_params.get('query',None)
    startDate = request.query_params.get('startDate',None)
    endDate = request.query_params.get('endDate',None)
    x = request.query_params.get('x',None)
    youtube = request.query_params.get('youtube',None)
    web = request.query_params.get('web',None)
    facebook = request.query_params.get('facebook',None)
    sentiments = request.query_params.get('sentiments',None)
    sentiments = sentiments.split(',')
    report = True
    ## here i will add the start and end date after testing the searchKeywordData function
    # if source and active and query:
    #     source = source.split(',')
    #     chips = []
    #     searchData = searchKeywordData(request,source,query,startDate,endDate)
    #     donutChartData = getKeywordDataDonutChart(source,query,startDate,endDate)
    #     barChartData = getKeywordDataBarChart(source,query,startDate,endDate)
    #     pieChartData = getKeywordDataPieChart(source,query,startDate,endDate)
    #     tweetsData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=source).order_by('-id')
        
    #     for tweet in tweetsData:
    #         keword = tweet.targetXProfile.Keyword.keyword
    #         if keword not in chips:
    #             chips.append(keword)

    #     totalCount = len(searchData['data'])
    #     responseData = {
    #         'chips': chips,
    #         'donut': donutChartData,
    #         'barChart': barChartData,
    #         'pieChart': pieChartData,
    #         'totalCount': totalCount,
    #         'data': searchData['data'],
            
    #     } 
        
    #     return Response(responseData, status=status.HTTP_200_OK)
    
    if source and active:
        source = source.split(',')

        

        if query or startDate and endDate:
            chips = []
            if x is not None:
                x = x.split(',')
            if youtube is not None:
                youtube = youtube.split(',')
            if web is not None:
                web = web.split(',')
            

            searchData = searchKeywordData(request,x,youtube,web,source,query,startDate,endDate,sentiments,report)
            donutChartData = getKeywordDataDonutChart(x,youtube,web,query,startDate,endDate,sentiments)
            barChartData = getKeywordDataBarChart(x,youtube,web,query,startDate,endDate,sentiments)
            pieChartData = getKeywordDataPieChart(x,youtube,web,query,startDate,endDate,sentiments)
            totalCount = len(list(searchData))
            
            if x is not None:
                tweetData = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                               tweetSentiment__in=sentiments).order_by('-id')
                for tweet in tweetData:
                    keword = tweet.targetXProfile.Keyword.keyword
                    if keword not in chips:
                        chips.append(keword)
            if youtube is not None:
                youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                                          videoSentiment__in=sentiments).order_by('-id')
            
            
                for video in youtubeData:
                    keword = video.targetYoutubeProfile.keyword.keyword
                    if keword not in chips:
                        chips.append(keword)
            
            if web is not None:
                webData = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                                articleSentiment__in=sentiments).order_by('-id')
                for article in webData:
                    keword = article.targetWebProfile.keyword.keyword
                    if keword not in chips:
                        chips.append(keword)
                        

            chips = list(set(chips))
            
            responseData = {
                'chips': chips,
                'donut': donutChartData,
                'barChart': barChartData,
                'pieChart': pieChartData,
                'totalCount': totalCount,
                'data': searchData,
                
            } 
            
            return Response(responseData, status=status.HTTP_200_OK)
        else:
            chips = []
            totalCount = 0
            xSerializer = None
            youtubeSerializer = None
            webSerializer = None
            data = None

            if x is not None:
                
                x = x.split(',')
                targetTweets = TargetXProfileTweet.objects.filter(targetXProfile__Keyword__id__in=x,
                                                                    tweetSentiment__in=sentiments).order_by('-id')
                
                
                for tweet in targetTweets:
                    keword = tweet.targetXProfile.Keyword.keyword
                    if keword not in chips:
                        chips.append(keword)
            
                xSerializer = TargetXProfileTweetSerializer(targetTweets, many=True)
                totalCount += targetTweets.count()
                # here we will add the serlized data into data variable if there is no data then we will not add it

                data = xSerializer.data
            
                


            if youtube is not None:
                youtube = youtube.split(',')
                
                youtubeVideos = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__keyword__id__in=youtube,
                                                                            videoSentiment__in=sentiments).order_by('-id')
                for video in youtubeVideos:
                    keword = video.targetYoutubeProfile.keyword.keyword
                    if keword not in chips:
                        chips.append(keword)
                
                youtubeSerializer = TargetYoutubeProfileVideoSerializer(youtubeVideos, many=True)
                totalCount += youtubeVideos.count()

                if data is not None:
                    data = data + youtubeSerializer.data
                    
                else:
                    data = youtubeSerializer.data

            if web is not None:
                web = web.split(',')
                webArticles = TargetWebProfileArticle.objects.filter(targetWebProfile__keyword__id__in=web,
                                                                    articleSentiment__in=sentiments).order_by('-id')
                for article in webArticles:
                    keword = article.targetWebProfile.keyword.keyword
                    if keword not in chips:
                        chips.append(keword)
                
                webSerializer = TargetWebProfileArticleSerializer(webArticles, many=True)
                totalCount += webArticles.count()

                if data is not None:
                    data = data + webSerializer.data
                    
                else:
                    data = webSerializer.data
            
            donutChartData = getKeywordDataDonutChart(x,youtube,web,query,startDate,endDate,sentiments)
            barChartData = getKeywordDataBarChart(x,youtube,web,query,startDate,endDate,sentiments)
            pieChartData = getKeywordDataPieChart(x,youtube,web,query,startDate,endDate,sentiments)
            # data = xSerializer + youtubeSerializer
            response_data = {    
                'chips': chips,
                'donut': donutChartData,
                'barChart': barChartData,
                'pieChart': pieChartData,
                'totalCount': totalCount,
                'data': data,
                
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
    else:
        response_data = {
            'error': 'Invalid input data'
        }
        return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
def getConfiguredProfilesDataReport(request):
    currentUserProfile = None
    print("query params^^^^^^^^^^^^^^^^^^^^^^",request.query_params)
    active = request.query_params.get('active')
    source = request.query_params.get('source')
    query = request.query_params.get('query',None)
    startDate = request.query_params.get('startDate',None)
    endDate = request.query_params.get('endDate',None)
    sentiments = request.query_params.get('sentiments',None)
    sentiments = sentiments.split(',')
    report = True


    
    if source and active:
        if query or startDate and endDate:
            source = source.split(',')
            searchData = searchProfileData(request,source,query,startDate,endDate,report,sentiments)
            donutChartData = getProfileDataDonutChart(source,query,startDate,endDate,sentiments)
            barChartData = getProfileDataBarChart(source,query,startDate,endDate,sentiments)
            pieChartData = getProfileDataPieChart(source,query,startDate,endDate,sentiments)
            totalCount = len(searchData)
            chips = []
            tweetData = TargetXProfileTweet.objects.filter(targetXProfile__profile__id__in=source,
                                                              tweetSentiment__in=sentiments).order_by('-id')
            youtubeData = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__profile__id__in=source,
                                                                    videoSentiment__in=sentiments).order_by('-id')
            
            for tweet in tweetData:
                profile = tweet.targetXProfile.profile.profileUrl
                senatizedProfile = senatizeProfileLink(profile)
                profilePlatform = tweet.targetXProfile.profile.platform.name
                if senatizedProfile not in chips: 
                    chips.append(profilePlatform + '/' + senatizedProfile)

            for video in youtubeData:
                profile = video.targetYoutubeProfile.profile.profileUrl
                senatizedProfile = senatizeProfileLink(profile)
                profilePlatform = video.targetYoutubeProfile.profile.platform.name
                if senatizedProfile not in chips: 
                    chips.append(profilePlatform + '/' + senatizedProfile)

            chips = list(set(chips))
            
            responseData = {
                'chips': chips,
                'donut': donutChartData,
                'barChart': barChartData,
                'pieChart': pieChartData,
                'totalCount': totalCount,
                'data': searchData,
                
            } 
            
            return Response(responseData, status=status.HTTP_200_OK)
        else:

            source = source.split(',')
            targetTweets = TargetXProfileTweet.objects.filter(targetXProfile__profile__id__in=source,
                                                                tweetSentiment__in=sentiments).order_by('-id')
            youtubeVideos = TargetYoutubeProfileVideo.objects.filter(targetYoutubeProfile__profile__id__in=source,
                                                                        videoSentiment__in=sentiments).order_by('-id')
            webArticles = TargetWebProfileArticle.objects.filter(targetWebProfile__Profile__id__in=source,
                                                                articleSentiment__in=sentiments).order_by('-id')
            
            chips = []
            
            for tweet in targetTweets:
                profile = tweet.targetXProfile.profile.profileUrl
                senatizedProfile = senatizeProfileLink(profile)
                profilePlatform = tweet.targetXProfile.profile.platform.name
                if senatizedProfile not in chips: 
                    chips.append(profilePlatform + '/' + senatizedProfile)

            for video in youtubeVideos:
                profile = video.targetYoutubeProfile.profile.profileUrl
                senatizedProfile = senatizeProfileLink(profile)
                profilePlatform = video.targetYoutubeProfile.profile.platform.name
                if senatizedProfile:
                    chips.append(profilePlatform + '/' + senatizedProfile)
                    
            for article in webArticles:
                profile = article.targetWebProfile.Profile.profileUrl
                senatizedProfile = senatizeProfileLink(profile)
                profilePlatform = article.targetWebProfile.Profile.platform.name
                if senatizedProfile:
                    chips.append(profilePlatform + '/' + senatizedProfile)

            chips = list(set(chips))
            xData = TargetXProfileTweetSerializer(targetTweets, many=True)
            yData = TargetYoutubeProfileVideoSerializer(youtubeVideos, many=True)
            wData = TargetWebProfileArticleSerializer(webArticles, many=True)
            combinedData = xData.data + yData.data + wData.data
            donutChartData = getProfileDataDonutChart(source,query,startDate,endDate,sentiments)
            barChartData = getProfileDataBarChart(source,query,startDate,endDate,sentiments)
            pieChartData = getProfileDataPieChart(source,query,startDate,endDate, sentiments)
            totalCount = targetTweets.count() + youtubeVideos.count() + webArticles.count()
            
            response_data = {
                
                'chips': chips,
                'donut': donutChartData,
                'barChart': barChartData,
                'pieChart': pieChartData,
                'totalCount': totalCount,
                'data': combinedData
                
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
    else:
        response_data = {
            'error': 'Invalid input data'
        }
        return

def process_markdown_columns(markdown_text, max_columns=7):
    lines = markdown_text.split("\n")
    processed_lines = []
    
    header_processed = False  # Track if the header is processed to ensure correct trimming

    for line in lines:
        line = line.strip()

        # Check if it's a table row (starts and ends with |)
        if line.startswith("|") and line.endswith("|"):
            # Split columns while keeping empty ones (to maintain structure)
            columns = line.split("|")

            # Remove leading/trailing spaces from each column
            columns = [col.strip() for col in columns]

            # If it's the first table row (header), determine valid column count
            if not header_processed:
                valid_column_count = min(len(columns), max_columns)
                header_processed = True  # Mark that the header was processed

            # Trim to the valid number of columns
            truncated = columns[:valid_column_count]

            # Rebuild the line
            processed_line = "| " + " | ".join(truncated) + " |"
            processed_lines.append(processed_line)

    return "\n".join(processed_lines)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def getConfiguredNewsGPTReportData(request):
    """
    API to create a .pdf file from the text sent in the request body and allow the client to download it.
    """
    payload = request.data.get('payload', {})
    html_content = payload.get('result', '')
    html_content = html_content.replace('src="src/assets/', 'src="http://192.168.11.60:30151/src/assets/')

    print('Data I am getting...', html_content)

    filename = request.data.get('filename', 'generated_document')
    is_save = request.data.get('isSave', False)
    title = request.data.get('title', 'Headline Report')
    print(' title I am getting...', title)

    if "tabular" in title.lower():
        print('Table found')
        is_table = True
    else:
        print('Table not found')
        is_table = False

    if not html_content:
        return Response({'error': 'Text is required to generate the PDF file'}, status=400)

    is_urdu = payload.get('isUrdu', False)
    text = html_content

    processed_text = process_markdown_columns(text)

    if is_table:
        if is_urdu:
            print('Urdu text found')
            pdf_filename = "security_report.pdf"
            pdf_path = os.path.join(settings.MEDIA_ROOT, pdf_filename)
            markdown_to_pdf(text, pdf_path, report_title=title.upper())
            return serve_pdf(pdf_path)
        else:
            print('English text found')
            print(f'The Data {text}')
            if "<table" in text:
                parsed_data = parse_html_tables(text)
            else:
                parsed_data = parse_markdown_tables(text)

            print(f'Parse Data: {parsed_data}')
            pdf_filename = "security_report.pdf"
            pdf_path = os.path.join(settings.MEDIA_ROOT, pdf_filename)
            markdown_to_pdf_english(text, pdf_path, report_title=title.upper())
            return serve_pdf(pdf_path)

    if text:
        if is_urdu:
            print('Urdu text found')
            pdf_filename = "urdu_report.pdf"
            pdf_path = os.path.join(settings.MEDIA_ROOT, pdf_filename)
            text_to_pdf(text, pdf_path, report_title=title, language="ur")
            return serve_pdf(pdf_path)
        else:
            print('English text found', text)
            pdf_filename = "english_report.pdf"
            pdf_path = os.path.join(settings.MEDIA_ROOT, pdf_filename)
            text_to_pdf(text, pdf_path, report_title=title.upper(), language="en")
            return serve_pdf(pdf_path)

    if is_save:
        print('------------------------------------------')
        print("Saving the report data to the database...")
        print('------------------------------------------')
        user_profile = UserProfile.objects.get(user=request.user)
        data = {
            'title': title,
            'reportText': text,
            'createdAt': utc_date_time(),
        }
        serializer = ReportSttNewsGptSerializer(data=data, context={'user': user_profile})
        if serializer.is_valid():
            serializer.save()

