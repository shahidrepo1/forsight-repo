from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TargetYoutubeProfile, TargetYoutubeProfileVideo

class DeleteLatestVideosPerProfileView(APIView):
    """
    Deletes the 15 latest videos (by videoPublishedAt) from each TargetYoutubeProfile.
    """
    def delete(self, request):
        try:
            profiles = TargetYoutubeProfile.objects.all()
            deleted_videos = []

            for profile in profiles:
                # get IDs of latest 15 videos
                video_ids = list(
                    TargetYoutubeProfileVideo.objects.filter(
                        targetYoutubeProfile=profile
                    )
                    .order_by('-videoPublishedAt')
                    .values_list('id', flat=True)[:15]
                )

                # delete by IDs
                count, _ = TargetYoutubeProfileVideo.objects.filter(id__in=video_ids).delete()

                deleted_videos.append({
                    'profile_id': profile.id,
                    'deleted_count': count,
                    'video_ids': video_ids
                })

            return Response({
                'success': True,
                'message': 'Deleted latest 15 videos from each profile.',
                'details': deleted_videos
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
