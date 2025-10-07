from django.urls import path
from account.views import (AllUsersView, SendPasswordResetEmailView, 
                           UserChangePasswordView, 
                           UserLoginView, 
                           UserProfileView, 
                           UserRegistrationView, 
                           getAllUsers,
                           UserPasswordResetView,
                           logoutView,
                           refreshToken,
                           checkValidSession,
                           DeleteAccountView
                        )

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('refresh/', refreshToken, name='refreshToken'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('delete/<int:id>/', DeleteAccountView.as_view(), name='delete-account'),
    path('logout/', logoutView, name='logout'),
    path('users/',getAllUsers, name='users'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('all-users/', AllUsersView.as_view(), name='all-users'),
    path('changepassword/', UserChangePasswordView.as_view(), name='changepassword'),
    path('send-reset-password-email/', SendPasswordResetEmailView.as_view(), name='send-reset-password-email'),
    path('reset-password/', UserPasswordResetView, name='reset-password'),
    path('checkValidSession/', checkValidSession, name='test'),
]