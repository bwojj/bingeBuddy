from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes 
from rest_framework.permissions import IsAuthenticated, AllowAny
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
                samesite='None',
                path='/',
            )
            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True, 
                secure=True, 
                samesite='None',
                path='/', 
            )
            return res
        # if post fails 
        except: 
            return Response({'success': False})

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