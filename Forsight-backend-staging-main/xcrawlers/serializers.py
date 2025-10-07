from rest_framework import serializers
from xcrawlers.models import TargetXProfile, TargetXProfileTweet


from rest_framework import serializers
from .models import TargetXProfile
from django.conf import settings

class TargetXProfileSerializer(serializers.ModelSerializer):
    """
    - targetProfieName
    - targetProfileFollowersCount
    """
    targetProfileDbId = serializers.IntegerField(source='id')
    # targetProfileFastFollowersCount = serializers.SerializerMethodField()
    # targetProfileFavouritesCount = serializers.SerializerMethodField()
    targetProfileFollowersCount = serializers.SerializerMethodField()
    # targetProfileFriendsCount = serializers.SerializerMethodField()
    # targetProfileMediaCount = serializers.SerializerMethodField()
    # targetProfileNormalFollowersCount = serializers.SerializerMethodField()
    # targetProfileStatusesCount = serializers.SerializerMethodField()

    class Meta:
        model = TargetXProfile
        # exclude = ['id', 'profile', 'Keyword','targetProfileXId',
        #            'targetProfileScreenName','isBlueTickVerified','defaultProfile']
        fields = ['targetProfileDbId', 'targetProfileScreenName', 'targetProfileFollowersCount']

    def humanize_number(self, value):
        if value is None:
            return None
        if value >= 1_000_000:
            return f'{value // 1_000_000}M'
        elif value >= 1_000:
            return f'{value // 1_000}K'
        return str(value)

    def get_targetProfileFastFollowersCount(self, obj):
        return self.humanize_number(obj.targetProfileFastFollowersCount)

    def get_targetProfileFavouritesCount(self, obj):
        return self.humanize_number(obj.targetProfileFavouritesCount)

    def get_targetProfileFollowersCount(self, obj):
        return self.humanize_number(obj.targetProfileFollowersCount)

    def get_targetProfileFriendsCount(self, obj):
        return self.humanize_number(obj.targetProfileFriendsCount)

    def get_targetProfileMediaCount(self, obj):
        return self.humanize_number(obj.targetProfileMediaCount)

    def get_targetProfileNormalFollowersCount(self, obj):
        return self.humanize_number(obj.targetProfileNormalFollowersCount)

    def get_targetProfileStatusesCount(self, obj):
        return self.humanize_number(obj.targetProfileStatusesCount)



class TargetXProfileTweetSerializer(serializers.ModelSerializer):
    """
    -tweetCreateAt
    -tweetText
    -tweetFavoriteCount
    - retweetCount
    - tweetReplies
    - tweetBookmarkCount
    - tweetOriginalLink
    -tweetSentiment
    """
    tweetDbId = serializers.IntegerField(source='id')
    uniqueIdentifier = serializers.SerializerMethodField()
    targetXProfile = TargetXProfileSerializer()
    platform = serializers.SerializerMethodField()
    tweetReplies = serializers.SerializerMethodField()
    # tweetQuoteCount = serializers.SerializerMethodField()
    tweetFavoriteCount = serializers.SerializerMethodField()
    retweetCount = serializers.SerializerMethodField()
    tweetBookmarkCount = serializers.SerializerMethodField()
    
    

    class Meta:
        model = TargetXProfileTweet
        exclude = ['tweetQuoteCount','tweetKeyword','cleanTweetText','tweetImageData','tweetVideo','tweetImage']
        
    def get_platform(self, obj):
        return "x"

    def humanize_number(self, value):
        if value is None:
            return None
        if value >= 1_000_000:
            return f'{value // 1_000_000}M'
        elif value >= 1_000:
            return f'{value // 1_000}K'
        # elif value >= 1_000:
        #     return f'{value // 1_000}k'
        # else:

        return str(value)

    def get_tweetReplies(self, obj):
        return self.humanize_number(obj.tweetReplies)

    def get_tweetQuoteCount(self, obj):
        return self.humanize_number(obj.tweetQuoteCount)

    def get_tweetFavoriteCount(self, obj):
        return self.humanize_number(obj.tweetFavoriteCount)

    def get_retweetCount(self, obj):
        return self.humanize_number(obj.retweetCount)

    def get_tweetBookmarkCount(self, obj):
        return self.humanize_number(obj.tweetBookmarkCount)
    
    
    def get_uniqueIdentifier(self, obj):
        if obj.targetXProfile.profile is not None:
            return obj.targetXProfile.profile.platform.name+"-"+ str(obj.id)
        if obj.targetXProfile.Keyword is not None:
            platforms = obj.targetXProfile.Keyword.platforms.all()
            for platform in platforms:
                if platform.name == "x":
                    return platform.name+"-"+ str(obj.id)


