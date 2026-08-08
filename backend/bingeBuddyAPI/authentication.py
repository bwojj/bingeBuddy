from rest_framework_simplejwt.authentication import JWTAuthentication

class CookiesJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Prefer the Authorization Bearer header -- it's the frontend's
        # primary mechanism (expo-secure-store), always attached fresh on
        # every request for whichever account is currently logged in. The
        # access_token cookie is only a fallback for credentialed web
        # requests that don't set the header. Checking the cookie first would
        # let a stale cookie from a previously-tested account on the same
        # device/browser silently shadow a perfectly valid header for the
        # account actually in use -- e.g. the recovery-intro gate never
        # resolving because every request keeps authenticating as whichever
        # account's cookie happens to still be sitting in the jar.
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