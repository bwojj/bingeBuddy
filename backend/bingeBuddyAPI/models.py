from django.db import models
import uuid
from django.contrib.auth.models import User 
from django.utils import timezone

# Create your models here.
class UserData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data', default=1)
    main_cause = models.CharField(max_length=64)
    motivation = models.TextField(blank=True, default='')
    coaching_style = models.TextField(blank=True, default='')
    motivation_image = models.ImageField(upload_to='motivation_images/', blank=True, null=True)
    panic_audio = models.URLField(blank=True, null=True)
    seen_recovery_intro = models.BooleanField(default=False)
    seen_ai_coach_intro = models.BooleanField(default=False)
    ai_data_consent = models.BooleanField(default=False)
    ai_data_consent_at = models.DateTimeField(null=True, blank=True)
    default_urge_screen = models.CharField(max_length=32, blank=True, default='')
    ai_memory = models.JSONField(default=dict)
    email_verified = models.BooleanField(default=False)
    premium_expires_at = models.DateTimeField(null=True, blank=True, default=None)
    reminder_enabled = models.BooleanField(default=False)
    reminder_time = models.TimeField(null=True, blank=True)
    onboarding_complete = models.BooleanField(default=False)

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
    urge_time = models.DateTimeField(default=timezone.now)
    urge_note = models.TextField(blank=True, default='')

# links OAuth provider accounts to users
class SocialAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_accounts')
    provider = models.CharField(max_length=20)
    provider_id = models.CharField(max_length=255)

    class Meta:
        unique_together = ('provider', 'provider_id')


# one active code per user 
class EmailVerificationCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)


# one active code per user 
class PasswordResetCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='password_reset')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)


class ChatSession(models.Model):
    session_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    session_title = models.CharField(default="")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_session")
    created_at = models.DateTimeField(auto_now_add=True)

# AI Coach memory history
class ChatHistory(models.Model): 
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=[('human', 'Human'), ('ai', 'AI')])
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class UserHabits(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_habits')
    habits = models.JSONField(default=dict) # stores habits in json format of 'habit' and consistent days


class HabitCompletion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habit_completions')
    habit_name = models.CharField(max_length=64)
    date = models.DateField()

    class Meta:
        unique_together = ('user', 'habit_name', 'date')