class TargetXProfileAllFiledsSerializer(serializers.ModelSerializer):
    """""
    - targetProfieName
    - targetProfileFollowersCount
    """
    targetProfileDbId = serializers.IntegerField(source='id')
    
    targetProfileFastFollowersCount = serializers.SerializerMethodField()
    targetProfileFavouritesCount = serializers.SerializerMethodField()
    targetProfileFollowersCount = serializers.SerializerMethodField()
    targetProfileFriendsCount = serializers.SerializerMethodField()
    targetProfileMediaCount = serializers.SerializerMethodField()
    targetProfileNormalFollowersCount = serializers.SerializerMethodField()
    targetProfileStatusesCount = serializers.SerializerMethodField()

    class Meta:
        model = TargetXProfile
        exclude = ['id', 'profile', 'Keyword','targetProfileXId']
        # fields = ['targetProfileDbId', 'targetProfileScreenName', 'targetProfileFollowersCount']

    def humanize_number(self, value):
        if value is None:
            return None
        if value >= 1_000_000:
            return f'{value // 1_000_000}M'
        elif value >= 1_000:
            return f'{value // 1_000}K'
        return str(value)

    def get_targetProfileFastFollowersCount(self, obj):
        return self.humanize_number(obj.targetProfileFastFollowersCount)

    def get_targetProfileFavouritesCount(self, obj):
        return self.humanize_number(obj.targetProfileFavouritesCount)

    def get_targetProfileFollowersCount(self, obj):
        return self.humanize_number(obj.targetProfileFollowersCount)

    def get_targetProfileFriendsCount(self, obj):
        return self.humanize_number(obj.targetProfileFriendsCount)

    def get_targetProfileMediaCount(self, obj):
        return self.humanize_number(obj.targetProfileMediaCount)

    def get_targetProfileNormalFollowersCount(self, obj):
        return self.humanize_number(obj.targetProfileNormalFollowersCount)

    def get_targetProfileStatusesCount(self, obj):
        return self.humanize_number(obj.targetProfileStatusesCount)




class TargetXProfileAllFiledsTweetSerializer(serializers.ModelSerializer):
    """
    -tweetCreateAt
    -tweetText
    -tweetFavoriteCount
    - retweetCount
    - tweetReplies
    - tweetBookmarkCount
    - tweetOriginalLink
    -tweetSentiment
    """
    tweetDbId = serializers.IntegerField(source='id')
    uniqueIdentifier = serializers.SerializerMethodField()
    targetXProfile = TargetXProfileAllFiledsSerializer()
    platform = serializers.SerializerMethodField()
    tweetReplies = serializers.SerializerMethodField()
    # tweetQuoteCount = serializers.SerializerMethodField()
    tweetFavoriteCount = serializers.SerializerMethodField()
    retweetCount = serializers.SerializerMethodField()
    tweetBookmarkCount = serializers.SerializerMethodField()
    tweetVideoLink = serializers.SerializerMethodField()
    tweetImageLink = serializers.SerializerMethodField()

    class Meta:
        model = TargetXProfileTweet
        exclude = ['id','tweetQuoteCount','tweetKeyword','cleanTweetText','tweetImageData','tweetVideo','tweetImage']
        
    def get_platform(self, obj):
        if obj.targetXProfile.profile:
            return obj.targetXProfile.profile.platform.name
        else:
            return obj.targetXProfile.Keyword.platforms.all().first().name

    def humanize_number(self, value):
        if value is None:
            return None
        if value >= 1_000_000:
            return f'{value // 1_000_000}M'
        elif value >= 1_000:
            return f'{value // 1_000}K'
        # elif value >= 1_000:
        #     return f'{value // 1_000}k'
        # else:

        return str(value)

    def get_tweetReplies(self, obj):
        return self.humanize_number(obj.tweetReplies)

    def get_tweetQuoteCount(self, obj):
        return self.humanize_number(obj.tweetQuoteCount)

    def get_tweetFavoriteCount(self, obj):
        return self.humanize_number(obj.tweetFavoriteCount)

    def get_retweetCount(self, obj):
        return self.humanize_number(obj.retweetCount)

    def get_tweetBookmarkCount(self, obj):
        return self.humanize_number(obj.tweetBookmarkCount)
    
    def get_tweetVideoLink(self, obj):
        if obj.tweetVideo:
            return settings.MEDIA_URL+'twitter/videos/' + obj.tweetVideo
        return None
    
    def get_tweetImageLink(self, obj):
        if obj.tweetImage:
            return settings.MEDIA_URL+'twitter/images/' + obj.tweetImage
        return None
    
    def get_uniqueIdentifier(self, obj):
        if obj.targetXProfile.profile is not None:
            return obj.targetXProfile.profile.platform.name+"-"+ str(obj.id)
        if obj.targetXProfile.Keyword is not None:
            platforms = obj.targetXProfile.Keyword.platforms.all()
            for platform in platforms:
                if platform.name == "x":
                    return platform.name+"-"+ str(obj.id)
