from django.shortcuts import render
from django.contrib.auth.models import User
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.conf import settings as django_settings
from datetime import timedelta, datetime
from zoneinfo import ZoneInfo
import base64
import jwt as pyjwt
import requests as http_requests
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers
from cryptography.hazmat.backends import default_backend
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .models import UserData, JournalEntry, Urges, SocialAccount
from .serializers import UserDataSerializer, UserSerializer, UserRegistrationSerializer, JournalEntrySerializer, UrgeSerializer

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
                samesite=False,
                path='/',
                max_age=_30_DAYS,
            )
            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite=False,
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
        return Urges.objects.filter(user=user_profile)

    def list(self, request, *args, **kwargs):
        count = self.get_queryset().count()
        return Response({'count': count})

# view for adding an urge 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_urge(request): 
    urge = Urges.objects.create(
        user=request.user, 
    )

    return Response({'success': True})

# defines view for registering
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request): 
    # gets serializers
    serializer = UserRegistrationSerializer(data=request.data)
    # if it is valid, saves it else returns an error 
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True})
    return Response(serializer.errors, status=400)


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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_data_motivation(request): 
    data_obj, _ = UserData.objects.update_or_create(
        user=request.user, 
        defaults={
            "motivation": request.data.get('motivation'),
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
    if 'email' in request.data:
        user.email = request.data['email']
    if request.data.get('new_password'):
        if not user.check_password(request.data.get('current_password', '')):
            return Response({'success': False, 'error': 'Current password is incorrect'}, status=400)
        user.set_password(request.data['new_password'])
    user.save()
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
            name = info.get('name', '')
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
            name = ''
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
            first_name = name.split()[0] if name else ''
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                password=None,
            )
            is_new = True

        SocialAccount.objects.create(provider=provider, provider_id=provider_id, user=user)

    # Issue JWT tokens (same cookie pattern as regular login)
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    res = Response()
    res.data = {'success': True, 'access': access_token, 'is_new': is_new}

    _30_DAYS = 60 * 60 * 24 * 30
    res.set_cookie(key='access_token', value=access_token, httponly=True, secure=True,
                   samesite=False, path='/', max_age=_30_DAYS)
    res.set_cookie(key='refresh_token', value=refresh_token, httponly=True, secure=True,
                   samesite=False, path='/', max_age=60 * 60 * 24 * 365)
    return res
