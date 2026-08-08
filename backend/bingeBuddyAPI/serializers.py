from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import UserData, JournalEntry, Urges, UserHabits, ChatSession, ChatHistory

# creater serializer for user model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name']

# creates model for the user data serializer
class UserDataSerializer(serializers.ModelSerializer):
    motivation_image = serializers.SerializerMethodField()
    is_premium = serializers.SerializerMethodField()

    class Meta:
        model = UserData
        fields = '__all__'

    def get_is_premium(self, obj):
        return obj.premium_expires_at is not None and obj.premium_expires_at > timezone.now()

    def get_motivation_image(self, obj):
        if not obj.motivation_image:
            return None
        try:
            url = obj.motivation_image.url
        except Exception:
            # Storage backend can't resolve this file (e.g. missing/invalid
            # Cloudinary credentials in this environment, or a stale local
            # path from before Cloudinary was wired up) -- a broken image
            # reference shouldn't take down the entire user-data response,
            # since everything else on this row (notably seen_recovery_intro)
            # still needs to reach the client.
            return None
        # Cloudinary returns absolute URLs; local paths need the request base
        if url.startswith('http'):
            return url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(url)
        return url

# creates serializer for registration
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User # specifies user model
        fields = ['email', 'password', 'first_name', 'username'] # fields of model to use

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

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

class UrgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Urges 
        fields = '__all__'

class UserHabitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserHabits
        fields = '__all__'

class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ['sender', 'text', 'timestamp']

class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ['session_id', 'session_title', 'created_at']