import os
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Creates a media folder structure'

    def handle(self, *args, **kwargs):
        # Define the folder structure
        media_folder = os.path.join(settings.BASE_DIR, 'media')
        twitter_folder = os.path.join(media_folder, 'twitter')
        videos_folder = os.path.join(twitter_folder, 'videos')
        images_folder = os.path.join(twitter_folder, 'images')

        # Create the folders if they don't exist
        if not os.path.exists(media_folder):
            os.makedirs(media_folder)
            self.stdout.write(self.style.SUCCESS(f"Created folder: {media_folder}"))

        if not os.path.exists(twitter_folder):
            os.makedirs(twitter_folder)
            self.stdout.write(self.style.SUCCESS(f"Created folder: {twitter_folder}"))

        if not os.path.exists(videos_folder):
            os.makedirs(videos_folder)
            self.stdout.write(self.style.SUCCESS(f"Created folder: {videos_folder}"))

        if not os.path.exists(images_folder):
            os.makedirs(images_folder)
            self.stdout.write(self.style.SUCCESS(f"Created folder: {images_folder}"))

        self.stdout.write(self.style.SUCCESS("All folders created successfully"))
