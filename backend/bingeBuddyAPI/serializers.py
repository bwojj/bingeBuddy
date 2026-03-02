from rest_framework import serializers 
from django.contrib.auth.models import User 
from .models import UserData, JournalEntry

# creater serializer for user model 
class UserSerializer(serializers.ModelSerializer):
    class Meta: 
        model = User 
        fields = ['username', 'email', 'first_name']

# creates model for the user data serializer 
class UserDataSerializer(serializers.ModelSerializer):
    class Meta: 
        model = UserData
        fields = '__all__'

# creates serializer for registration
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User # specifies user model
        fields = ['email', 'password', 'first_name', 'username'] # fields of model to use
    # defines specific create class
    def create(self, validated_data):
        # use email as username since we don't collect a separate username
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
        )
        # sets the users password to inputted password and saves user
        user.set_password(validated_data['password'])
        user.save()
        return user

class JournalEntrySerializer(serializers.ModelSerializer): 
    class Meta: 
        model = JournalEntry 
        fields = '__all__'