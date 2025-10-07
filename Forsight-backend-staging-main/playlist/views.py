from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from playlist.models import Playlist
from playlist.serializers import PlaylistSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def playlist(request):
    playlists = Playlist.objects.filter(user=request.user).order_by('-id')
    serializer = PlaylistSerializer(playlists, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_playlist(request):
    profiles = request.data.get('profiles',None)
    keywords = request.data.get('keywords',None)
    name = request.data.get('name',None)

    if name:
        name = name.strip()
    if Playlist.objects.filter(name__iexact=name.strip(), user=request.user).exists():
        return Response({'message': 'Playlist with this name already exists'}, status=status.HTTP_409_CONFLICT)

    if name is None:
        return Response({'message': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    playlist = Playlist.objects.create(name=name, user=request.user)
    if profiles is not None:
        profiles = profiles.split(',')
        playlist.profiles.add(*profiles)
    if keywords is not None:
        keywords = keywords.split(',')
        playlist.keywords.add(*keywords)
    playlist.save()
    serializer = PlaylistSerializer(playlist)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_playlist(request, pk):
    try:
        playlist = Playlist.objects.get(pk=pk)
    except Playlist.DoesNotExist:
        return Response({'message': 'The playlist does not exist'}, status=status.HTTP_404_NOT_FOUND)
    if playlist.user != request.user:
        return Response({'message': 'You are not authorized to delete this playlist'}, status=status.HTTP_401_UNAUTHORIZED)
    playlist.delete()
    return Response({'message': 'Playlist deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_playlist(request, pk):
    try:  
        playlist = Playlist.objects.get(pk=pk)
    except Playlist.DoesNotExist:
        return Response({'message': 'The playlist does not exist'}, status=status.HTTP_404_NOT_FOUND)
    if playlist.user != request.user:
        return Response({'message': 'You are not authorized to update this playlist'}, status=status.HTTP_401_UNAUTHORIZED)
    name = request.data.get('name')
    profiles = request.data.get('profiles')
    keywords = request.data.get('keywords')
    print(f'Keywords {keywords} and Profiles {profiles}')  
    if name is not None:
        if Playlist.objects.filter(name__iexact=name.strip(), user=request.user).exclude(pk=pk).exists():
            return Response({'message': 'A playlist with this name already exists.'}, status=status.HTTP_409_CONFLICT)
        playlist.name = name
    
    if profiles is not None:
        profile_ids = [int(p.strip()) for p in profiles.split(',') if p.strip()]
        playlist.profiles.set(profile_ids)
    else:
        playlist.profiles.clear()

    if keywords is not None:
        keyword_ids = [int(k.strip()) for k in keywords.split(',') if k.strip()]
        playlist.keywords.set(keyword_ids)
    else:
        playlist.keywords.clear()

    playlist.save()
    serializer = PlaylistSerializer(playlist)
    
    return Response(serializer.data, status=status.HTTP_200_OK)
