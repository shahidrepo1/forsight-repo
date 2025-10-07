from pathlib import Path
import os
from datetime import timedelta
from decouple import config
from decouple import config, Csv
from decouple import config, Csv

import redis
from celery import Celery
from celery.schedules import crontab


BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=Csv())

LANGUAGE_CODE = config('LANGUAGE_CODE', default='en-us')
TIME_ZONE = config('TIME_ZONE', default='UTC')
USE_I18N = config('USE_I18N', default=True, cast=bool)
USE_TZ = config('USE_TZ', default=True, cast=bool)

ROOT_URLCONF = 'forsight.urls'
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'account.User'

INSTALLED_APPS = [
    'django_prometheus',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'storages',
    'django_celery_results',
    'account',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'configurator',
    'xcrawlers',
    'youtubecrawlers',
    'visualizations',
    'forsight',
    'reports',
    'playlist',
    'webcrawlers',
]

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # 'account.middleware.JWTAuthenticationMiddleware',  # Custom middleware
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_prometheus.middleware.PrometheusAfterMiddleware',

]



TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'forsight.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),  # Name of your database
        'USER': config('DB_USER'),  # Database username
        'PASSWORD': config('DB_PASSWORD'),  # Database password
        'HOST': config('DB_HOST'),  # Database host, '127.0.0.1' or '192.168.11.60' for local
        'PORT': config('DB_PORT'),       # Default PostgreSQL port
    }
}
# CSRF_TRUSTED_ORIGINS = [
#     'http://192.168.11.60:8000',  
#     'http://192.168.11.60:8000',
# ]



AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]



REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        # 'rest_framework_simplejwt.authentication.JWTAuthentication', # TODO: For now
        'account.authenticate.CustomAuthentication',
    ],

    # "DEFAULT_PERMISSION_CLASSES": [
    #     'rest_framework.permissions.AllowAny',
    # ]
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=200),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,

   'ALGORITHM': 'HS256',
    # 'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),

    'AUTH_COOKIE': 'access_token',  # Cookie name for access token
    'AUTH_COOKIE_REFRESH': 'refresh_token',  # Cookie name for refresh token
     # A string like "example.com", or None for standard domain cookie.
    'AUTH_COOKIE_DOMAIN': "192.168.11.60",
    # Whether the auth cookies should be secure (https:// only).
    'AUTH_COOKIE_SECURE': False, 
    'AUTH_COOKIE_SECURE': False, 
    # Http only cookie flag.It's not fetch by javascript.
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_PATH': '/',        # The path of the auth cookie.
    #Whether to set the flag restricting cookie leaks on cross-site requests. This can be 'Lax', 'Strict', or None to disable the flag.
    'AUTH_COOKIE_SAMESITE': "None", # TODO: Modify to Lax
    

    
}

CSRF_COOKIE_SAMESITE = None
SESSION_COOKIE_SAMESITE = None
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=False, cast=bool)
CORS_ALLOW_CREDENTIALS = True
CSRF_USE_SESSIONS = True
USE_X_FORWARDED_HOST = True
CSRF_COOKIE_SECURE = False
SECURE_CONTENT_TYPE_NOSNIFF = True


CORS_ALLOWED_ORIGINS = ["http://192.168.11.60:3000"]
SESSION_COOKIE_DOMAIN = "192.168.11.60"
CSRF_TRUSTED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=Csv())
CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken"]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'Accept',
    'Accept-Encoding',
    'Authorization',
    'Content-Type',
    'DNT',
    'Access-Control-Allow-Origin',
    'User-Agent',
    'X-CSRFToken',
    'X-Requested-With',
    ''
]



STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
os.makedirs(MEDIA_ROOT, exist_ok=True)

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]


REDIS_HOST = config('REDIS_HOST', default='192.168.11.60')
REDIS_PORT = 6379
REDIS_POOL = redis.ConnectionPool(host=REDIS_HOST, port=REDIS_PORT)


CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://192.168.11.60:6379/0')
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TASK_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Karachi'
TIME_ZONE = 'Asia/Karachi'
USE_TZ = True


CELERY_RESULT_BACKEND = 'django-db'


KAFKA_SERVER = config('KAFKA_SERVER', default='192.168.11.60:9092')
TWITTER_NEW_PROFILE_TOPIC = config('TWITTER_NEW_PROFILE_TOPIC', default='twitter_profile_base_topic')
TWITTER_NEW_KEYWORD_TOPIC = config('TWITTER_NEW_KEYWORD_TOPIC', default='twitter_keyword_base_topic')

RECRAWL_TWITTER_NEW_PROFILE_TOPIC = config('RECRAWL_TWITTER_NEW_PROFILE_TOPIC', default='recrawl_twitter_profile_base_topic')
RECRAWL_TWITTER_NEW_KEYWORD_TOPIC = config('RECRAWL_TWITTER_NEW_KEYWORD_TOPIC', default='recrawl_twitter_keyword_base_topic')


YOUTUBE_NEW_PROFILE_TOPIC = config('YOUTUBE_NEW_PROFILE_TOPIC', default='youtube_profile_base_topic')
YOUTUBE_NEW_KEYWORD_TOPIC = config('YOUTUBE_NEW_KEYWORD_TOPIC', default='youtube_keyword_base_topic')
WEB_NEW_PROFILE_TOPIC = config('WEB_NEW_PROFILE_TOPIC', default='web_profile_base_topic')
WEB_NEW_KEYWORD_TOPIC = config('WEB_NEW_KEYWORD_TOPIC', default='web_keyword_base_topic')


WEB_PROFILES = [
    "https://www.geo.tv/category/pakistan",
    "https://www.dawn.com/pakistan",
    "https://www.arynews.tv/category/pakistan/",
    "https://www.express.pk/pakistan/",
    "https://www.dunyanews.tv/en/Pakistan",
    "https://www.app.com.pk/national/",
    "https://www.bolnews.com/",
    "https://www.jang.com.pk/category/latest-news/national",
    "https://www.thenews.com.pk/latest/category/national",
    "https://www.urdupoint.com/pakistan/",
    "https://www.senate.gov.pk/",
    "https://edition.cnn.com",   
    "https://www.bbc.com",
    'https://www.foxnews.com/',
    "https://trt.global/",
    "https://news.sky.com/",
    "https://www.aljazeera.com/",
    "https://www.nation.com.pk/",          #Working
    "https://www.pakistantoday.com.pk/",    #working

]


DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
AWS_S3_ENDPOINT_URL = config('AWS_S3_ENDPOINT_URL')

# S3/ECS Specific Settings
AWS_S3_USE_SSL = False  # ECS typically works over HTTP
AWS_S3_SIGNATURE_VERSION = "s3v4"  # S3 signature version
AWS_S3_VERIFY = False  # Disable SSL verification if necessary

AWS_DEFAULT_ACL = None  # Prevent files from being public by default

AWS_QUERYSTRING_EXPIRE = 300    

import os
from django.conf import settings

WATERMARK_IMAGE_PATH = os.path.join(settings.MEDIA_ROOT, 'logo', 'watermark1.jpg')
DEMP_IMAGE = os.path.join(settings.MEDIA_ROOT, 'logo', 'header.JPG')

CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["http://192.168.11.60:3000"]
CORS_ALLOW_ALL_ORIGINS = False
