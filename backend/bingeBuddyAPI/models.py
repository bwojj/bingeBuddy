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
    # defaults to False for every row, including existing users' already-migrated
    # rows -- that's what forces current users through the recovery intro too.
    seen_recovery_intro = models.BooleanField(default=False)
    # same pattern as seen_recovery_intro -- defaults to False so it gates the
    # one-time AI Coach intro screen the first time a user taps the Coach tab.
    seen_ai_coach_intro = models.BooleanField(default=False)
    # one of: 'mental_frameworks', 'actions', 'coach', 'audio' (validated client-side)
    default_urge_screen = models.CharField(max_length=32, blank=True, default='')
    ai_memory = models.JSONField(default=dict)
    # False for plain email/password signups until they enter their emailed
    # code; social_auth sets this True immediately since Google/Apple already
    # vouch for the email.
    email_verified = models.BooleanField(default=False)
    # RevenueCat's webhook events (INITIAL_PURCHASE/RENEWAL/CANCELLATION/
    # EXPIRATION/...) all report the subscriber's current expiration
    # timestamp -- always overwriting this with the latest one makes
    # cancel-until-period-end, renewal, and true expiry all fall out of a
    # single `premium_expires_at > now()` check, no event-type branching.
    premium_expires_at = models.DateTimeField(null=True, blank=True, default=None)
    # daily local-notification reminder, fired on-device at this time in the
    # user's local timezone -- see set_reminder_preferences
    reminder_enabled = models.BooleanField(default=False)
    reminder_time = models.TimeField(null=True, blank=True)

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
    provider = models.CharField(max_length=20)   # 'google' or 'apple'
    provider_id = models.CharField(max_length=255)

    class Meta:
        unique_together = ('provider', 'provider_id')


# one active code per user -- (re)generated on register/resend, deleted on
# successful verification
class EmailVerificationCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification')
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

# records that a given habit was completed on a given (local-calendar) day --
# existence of a row means done, absence means not done. Powers the "View All
# Days" history; doneToday/streak/weekCompletion remain purely client-side.
class HabitCompletion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habit_completions')
    habit_name = models.CharField(max_length=64)
    date = models.DateField()

    class Meta:
        unique_together = ('user', 'habit_name', 'date')

