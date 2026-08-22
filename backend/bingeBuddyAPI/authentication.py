from rest_framework_simplejwt.authentication import JWTAuthentication

class CookiesJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Prefer authorization bearer header over all else
        auth_header = request.headers.get('Authorization', '')
        token = auth_header[7:] if auth_header.startswith('Bearer ') else request.COOKIES.get('access_token')

        if not token:
            return None

        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
        except Exception:
            return None

        return (user, validated_token)