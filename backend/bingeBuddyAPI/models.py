from django.db import models
from django.contrib.auth.models import User 

# Create your models here.
class UserData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data', default=1)
    main_cause = models.CharField(max_length=64)
    coaching_style = models.CharField(max_length=64)
    motivation = models.JSONField(default=list)
    motivation_image = models.ImageField(upload_to='motivation_images/', blank=True, null=True)

# create journal Entry field 
class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entries')
    entry_type = models.CharField(max_length=64)
    title = models.CharField(max_length=64)
    entry = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
