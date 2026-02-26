from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import viewsets 
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes 
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import UserData, UserUrges
from .serializers import UserDataSerializer, UserSerializer, UserRegistrationSerializer, UserUrgeSerializer
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

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

            # sets the cookies, for secure auth
            res.set_cookie(
                key='access_token', 
                value=access_token,
                httponly=True,
                secure=True,
                samesite=False,
                path='/',
            )
            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite=False,
                path='/', 
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
                path="/"
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

# creates view for user urges
class UserUrgeView(viewsets.ModelViewSet):
    serializer_class = UserUrgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user 
        return UserUrges.objects.filter(pk=user_profile.pk)

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

# defines view to add to urges
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_urge_level(request):
    user_object, _ = UserUrges.objects.update_or_create(
        user=request.user, 
        defaults={
            "urge_level": request.data.get('urge_level'),
        }
    )
    return Response({"success": True})