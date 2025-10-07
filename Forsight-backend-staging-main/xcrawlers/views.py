from rest_framework import status
from rest_framework.response import Response
from account.models import UserProfile
from configurator.models import Profile
from xcrawlers.models import TargetXProfile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTaregtProfiles(request):
    current_user_profile = UserProfile.objects.select_related('user').get(user=request.user)
    target_profiles = Profile.objects.filter(user=current_user_profile)
    target_profiles_data = []
    for target_profile in target_profiles:
        target_profiles_data.append({
            'profileUrl': target_profile.profileUrl,
            'platform': target_profile.platform.name
        })
    return Response({'targetProfiles': target_profiles_data}, status=status.HTTP_200_OK)