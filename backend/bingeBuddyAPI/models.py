from django.db import models
from django.contrib.auth.models import User 

# Create your models here.
class User_Data(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data', default=1)
    main_cause = models.CharField(max_length=64); 
    coaching_style = models.CharField(max_length=64); 
    motivation = models.CharField(max_length=64); 
