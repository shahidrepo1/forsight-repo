import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from account.models import UserProfile  # Adjust the import path as necessary
from django.conf import settings

@pytest.mark.django_db
def test_login_api():
    client = APIClient()

    # Create a test user with the correct userType
    User = get_user_model()
    user = User.objects.create_user(
        email="jaaaaa@gmail.com",
        name="Jayaaa",
        password="12345",
        userType="user"  # Ensure this matches the 'portal' in the test
    )

    # Create the user profile associated with the user
    UserProfile.objects.create(
        user=user,
        # Include additional fields if required by your UserProfile model
    )

    # Login data with matching portal and userType
    login_data = {
        "email": "jaaaaa@gmail.com",
        "password": "12345",
        "portal": "user"
    }

    # Attempt to make a POST request to the login endpoint
    response = client.post('/api/user/login/', data=login_data, format='json')

    # Print debugging information if the response fails
    if response.status_code != 200:
        print("Response status code:", response.status_code)
        print("Response content:", response.content.decode())

    # Check for the expected response status code
    assert response.status_code == 200
    
    # Check that cookies are set correctly
    print("Response headers:", response.headers)
    assert 'Set-Cookie' in response.headers, "Set-Cookie header not found in the response headers"

    # Validate specific cookies if needed
    access_token_cookie = response.cookies.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
    assert access_token_cookie is not None, "Access token cookie not set"
    assert access_token_cookie['httponly'], "Cookie is not HttpOnly"
