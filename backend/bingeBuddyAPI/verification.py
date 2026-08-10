import logging
import random
from datetime import timedelta

import resend
from django.conf import settings
from django.utils import timezone

from .models import EmailVerificationCode, PasswordResetCode

logger = logging.getLogger(__name__)

CODE_TTL_MINUTES = 15
RESEND_COOLDOWN_SECONDS = 60
MAX_ATTEMPTS = 5


def create_verification_code(user):
    now = timezone.now()
    code = f"{random.randint(0, 999999):06d}"
    obj, _ = EmailVerificationCode.objects.update_or_create(
        user=user,
        defaults={
            'code': code,
            'created_at': now,
            'expires_at': now + timedelta(minutes=CODE_TTL_MINUTES),
            'attempts': 0,
        },
    )
    return obj


def send_verification_email(user, code):
    resend.api_key = settings.RESEND_API_KEY
    try:
        resend.Emails.send({
            "from": settings.VERIFICATION_EMAIL_FROM,
            "to": [user.email],
            "subject": "Your BingeBuddy verification code",
            "html": (
                f"<p>Your verification code is <strong>{code}</strong>. "
                f"It expires in {CODE_TTL_MINUTES} minutes.</p>"
            ),
        })
        return True
    except Exception:
        logger.exception("Failed to send verification email to %s", user.email)
        return False


def create_password_reset_code(user):
    now = timezone.now()
    code = f"{random.randint(0, 999999):06d}"
    obj, _ = PasswordResetCode.objects.update_or_create(
        user=user,
        defaults={
            'code': code,
            'created_at': now,
            'expires_at': now + timedelta(minutes=CODE_TTL_MINUTES),
            'attempts': 0,
        },
    )
    return obj


def send_password_reset_email(user, code):
    resend.api_key = settings.RESEND_API_KEY
    try:
        resend.Emails.send({
            "from": settings.VERIFICATION_EMAIL_FROM,
            "to": [user.email],
            "subject": "Reset your BingeBuddy password",
            "html": (
                f"<p>Your password reset code is <strong>{code}</strong>. "
                f"It expires in {CODE_TTL_MINUTES} minutes. "
                f"If you didn't request this, you can safely ignore this email.</p>"
            ),
        })
        return True
    except Exception:
        logger.exception("Failed to send password reset email to %s", user.email)
        return False
