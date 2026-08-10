import logging
import json
import hmac
import threading
import time
from django.http import StreamingHttpResponse
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.conf import settings as django_settings
from datetime import timedelta, datetime, timezone as dt_timezone
from zoneinfo import ZoneInfo
import cloudinary.uploader
from django.db import transaction
import base64
import jwt as pyjwt
import requests as http_requests
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers
from cryptography.hazmat.backends import default_backend
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes, action, renderer_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.renderers import BaseRenderer, JSONRenderer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
import os
from dotenv import load_dotenv
from .models import UserData, JournalEntry, Urges, SocialAccount, ChatHistory, ChatSession, UserHabits, HabitCompletion, EmailVerificationCode, PasswordResetCode
from .serializers import UserDataSerializer, UserSerializer, UserRegistrationSerializer, JournalEntrySerializer, UrgeSerializer, UserHabitsSerializer, ChatSessionSerializer, ChatHistorySerializer
from .chatbot_utilities import chain, retriever, session_chain
from .verification import (create_verification_code, send_verification_email, MAX_ATTEMPTS, RESEND_COOLDOWN_SECONDS,
                            create_password_reset_code, send_password_reset_email)
from .permissions import HasActiveSubscription
from .throttling import AICoachBurstRateThrottle, AICoachSustainedRateThrottle

load_dotenv()

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs): 
        try: 
            # submits post request with the given data
            response = super().post(request, *args, **kwargs)

            # gets the access and refresh tokens from request
            tokens = response.data 

            # saves the access and refresh token from json returned
            access_token = tokens['access']
            refresh_token = tokens['refresh']

            # inits response 
            res = Response()

            # sets the response to succeeding, gives both tokens
            res.data = {
                'success': True, 
                'access': access_token, 
                'refresh': refresh_token, 
            }

            _30_DAYS = 60 * 60 * 24 * 30
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite="None",
                path='/',
                max_age=_30_DAYS,
            )
            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite="None",
                path='/',
                max_age=60 * 60 * 24 * 365,
            )
            return res
        # if post fails
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=400)

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs): 
        try:
            # gets the refresh token cookie
            refresh_token = request.COOKIES.get('refresh_token')

            # makes sure refresh token exists
            if not refresh_token:
                return Response({'refreshed': False, 'error': 'No refresh token'})

            # gets the refresh token, and sets it to the cookie
            request.data['refresh'] = refresh_token 

            # calls post method 
            response = super().post(request, *args, **kwargs)

            #gets tokens 
            tokens = response.data 
            access_token = tokens['access']

            # inits response 
            res = Response()

            # sets the response to signify successful refresh 
            res.data = {
                'refreshed': True, 
                'access': access_token
            }

            # sets new refreshed cookie
            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="None",
                path="/",
                max_age=60 * 60 * 24 * 30,
            )

            return res
        except: 
            return Response({'refreshed': False})

@api_view(['POST']) # post request only
@permission_classes([IsAuthenticated]) # if authenticated, true, else fail
def is_authenticated(request):
    return Response({'authenticated': True})

# creates view for user data 
class UserDataView(viewsets.ModelViewSet):
    serializer_class = UserDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user
        return UserData.objects.filter(user=user_profile)

# creates view for user credentials
class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user
        return User.objects.filter(pk=user_profile.pk)

