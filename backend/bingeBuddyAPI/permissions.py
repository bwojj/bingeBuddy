from django.utils import timezone
from rest_framework.permissions import BasePermission


class HasActiveSubscription(BasePermission):
    message = 'An active AI Coach subscription is required.'

    def has_permission(self, request, view):
        user_data = request.user.data.first()
        expires_at = getattr(user_data, 'premium_expires_at', None)
        return expires_at is not None and expires_at > timezone.now()
