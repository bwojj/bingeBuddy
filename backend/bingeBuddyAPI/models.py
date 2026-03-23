from django.db import models
from django.contrib.auth.models import User 

# Create your models here.
class UserData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data', default=1)
    main_cause = models.CharField(max_length=64)
    motivation = models.TextField(blank=True, default='')
    motivation_image = models.ImageField(upload_to='motivation_images/', blank=True, null=True)
    panic_audio = models.FileField(upload_to='panic_audio/', blank=True, null=True)

# create journal Entry field 
class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entries')
    entry_type = models.CharField(max_length=64)
    title = models.CharField(max_length=64)
    entry = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# create model for urge information
class Urges(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='urges')
    urge_time = models.DateTimeField(auto_now_add=True)

# links OAuth provider accounts to users
class SocialAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_accounts')
    provider = models.CharField(max_length=20)   # 'google' or 'apple'
    provider_id = models.CharField(max_length=255)

    class Meta:
        unique_together = ('provider', 'provider_id')
