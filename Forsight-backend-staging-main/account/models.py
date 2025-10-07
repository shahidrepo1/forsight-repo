from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser


class UserManager(BaseUserManager):
  def create_user(self, email, name, userType, password=None, password2=None):
      """
      Creates and saves a User with the given email, name, userType and password.
      """
      if not email:
          raise ValueError('User must have an email address')

      user = self.model(
          email=self.normalize_email(email),
          name=name,
          userType=userType,
      )

      user.set_password(password)
      user.save(using=self._db)
      return user

  def create_superuser(self, email, name, userType, password=None):
      """
      Creates and saves a superuser with the given email, name, userType and password.
      """
      user = self.create_user(
          email,
          password=password,
          name=name,
          userType=userType,
      )
      user.is_admin = True
      user.save(using=self._db)
      return user


class User(AbstractBaseUser):
  userChoices = (
     ('superAdmin', 'superAdmin'),
    ('admin', 'admin'),
    ('teamLead', 'teamLead'),
    ('user', 'user'),
  )
  email = models.EmailField(
      verbose_name='Email',
      max_length=255,
      unique=True,
  )
  
  name = models.CharField(max_length=200)
  userType = models.CharField(max_length=20,choices=userChoices)
  is_active = models.BooleanField(default=True)
  is_admin = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  objects = UserManager()

  USERNAME_FIELD = 'email'
  REQUIRED_FIELDS = ['name', 'userType']

  def __str__(self):
      return self.email

  def has_perm(self, perm, obj=None):
      "Does the user have a specific permission?"
      # Simplest possible answer: Yes, always
      return self.is_admin

  def has_module_perms(self, app_label):
      "Does the user have permissions to view the app `app_label`?"
      # Simplest possible answer: Yes, always
      return True

  @property
  def is_staff(self):
      "Is the user a member of staff?"
      # Simplest possible answer: All admins are staff
      return self.is_admin


class UserProfile(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  profilePic = models.ImageField(upload_to='profilePic', blank=True, null=True)
  def __str__(self):
    return self.user.name
  


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