# creates view for journal entries 
class JournalEntryView(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user 
        return JournalEntry.objects.filter(user=user_profile)

# view for urges
class UrgesView(viewsets.ModelViewSet):
    serializer_class = UrgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user
        return Urges.objects.filter(user=user_profile).order_by('-urge_time')

    def list(self, request, *args, **kwargs):
        count = self.get_queryset().count()
        return Response({'count': count})

    @action(detail=False, methods=['get'])
    def all(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

# every user gets these by default, scheduled every day, the first time
# their habits are ever loaded — from then on GET /api/habits/ is the
# single source of truth (defaults included) for what habits they track.
ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
# `order` drives display order on My Recovery. It has to live as a per-habit
# value inside this JSON blob rather than relying on dict/JSON key ordering --
# Postgres's jsonb type does not guarantee object key order is preserved.
DEFAULT_HABITS = {
    'Meditation': {'Days': list(ALL_DAYS), 'order': 0},
    'Exercise': {'Days': list(ALL_DAYS), 'order': 1},
    'Journaling': {'Days': list(ALL_DAYS), 'order': 2},
}

def get_or_seed_user_habits(user):
    habits_model, created = UserHabits.objects.get_or_create(user=user)
    if created:
        habits_model.habits = dict(DEFAULT_HABITS)
        habits_model.save()
    return habits_model

class UserHabitsView(viewsets.ModelViewSet):
    serializer_class = UserHabitsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        get_or_seed_user_habits(self.request.user)
        return UserHabits.objects.filter(user=self.request.user)

# view for adding an urge 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_urge(request):
    user_note = request.data.get("note") or ''
    time = request.data.get("time") or timezone.now()

    Urges.objects.create(
        user=request.user,
        urge_note=user_note,
        urge_time=time,
    )

    return Response({'success': True})

# view for deleting an urge
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_urge(request):
    urge_id = request.data.get("id")
    if not urge_id:
        return Response({'error': 'id required'}, status=400)

    deleted, _ = Urges.objects.filter(user=request.user, id=urge_id).delete()
    if not deleted:
        return Response({'error': 'urge not found'}, status=404)

    return Response({'success': True})

# defines view for registering
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # gets serializers
    serializer = UserRegistrationSerializer(data=request.data)
    # if it is valid, saves it else returns an error
    if serializer.is_valid():
        user = serializer.save()
        # never let a verification-email hiccup fail registration itself --
        # the user can always request a resend from inside the app
        try:
            code_obj = create_verification_code(user)
            send_verification_email(user, code_obj.code)
        except Exception:
            logger.exception("Failed to create/send verification code for %s", user.email)
        return Response({'success': True})
    return Response(serializer.errors, status=400)


# authenticated user enters the code emailed on signup
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_email(request):
    code_input = str(request.data.get('code', '')).strip()
    if not code_input:
        return Response({'success': False, 'error': 'Code is required'}, status=400)

    user_data, _ = UserData.objects.get_or_create(user=request.user)
    if user_data.email_verified:
        return Response({'success': True, 'already_verified': True})

    record = EmailVerificationCode.objects.filter(user=request.user).first()
    if not record:
        return Response({'success': False, 'error': 'No verification code found. Please request a new one.'}, status=400)
    if timezone.now() > record.expires_at:
        return Response({'success': False, 'error': 'Code expired. Please request a new one.'}, status=400)
    if record.attempts >= MAX_ATTEMPTS:
        return Response({'success': False, 'error': 'Too many attempts. Please request a new code.'}, status=429)
    if code_input != record.code:
        record.attempts += 1
        record.save(update_fields=['attempts'])
        return Response({'success': False, 'error': 'Incorrect code'}, status=400)

    user_data.email_verified = True
    user_data.save(update_fields=['email_verified'])
    record.delete()
    return Response({'success': True})


# authenticated user requests a fresh code (e.g. the first one expired or never arrived)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification(request):
    user_data, _ = UserData.objects.get_or_create(user=request.user)
    if user_data.email_verified:
        return Response({'success': True, 'already_verified': True})

    existing = EmailVerificationCode.objects.filter(user=request.user).first()
    if existing:
        elapsed = (timezone.now() - existing.created_at).total_seconds()
        if elapsed < RESEND_COOLDOWN_SECONDS:
            return Response({
                'success': False,
                'error': 'Please wait before requesting another code.',
                'retry_after_seconds': int(RESEND_COOLDOWN_SECONDS - elapsed),
            }, status=429)

    code_obj = create_verification_code(request.user)
    sent = send_verification_email(request.user, code_obj.code)
    return Response({'success': True, 'email_sent': sent})


# unauthenticated user (can't log in, so no JWT yet) requests a code to reset
# their password. Always responds success regardless of whether the email is
# registered -- distinguishing the two would let this endpoint enumerate
# registered accounts.
@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = str(request.data.get('email', '')).strip()
    if not email:
        return Response({'success': False, 'error': 'Email is required'}, status=400)

    user = User.objects.filter(email__iexact=email).first()
    if user:
        existing = PasswordResetCode.objects.filter(user=user).first()
        already_sent_recently = existing and (timezone.now() - existing.created_at).total_seconds() < RESEND_COOLDOWN_SECONDS
        if not already_sent_recently:
            try:
                code_obj = create_password_reset_code(user)
                send_password_reset_email(user, code_obj.code)
            except Exception:
                logger.exception("Failed to create/send password reset code for %s", email)
    return Response({'success': True})


# unauthenticated user submits the emailed code alongside a new password
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = str(request.data.get('email', '')).strip()
    code_input = str(request.data.get('code', '')).strip()
    new_password = request.data.get('new_password', '')
    if not email or not code_input or not new_password:
        return Response({'success': False, 'error': 'Email, code, and new password are required'}, status=400)

    user = User.objects.filter(email__iexact=email).first()
    # Same code/user combination either doesn't exist or is wrong -- collapse
    # both into one message so this can't be used to confirm an email exists.
    if not user:
        return Response({'success': False, 'error': 'Invalid or expired code'}, status=400)

    record = PasswordResetCode.objects.filter(user=user).first()
    if not record or timezone.now() > record.expires_at:
        return Response({'success': False, 'error': 'Invalid or expired code'}, status=400)
    if record.attempts >= MAX_ATTEMPTS:
        return Response({'success': False, 'error': 'Too many attempts. Please request a new code.'}, status=429)
    if code_input != record.code:
        record.attempts += 1
        record.save(update_fields=['attempts'])
        return Response({'success': False, 'error': 'Incorrect code'}, status=400)

    try:
        validate_password(new_password, user=user)
    except DjangoValidationError as e:
        return Response({'success': False, 'error': ' '.join(e.messages)}, status=400)

    user.set_password(new_password)
    user.save()
    record.delete()
    return Response({'success': True})


#defines logout function
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        # deletes cookies to log out 
        res = Response()
        res.data = {'Success': True}
        res.delete_cookie('access_token', path="/", samesite='None')
        res.delete_cookie('refresh_token', path="/", samesite='None')

        return res
    except:
        return Response({"Success": False})

# defines function to add to main cause to user data
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_data_main_cause(request): 
    data_obj, _ = UserData.objects.update_or_create(
        user=request.user, 
        defaults={
            "main_cause": request.data.get('main_cause'),
        }
    )

    return Response({"Success": True})

# defines function to add to main cause to user data
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_data_coaching_style(request):
    data_obj, _ = UserData.objects.update_or_create(
        user=request.user,
        defaults={
            "coaching_style": request.data.get('coaching_style'),
        }
    )

    return Response({"Success": True})

# defines function to set the user's default urge-support screen
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_default_urge_screen(request):
    data_obj, _ = UserData.objects.update_or_create(
        user=request.user,
        defaults={
            "default_urge_screen": request.data.get('default_urge_screen'),
        }
    )

    return Response({"Success": True})

# defines function to set the user's daily habit-reminder preferences --
# reminder_time is scheduled/fired entirely on-device (see frontend/lib/notifications.js),
# this just persists the choice so it can be restored after reinstall/new-device login
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_reminder_preferences(request):
    data_obj, _ = UserData.objects.update_or_create(
        user=request.user,
        defaults={
            "reminder_enabled": request.data.get('reminder_enabled'),
            "reminder_time": request.data.get('reminder_time'),
        }
    )

    return Response({"Success": True})

# marks that a user has completed the My Recovery intro walkthrough -- used both
# right after onboarding (new users) and retroactively (existing users, whose
# rows default to False) to gate access to the main app until it's been seen
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_recovery_intro_seen(request):
    UserData.objects.update_or_create(
        user=request.user,
        defaults={
            "seen_recovery_intro": True,
        }
    )

    return Response({"success": True})

# marks that a user has seen the one-time AI Coach intro screen, shown the
# first time they tap the Coach tab -- mirrors mark_recovery_intro_seen.
# Also records explicit consent to sending chat data to Google's Gemini API
# (see ai-coach-intro.jsx's consent checkbox) -- only set when the client
# actually reports the checkbox was checked, so older app builds that don't
# send it yet simply leave consent unrecorded rather than defaulting to True.
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_ai_coach_intro_seen(request):
    defaults = {"seen_ai_coach_intro": True}
    if request.data.get('ai_data_consent'):
        defaults["ai_data_consent"] = True
        defaults["ai_data_consent_at"] = timezone.now()

    UserData.objects.update_or_create(
        user=request.user,
        defaults=defaults,
    )

    return Response({"success": True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_data_motivation(request):
    # Last step of the post-signup onboarding flow -- flips onboarding_complete
    # so a refresh from here on lands in the main app instead of being sent
    # back into onboarding (see _layout.jsx's redirect gate).
    data_obj, _ = UserData.objects.update_or_create(
        user=request.user,
        defaults={
            "motivation": request.data.get('motivation'),
            "onboarding_complete": True,
        }
    )

    return Response({"Success": True})

# defines view to add to image
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_motivation_image(request):
    image = request.FILES.get('motivation_image')
    user_object, _ = UserData.objects.update_or_create(
        user=request.user,
        defaults={
            "motivation_image": image,
        }
    )
    return Response({"success": True})

# returns urge counts for each day of the current week (Mon-Sun)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def urges_by_day(request):
    tz_name = request.query_params.get('tz', 'UTC')
    try:
        user_tz = ZoneInfo(tz_name)
    except Exception:
        user_tz = ZoneInfo('UTC')

    now_local = timezone.now().astimezone(user_tz)
    today = now_local.date()
    start_of_week = today - timedelta(days=today.weekday())  # Monday

    start_dt = datetime(start_of_week.year, start_of_week.month, start_of_week.day, tzinfo=user_tz)
    end_dt = start_dt + timedelta(days=7)

    urge_qs = (
        Urges.objects
        .filter(user=request.user, urge_time__gte=start_dt, urge_time__lt=end_dt)
        .annotate(date=TruncDate('urge_time', tzinfo=user_tz))
        .values('date')
        .annotate(count=Count('id'))
    )
    count_map = {entry['date']: entry['count'] for entry in urge_qs}

    day_labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    days = [
        {'day': day_labels[i], 'count': count_map.get(start_of_week + timedelta(days=i), 0)}
        for i in range(7)
    ]
    return Response({'days': days})

# update user profile fields
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    if 'first_name' in request.data:
        user.first_name = request.data['first_name']

    email_changed = False
    if 'email' in request.data:
        new_email = request.data['email']
        if new_email != user.email:
            if User.objects.filter(email__iexact=new_email).exclude(pk=user.pk).exists():
                return Response({'success': False, 'error': 'This email is already registered.'}, status=400)
            user.email = new_email
            email_changed = True

    if request.data.get('new_password'):
        if not user.check_password(request.data.get('current_password', '')):
            return Response({'success': False, 'error': 'Current password is incorrect'}, status=400)
        user.set_password(request.data['new_password'])
    user.save()

    if email_changed:
        # A changed address hasn't been proven yet -- drop verified status and
        # send a fresh code, whether this came from onboarding or Settings.
        UserData.objects.update_or_create(user=user, defaults={'email_verified': False})
        try:
            code_obj = create_verification_code(user)
            send_verification_email(user, code_obj.code)
        except Exception:
            logger.exception("Failed to create/send verification code for %s", user.email)

    return Response({'success': True})

# defines view for adding to journal entries
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_journal_entry(request):
    JournalEntry.objects.create(
        user=request.user,
        entry_type=request.data['entry_type'],
        title=request.data['title'],
        entry=request.data['entry'],
    )

    return Response({'success': True})

# defines view to delete entries
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_entry(request):
    JournalEntry.objects.filter(id=request.data['id']).delete()
    return Response({'success': True})


def _b64url_to_int(b64str):
    """Decode base64url-encoded integer (used for Apple JWKS RSA key components)."""
    padding = 4 - len(b64str) % 4
    return int.from_bytes(base64.urlsafe_b64decode(b64str + '=' * (padding % 4)), 'big')


@api_view(['POST'])
@permission_classes([AllowAny])
def social_auth(request):
    """
    Verify a Google or Apple OAuth token, then issue a JWT session.
    Body: { provider: 'google'|'apple', token: '<access or identity token>' }
    Returns: { success, access, is_new }
    """
    provider = request.data.get('provider')
    token = request.data.get('token')

    if not provider or not token:
        return Response({'success': False, 'error': 'provider and token are required'}, status=400)

    try:
        if provider == 'google':
            # Verify by calling Google's userinfo endpoint with the access token
            resp = http_requests.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {token}'},
                timeout=10,
            )
            if resp.status_code != 200:
                return Response({'success': False, 'error': 'Invalid Google token'}, status=400)
            info = resp.json()
            email = info.get('email', '')
            provider_id = info.get('id', '')

        elif provider == 'apple':
            # Verify Apple identity token (JWT) using Apple's public JWKS
            apple_resp = http_requests.get('https://appleid.apple.com/auth/keys', timeout=10)
            apple_keys = apple_resp.json()['keys']

            header = pyjwt.get_unverified_header(token)
            key_data = next((k for k in apple_keys if k['kid'] == header['kid']), None)
            if not key_data:
                return Response({'success': False, 'error': 'Apple signing key not found'}, status=400)

            public_key = RSAPublicNumbers(
                _b64url_to_int(key_data['e']),
                _b64url_to_int(key_data['n']),
            ).public_key(default_backend())

            payload = pyjwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience=django_settings.APPLE_BUNDLE_ID,
            )
            email = payload.get('email', '')
            provider_id = payload['sub']

        else:
            return Response({'success': False, 'error': 'Unknown provider'}, status=400)

    except Exception as e:
        return Response({'success': False, 'error': f'Token verification failed: {str(e)}'}, status=400)

    # Find or create user
    is_new = False
    social_account = SocialAccount.objects.filter(provider=provider, provider_id=provider_id).first()

    if social_account:
        user = social_account.user
    else:
        # Try to find existing user by email first
        user = User.objects.filter(email=email).first() if email else None

        if not user:
            # Create a new user
            base_username = email.split('@')[0] if email else f'{provider}_{provider_id[:8]}'
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f'{base_username}{counter}'
                counter += 1
            # Name is deliberately not pulled from the provider profile --
            # the frontend prompts the user for it right after signup
            # (onboarding's name step) and saves it via update-profile.
            user = User.objects.create_user(
                username=username,
                email=email,
                password=None,
            )
            is_new = True

        SocialAccount.objects.create(provider=provider, provider_id=provider_id, user=user)

    # Google/Apple already vouch for the email -- skip our own verification gate
    UserData.objects.update_or_create(user=user, defaults={'email_verified': True})

    # Issue JWT tokens (same cookie pattern as regular login)
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    res = Response()
    res.data = {'success': True, 'access': access_token, 'is_new': is_new}

    _30_DAYS = 60 * 60 * 24 * 30
    res.set_cookie(key='access_token', value=access_token, httponly=True, secure=True,
                   samesite="None", path='/', max_age=_30_DAYS)
    res.set_cookie(key='refresh_token', value=refresh_token, httponly=True, secure=True,
                   samesite="None", path='/', max_age=60 * 60 * 24 * 365)
    return res


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_panic_audio(request):
    audio = request.FILES.get('panic_audio')
    if not audio:
        return Response({'success': False, 'error': 'No audio file provided'}, status=400)
    try:
        result = cloudinary.uploader.upload(audio, resource_type='video', folder='panic_audio')
        url = result.get('secure_url')
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)
    UserData.objects.update_or_create(
        user=request.user,
        defaults={'panic_audio': url},
    )
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_panic_audio(request):
    user_data = UserData.objects.filter(user=request.user).first()
    if not user_data or not user_data.panic_audio:
        return Response({'url': None})
    return Response({'url': user_data.panic_audio})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_panic_audio(request):
    UserData.objects.filter(user=request.user).update(panic_audio=None)
    return Response({'success': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    res = Response({'success': True})
    res.delete_cookie('access_token', path='/', samesite='None')
    res.delete_cookie('refresh_token', path='/', samesite='None')
    user.delete()
    return res

class EventStreamRenderer(BaseRenderer):
    media_type = 'text/event-stream'
    format = 'txt'
    charset = None

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if isinstance(data, (bytes, str)):
            return data
        return f"data: {json.dumps(data)}\n\n"


def _apply_ai_session_title(session_id, message):
    # Runs off-thread so the AI-generated title (a full extra LLM round-trip)
    # never sits on the critical path of the user's first message -- the
    # session already has the cheap placeholder title from ai_coach() by the
    # time this resolves.
    from django.db import connections
    try:
        title = session_chain.invoke({"message": message}).text
        ChatSession.objects.filter(session_id=session_id).update(session_title=title)
    except Exception:
        logger.exception("Failed to generate AI title for session %s", session_id)
    finally:
        connections.close_all()


@api_view(['POST'])
@renderer_classes([EventStreamRenderer, JSONRenderer])
@permission_classes([IsAuthenticated, HasActiveSubscription])
@throttle_classes([AICoachBurstRateThrottle, AICoachSustainedRateThrottle])
def ai_coach(request):
    session_id_str = request.data.get('session-id')
    message = request.data.get("message")
    user_data = UserData.objects.filter(user=request.user).first()
    coaching_style = user_data.coaching_style if user_data else ""
    user_memory = user_data.ai_memory if user_data else {}


    if not message or not message.strip():
        return Response({'error': 'no message provided'}, status=400)

    if retriever is None:
        return Response({'error': 'AI coach is temporarily unavailable'}, status=503)

    if session_id_str:
        session = ChatSession.objects.filter(session_id=session_id_str, user=request.user).first()
        if session is None:
            return Response({'error': 'session not found'}, status=404)
    else:
        # Cheap placeholder so the first message isn't blocked on a second
        # full LLM round-trip before streaming can even start -- the real
        # AI-generated title fills in a moment later, off-thread.
        session = ChatSession.objects.create(user=request.user, session_title=message.strip()[:40])
        threading.Thread(target=_apply_ai_session_title, args=(session.session_id, message), daemon=True).start()

    db_messages = list(session.messages.order_by('-timestamp')[:20])[::-1]
    chat_history = [(msg.sender, msg.text) for msg in db_messages]


    # get relevant chunks for question
    retrieval_start = time.monotonic()
    chunks = retriever.invoke(message)
    logger.info("ai_coach retrieval took %.2fs for session %s", time.monotonic() - retrieval_start, session.session_id)

    # forms the chunks into single page string
    context = "\n\n".join([doc.page_content for doc in chunks])

    def event_stream():
        pieces = []
        stream_start = time.monotonic()
        first_token_logged = False
        try:
            for chunk in chain.stream({
                "message": message,
                "history": chat_history,
                "context": context,
                "coaching_style": coaching_style,
                "user_memory": user_memory,
            }):
                token = chunk.text if hasattr(chunk, "text") else str(chunk)
                if token:
                    if not first_token_logged:
                        logger.info("ai_coach time-to-first-token: %.2fs for session %s", time.monotonic() - stream_start, session.session_id)
                        first_token_logged = True
                    pieces.append(token)
                    yield f"data: {json.dumps({'token': token})}\n\n"

            final_text = "".join(pieces)

            with transaction.atomic():
                ChatHistory.objects.create(session=session, sender='human', text=message)
                ChatHistory.objects.create(session=session, sender="ai", text=final_text)
            
            yield f"data: {json.dumps({'done': True, 'session-id': str(session.session_id)})}\n\n"

        except Exception:
            logger.exception("ai_coach streaming failed for session %s",
                             getattr(session, 'session_id', 'UNCREATED'))
            yield f"data: {json.dumps({'error': 'Try again later'})}\n\n"

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_memory(request):
    user_goals = request.data.get('memory')
    user_causes = request.data.get('causes')
    user_text = request.data.get('text')

    if not user_goals or not user_goals.strip():
        return Response({'error': 'goals are required'}, status=400)
    if not user_causes or not user_causes.strip():
        return Response({'error': 'causes are required'}, status=400)
    if not user_text or not user_text.strip():
        return Response({'error': 'user additional text is required'}, status=400)
    
    user_obj = UserData.objects.filter(user=request.user).first()
    if user_obj is None:
        return Response({'error': 'user profile not found'}, status=404)

    user_memory = dict(user_obj.ai_memory)
    user_memory['Goals'] = user_goals
    user_memory['Causes'] = user_causes
    user_memory['Additional'] = user_text
    user_obj.ai_memory = user_memory
    user_obj.save()

    return Response({'success': 'added user memory'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_sessions(request):
    sessions = ChatSession.objects.filter(user=request.user).order_by('-created_at')
    return Response(ChatSessionSerializer(sessions, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_session_messages(request, session_id):
    session = ChatSession.objects.filter(session_id=session_id, user=request.user).first()
    if session is None:
        return Response({'error': 'session not found'}, status=404)
    return Response(ChatHistorySerializer(session.messages.order_by('timestamp'), many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_subscription(request):
    app_user_id = str(request.user.id)
    try:
        resp = http_requests.get(
            f'https://api.revenuecat.com/v1/subscribers/{app_user_id}',
            headers={'Authorization': f'Bearer {django_settings.REVENUECAT_SECRET_API_KEY}'},
            timeout=10,
        )
        resp.raise_for_status()
    except http_requests.RequestException:
        logger.exception("verify_subscription: RevenueCat lookup failed for user %s", app_user_id)
        return Response({'error': 'Could not reach RevenueCat'}, status=502)

    entitlements = resp.json().get('subscriber', {}).get('entitlements', {})
    entitlement = entitlements.get(django_settings.REVENUECAT_ENTITLEMENT_ID)
    expires_at = parse_datetime(entitlement['expires_date']) if entitlement and entitlement.get('expires_date') else None

    UserData.objects.update_or_create(user=request.user, defaults={'premium_expires_at': expires_at})
    is_premium = expires_at is not None and expires_at > timezone.now()
    return Response({'is_premium': is_premium, 'premium_expires_at': expires_at})

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def revenuecat_webhook(request):
    auth_header = request.headers.get('Authorization', '')
    if not hmac.compare_digest(auth_header, django_settings.REVENUECAT_WEBHOOK_SECRET):
        return Response(status=401)

    event = request.data.get('event', {})
    app_user_id = event.get('app_user_id')
    expiration_ms = event.get('expiration_at_ms')

    if app_user_id and str(app_user_id).isdigit():
        expires_at = (
            datetime.fromtimestamp(expiration_ms / 1000, tz=dt_timezone.utc)
            if expiration_ms else None
        )
        UserData.objects.filter(user__id=int(app_user_id)).update(premium_expires_at=expires_at)

    # Always 2xx (even for an unrecognized app_user_id) to avoid RevenueCat retry storms.
    return Response(status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_habits(request):
    new_habit_raw = request.data.get('new_habit')
    days = request.data.get('days')

    if not new_habit_raw or not new_habit_raw.strip():
        return Response({'error': 'habit name is required'}, status=400)
    if not isinstance(days, list) or not days or not set(days).issubset(set(ALL_DAYS)):
        return Response({'error': 'days must be a non-empty list of Mon/Tue/Wed/Thu/Fri/Sat/Sun'}, status=400)

    # get or create (seeding defaults if new) the user's single habits row
    habits_model = get_or_seed_user_habits(request.user)

    # gets the users habits, as a copy
    user_habits = dict(habits_model.habits)

    # formats users new habit
    new_habit = ' '.join(word.capitalize() for word in new_habit_raw.split())

    # appends after whatever the highest existing order is (not just len()),
    # so a previously-deleted habit can't leave a gap that causes a collision
    next_order = max((meta.get('order', 0) for meta in user_habits.values()), default=-1) + 1

    # `custom: True` is what lets reset_habits tell this apart from a default
    # habit and preserve it instead of wiping it out on reset.
    user_habits[new_habit] = {"Days": days, "custom": True, "order": next_order}

    habits_model.habits = user_habits
    habits_model.save()

    return Response({'habits': user_habits})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_habit(request): 
    user_habits_obj = UserHabits.objects.get(user=request.user)
    user_habits = dict(user_habits_obj.habits)

    habit_to_delete = request.data.get("habit_to_delete")
    if not habit_to_delete or not habit_to_delete.strip():
        return Response({'error': 'deleted habit required'}, status=400)
    
    del user_habits[habit_to_delete]

    user_habits_obj.habits = user_habits
    user_habits_obj.save()

    return Response({'Success': f'Deleted {habit_to_delete} from habits'})

# records/un-records that a habit was completed on a given local-calendar day --
# an idempotent "set" (not a blind toggle) so it can't drift from the client's
# own optimistic local state if a previous call silently failed
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_habit_completion(request):
    habit_name = request.data.get('habit_name')
    date_str = request.data.get('date')
    done = request.data.get('done')

    if not habit_name or not date_str:
        return Response({'error': 'habit_name and date are required'}, status=400)

    if done:
        HabitCompletion.objects.get_or_create(user=request.user, habit_name=habit_name, date=date_str)
    else:
        HabitCompletion.objects.filter(user=request.user, habit_name=habit_name, date=date_str).delete()

    return Response({'success': True})

# returns, for every local-calendar day since the user joined through today,
# how many scheduled habits were completed that day. `total` is computed from
# the user's *current* habit schedule (there's no historical schedule log), so
# it's a best-effort figure for days before today rather than an exact replay.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def habit_days(request):
    tz_name = request.query_params.get('tz', 'UTC')
    try:
        user_tz = ZoneInfo(tz_name)
    except Exception:
        user_tz = ZoneInfo('UTC')

    today = timezone.now().astimezone(user_tz).date()
    joined = request.user.date_joined.astimezone(user_tz).date()

    habits_model = UserHabits.objects.filter(user=request.user).first()
    habits = habits_model.habits if habits_model else {}

    completion_counts = (
        HabitCompletion.objects
        .filter(user=request.user, date__gte=joined, date__lte=today)
        .values('date')
        .annotate(count=Count('id'))
    )
    done_map = {entry['date']: entry['count'] for entry in completion_counts}

    days = []
    current = today
    while current >= joined:
        day_abbr = ALL_DAYS[current.weekday()]
        total = sum(1 for meta in habits.values() if day_abbr in meta.get('Days', []))
        days.append({
            'date': current.isoformat(),
            'done': done_map.get(current, 0),
            'total': total,
        })
        current -= timedelta(days=1)

    return Response({'days': days})

# restores the default habit set, wiping any custom habits added
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_habits(request):
    habits_model = get_or_seed_user_habits(request.user)

    # Preserve custom habits -- flagged explicitly via `custom: True` (set by
    # add_to_habits), but also fall back to "name isn't one of the defaults"
    # so habits added before this flag existed still survive a reset.
    custom_habits = {
        name: meta for name, meta in habits_model.habits.items()
        if meta.get('custom') or name not in DEFAULT_HABITS
    }

    habits_model.habits = {**dict(DEFAULT_HABITS), **custom_habits}
    habits_model.save()

    return Response({'habits': habits_model.habits})

# updates each named habit's `order` to match its index in the given list --
# this is how My Recovery's drag-to-reorder persists (see DEFAULT_HABITS note
# above on why this can't just rely on the dict's own key order)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder_habits(request):
    ordered_names = request.data.get('ordered_names')
    if not isinstance(ordered_names, list) or not ordered_names:
        return Response({'error': 'ordered_names must be a non-empty list'}, status=400)

    habits_model = get_or_seed_user_habits(request.user)
    user_habits = dict(habits_model.habits)

    for index, name in enumerate(ordered_names):
        if name in user_habits:
            user_habits[name] = {**user_habits[name], 'order': index}

    habits_model.habits = user_habits
    habits_model.save()

    return Response({'habits': user_habits})

