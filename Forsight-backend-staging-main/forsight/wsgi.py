"""
WSGI config for forsight project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
print("---------new version 1.0.0---------")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'forsight.settings')

application = get_wsgi_application()
