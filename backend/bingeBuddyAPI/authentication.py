from rest_framework_simplejwt.authentication import JWTAuthentication

# creates custom authentication class via cookies 
class CookiesJWTAuthentication(JWTAuthentication): 
    def authenticate(self, request):
        # tries to get access token 
        access_token = request.COOKIES.get('access_token')

        # returns none if no token 
        if not access_token:
            return None 
        
        # sets the validated token 
        validated_token = self.get_validated_token(access_token)

        try:
            # validates user using cookies 
            user = self.get_user(validated_token)
        except:
            return None 
        return (user, validated_token) 