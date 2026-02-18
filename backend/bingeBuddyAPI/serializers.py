from rest_framework import serializers 
from django.contrib.auth.models import User 
from .models import User_Data

# creater serializer for user model 
class UserSerializer(serializers.Serializer):
    class Meta: 
        model = User 
        fileds = ['username', 'email']

# creates model for the user data serializer 
class UserDataSerializer(serializers.Serializer):
    class Meta: 
        model = User_Data
        fields = '__all__'