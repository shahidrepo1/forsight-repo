from rest_framework import serializers
from django.utils.encoding import smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import get_user_model
from account.models import User, UserProfile
User = get_user_model()

## Old Serializers written by Jawad 
# class UserRegistrationSerializer(serializers.ModelSerializer):
 
#   password2 = serializers.CharField(style={'input_type':'password'}, write_only=True)
#   class Meta:
#     model = User
#     fields=['email', 'name', 'password', 'password2', 'userType']
#     extra_kwargs={
#       'password':{'write_only':True}
#     }


#   def validate_email(self, value):
#         if User.objects.filter(email=value).exists():
#             raise serializers.ValidationError("Email already exists")
#         return value

#   # Validating Password and Confirm Password while Registration
#   def validate(self, attrs):
#     message = 'Password and Confirm Password doesn\'t match'
#     password = attrs.get('password')
#     password2 = attrs.get('password2')
#     if password != password2:
#       raise serializers.ValidationError(message)
#     return attrs

#   def create(self, validate_data):
#     return User.objects.create_user(**validate_data)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type':'password'}, write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'password2', 'userType']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.ModelSerializer):
  email = serializers.EmailField(max_length=255)
  class Meta:
    model = User
    fields = ['email', 'password']

  
class UserProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['id', 'email', 'name']


class UserChangePasswordSerializer(serializers.Serializer):
  password = serializers.CharField(max_length=255, style={'input_type':'password'}, write_only=True)
  password2 = serializers.CharField(max_length=255, style={'input_type':'password'}, write_only=True)
  class Meta:
    fields = ['password', 'password2']

  def validate(self, attrs):
    password = attrs.get('password')
    password2 = attrs.get('password2')
    user = self.context.get('user')
    if password != password2:
      raise serializers.ValidationError("Password and Confirm Password doesn't match")
    user.set_password(password)
    user.save()
    return attrs


class SendPasswordResetEmailSerializer(serializers.Serializer):
  email = serializers.EmailField(max_length=255)
  class Meta:
    fields = ['email']

  def validate(self, attrs):
    email = attrs.get('email')
    if User.objects.filter(email=email).exists():
      user = User.objects.get(email = email)
      uid = urlsafe_base64_encode(force_bytes(user.id))
      print('Encoded UID', uid)
      token = PasswordResetTokenGenerator().make_token(user)
      print('Password Reset Token', token)
      link = 'http://192.168.11.60:3000/api/user/reset/'+uid+'/'+token
      print('Password Reset Link', link)
      return attrs
    else:
      raise serializers.ValidationError('You are not a Registered User')


class UserPasswordResetSerializer(serializers.Serializer):
  password = serializers.CharField(max_length=255, style={'input_type':'password'}, write_only=True)
  password2 = serializers.CharField(max_length=255, style={'input_type':'password'}, write_only=True)
  class Meta:
    fields = ['password', 'password2']

  def validate(self, attrs):
    try:
      password = attrs.get('password')
      password2 = attrs.get('password2')
      uid = self.context.get('uid')
      token = self.context.get('token')
      if password != password2:
        raise serializers.ValidationError("Password and Confirm Password doesn't match")
      user_id = smart_str(urlsafe_base64_decode(uid))
      user = User.objects.get(id=user_id)
      if not PasswordResetTokenGenerator().check_token(user, token):
        raise serializers.ValidationError('Token is not Valid or Expired')
      user.set_password(password)
      user.save()
      return attrs
    except DjangoUnicodeDecodeError:
      
      PasswordResetTokenGenerator().check_token(user, token)
      raise serializers.ValidationError('Token is not Valid or Expired')



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'userType']  # adjust fields to match your model

        
class UserProfileSerializer(serializers.ModelSerializer):
  uuid = serializers.IntegerField(source='user.id')
  profileId = serializers.IntegerField(source='id')
  userName = serializers.CharField(source='user.name')
  userEmail = serializers.CharField(source='user.email')
  userType = serializers.CharField(source='user.userType')
  accessToken = serializers.SerializerMethodField()
  refreshToken = serializers.SerializerMethodField()
  class Meta:
    model = UserProfile 
    exclude = ['id','user']

  def get_accessToken(self, obj):
    if self.context.get('token').get('accessToken'):
      return self.context.get('token').get('accessToken')
    else:
      return None
    
  def get_refreshToken(self, obj):
    if self.context.get('token').get('refreshToken'):
      return self.context.get('token').get('refreshToken')
    else:
      return None
  