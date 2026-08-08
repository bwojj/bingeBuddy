import base64
import time
from unittest.mock import MagicMock, patch

from cryptography.hazmat.primitives.asymmetric import rsa
from django.contrib.auth.models import User
from django.test import override_settings
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase
import jwt as pyjwt

from .models import EmailVerificationCode, SocialAccount, UserData
from .verification import CODE_TTL_MINUTES, MAX_ATTEMPTS, RESEND_COOLDOWN_SECONDS


class FakeResponse:
    def __init__(self, status_code=200, json_data=None):
        self.status_code = status_code
        self._json_data = json_data or {}

    def json(self):
        return self._json_data


def _int_to_b64url(value):
    byte_length = (value.bit_length() + 7) // 8
    value_bytes = value.to_bytes(byte_length, 'big')
    return base64.urlsafe_b64encode(value_bytes).rstrip(b'=').decode('ascii')


class RegisterTests(APITestCase):
    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_register_creates_user_and_sends_code(self, mock_send):
        response = self.client.post('/api/register', {
            'username': 'alex123',
            'first_name': 'Alex',
            'email': 'alex@example.com',
            'password': 'super-secret-1',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

        user = User.objects.get(username='alex123')
        record = EmailVerificationCode.objects.get(user=user)
        self.assertEqual(len(record.code), 6)
        self.assertTrue(record.code.isdigit())

        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[0][0]
        self.assertEqual(call_kwargs['to'], ['alex@example.com'])
        self.assertIn(record.code, call_kwargs['html'])

    @patch('bingeBuddyAPI.verification.resend.Emails.send', side_effect=Exception('resend down'))
    def test_register_succeeds_even_if_email_send_fails(self, mock_send):
        response = self.client.post('/api/register', {
            'username': 'alex123',
            'first_name': 'Alex',
            'email': 'alex@example.com',
            'password': 'super-secret-1',
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertTrue(User.objects.filter(username='alex123').exists())

    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_register_rejects_duplicate_email(self, mock_send):
        User.objects.create_user(username='existing', email='dup@example.com', password='pw12345678')
        response = self.client.post('/api/register', {
            'username': 'newname',
            'first_name': 'New',
            'email': 'dup@example.com',
            'password': 'super-secret-1',
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_register_rejects_duplicate_email_case_insensitive(self, mock_send):
        User.objects.create_user(username='existing', email='Dup@Example.com', password='pw12345678')
        response = self.client.post('/api/register', {
            'username': 'newname',
            'first_name': 'New',
            'email': 'dup@example.com',
            'password': 'super-secret-1',
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)


class VerifyEmailTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alex123', email='alex@example.com', password='pw12345678')
        self.client.force_authenticate(user=self.user)
        now = timezone.now()
        self.record = EmailVerificationCode.objects.create(
            user=self.user, code='123456', created_at=now, expires_at=now + timedelta(minutes=CODE_TTL_MINUTES),
        )

    def test_correct_code_verifies_user(self):
        response = self.client.post('/api/verify-email', {'code': '123456'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        user_data = UserData.objects.get(user=self.user)
        self.assertTrue(user_data.email_verified)
        self.assertFalse(EmailVerificationCode.objects.filter(user=self.user).exists())

    def test_wrong_code_increments_attempts(self):
        response = self.client.post('/api/verify-email', {'code': '000000'})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])
        self.record.refresh_from_db()
        self.assertEqual(self.record.attempts, 1)
        user_data, _ = UserData.objects.get_or_create(user=self.user)
        self.assertFalse(user_data.email_verified)

    def test_expired_code_rejected(self):
        self.record.expires_at = timezone.now() - timedelta(minutes=1)
        self.record.save(update_fields=['expires_at'])
        response = self.client.post('/api/verify-email', {'code': '123456'})
        self.assertEqual(response.status_code, 400)
        user_data, _ = UserData.objects.get_or_create(user=self.user)
        self.assertFalse(user_data.email_verified)

    def test_too_many_attempts_rejected(self):
        self.record.attempts = MAX_ATTEMPTS
        self.record.save(update_fields=['attempts'])
        response = self.client.post('/api/verify-email', {'code': '123456'})
        self.assertEqual(response.status_code, 429)

    def test_unauthenticated_request_rejected(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/verify-email', {'code': '123456'})
        self.assertIn(response.status_code, (401, 403))

    def test_already_verified_short_circuits(self):
        UserData.objects.update_or_create(user=self.user, defaults={'email_verified': True})
        response = self.client.post('/api/verify-email', {'code': 'anything'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('already_verified'))


class ResendVerificationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alex123', email='alex@example.com', password='pw12345678')
        self.client.force_authenticate(user=self.user)

    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_resend_generates_new_code_and_resets_attempts(self, mock_send):
        now = timezone.now() - timedelta(seconds=RESEND_COOLDOWN_SECONDS + 5)
        EmailVerificationCode.objects.create(
            user=self.user, code='111111', created_at=now,
            expires_at=now + timedelta(minutes=CODE_TTL_MINUTES), attempts=3,
        )
        response = self.client.post('/api/resend-verification')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        record = EmailVerificationCode.objects.get(user=self.user)
        self.assertNotEqual(record.code, '111111')
        self.assertEqual(record.attempts, 0)
        mock_send.assert_called_once()

    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_resend_within_cooldown_rejected(self, mock_send):
        now = timezone.now()
        EmailVerificationCode.objects.create(
            user=self.user, code='111111', created_at=now, expires_at=now + timedelta(minutes=CODE_TTL_MINUTES),
        )
        response = self.client.post('/api/resend-verification')
        self.assertEqual(response.status_code, 429)
        self.assertIn('retry_after_seconds', response.data)
        mock_send.assert_not_called()

    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_resend_when_already_verified_is_noop(self, mock_send):
        UserData.objects.update_or_create(user=self.user, defaults={'email_verified': True})
        response = self.client.post('/api/resend-verification')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('already_verified'))
        mock_send.assert_not_called()


class SocialAuthGoogleTests(APITestCase):
    @patch('bingeBuddyAPI.views.http_requests.get')
    def test_new_google_user_created_and_verified(self, mock_get):
        mock_get.return_value = FakeResponse(200, {'email': 'g@example.com', 'name': 'G User', 'id': 'google-uid-1'})
        response = self.client.post('/api/social-auth', {'provider': 'google', 'token': 'fake-access-token'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['is_new'])

        user = User.objects.get(email='g@example.com')
        self.assertTrue(SocialAccount.objects.filter(provider='google', provider_id='google-uid-1', user=user).exists())
        user_data = UserData.objects.get(user=user)
        self.assertTrue(user_data.email_verified)

    @patch('bingeBuddyAPI.views.http_requests.get')
    def test_repeat_google_sign_in_matches_existing_account(self, mock_get):
        mock_get.return_value = FakeResponse(200, {'email': 'g@example.com', 'name': 'G User', 'id': 'google-uid-1'})
        self.client.post('/api/social-auth', {'provider': 'google', 'token': 'fake-access-token'})
        response = self.client.post('/api/social-auth', {'provider': 'google', 'token': 'fake-access-token-2'})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['is_new'])
        self.assertEqual(User.objects.filter(email='g@example.com').count(), 1)

    @patch('bingeBuddyAPI.views.http_requests.get')
    def test_invalid_google_token_rejected(self, mock_get):
        mock_get.return_value = FakeResponse(401, {})
        response = self.client.post('/api/social-auth', {'provider': 'google', 'token': 'bad-token'})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    @patch('bingeBuddyAPI.views.http_requests.get')
    def test_google_matching_email_attaches_to_existing_user_and_verifies(self, mock_get):
        existing = User.objects.create_user(username='alex123', email='alex@example.com', password='pw12345678')
        mock_get.return_value = FakeResponse(200, {'email': 'alex@example.com', 'name': 'Alex', 'id': 'google-uid-9'})
        response = self.client.post('/api/social-auth', {'provider': 'google', 'token': 'fake-access-token'})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['is_new'])
        self.assertTrue(SocialAccount.objects.filter(provider='google', provider_id='google-uid-9', user=existing).exists())
        user_data = UserData.objects.get(user=existing)
        self.assertTrue(user_data.email_verified)


@override_settings(APPLE_BUNDLE_ID='com.pixacor.mybingebuddy')
class SocialAuthAppleTests(APITestCase):
    def setUp(self):
        self.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        public_numbers = self.private_key.public_key().public_numbers()
        self.jwks = {
            'keys': [{
                'kty': 'RSA',
                'kid': 'test-kid',
                'use': 'sig',
                'alg': 'RS256',
                'n': _int_to_b64url(public_numbers.n),
                'e': _int_to_b64url(public_numbers.e),
            }],
        }

    def _sign_token(self, aud='com.pixacor.mybingebuddy', exp_offset=3600, kid='test-kid', sub='apple-uid-1', email='apple@example.com'):
        now = int(time.time())
        payload = {'sub': sub, 'email': email, 'aud': aud, 'iss': 'https://appleid.apple.com',
                   'iat': now, 'exp': now + exp_offset}
        return pyjwt.encode(payload, self.private_key, algorithm='RS256', headers={'kid': kid})

    @patch('bingeBuddyAPI.views.http_requests.get')
    def test_new_apple_user_created_and_verified(self, mock_get):
        mock_get.return_value = FakeResponse(200, self.jwks)
        token = self._sign_token()
        response = self.client.post('/api/social-auth', {'provider': 'apple', 'token': token})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['is_new'])

        user = User.objects.get(email='apple@example.com')
        self.assertTrue(SocialAccount.objects.filter(provider='apple', provider_id='apple-uid-1', user=user).exists())
        user_data = UserData.objects.get(user=user)
        self.assertTrue(user_data.email_verified)

    @patch('bingeBuddyAPI.views.http_requests.get')
    def test_unknown_kid_rejected(self, mock_get):
        mock_get.return_value = FakeResponse(200, self.jwks)
        token = self._sign_token(kid='some-other-kid')
        response = self.client.post('/api/social-auth', {'provider': 'apple', 'token': token})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    @patch('bingeBuddyAPI.views.http_requests.get')
    def test_wrong_audience_rejected(self, mock_get):
        mock_get.return_value = FakeResponse(200, self.jwks)
        token = self._sign_token(aud='com.some.other.app')
        response = self.client.post('/api/social-auth', {'provider': 'apple', 'token': token})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    @patch('bingeBuddyAPI.views.http_requests.get')
    def test_expired_token_rejected(self, mock_get):
        mock_get.return_value = FakeResponse(200, self.jwks)
        token = self._sign_token(exp_offset=-3600)
        response = self.client.post('/api/social-auth', {'provider': 'apple', 'token': token})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])


class UpdateProfileEmailChangeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alex123', email='alex@example.com', password='pw12345678')
        UserData.objects.update_or_create(user=self.user, defaults={'email_verified': True})
        self.client.force_authenticate(user=self.user)

    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_changing_email_resets_verification_and_sends_new_code(self, mock_send):
        response = self.client.post('/api/update-profile', {'email': 'newaddress@example.com'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'newaddress@example.com')

        user_data = UserData.objects.get(user=self.user)
        self.assertFalse(user_data.email_verified)

        record = EmailVerificationCode.objects.get(user=self.user)
        self.assertEqual(len(record.code), 6)
        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[0][0]
        self.assertEqual(call_kwargs['to'], ['newaddress@example.com'])

    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_changing_email_to_existing_one_rejected(self, mock_send):
        User.objects.create_user(username='other', email='taken@example.com', password='pw12345678')
        response = self.client.post('/api/update-profile', {'email': 'taken@example.com'})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'alex@example.com')
        user_data = UserData.objects.get(user=self.user)
        self.assertTrue(user_data.email_verified)
        mock_send.assert_not_called()

    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_resubmitting_same_email_does_not_reset_verification(self, mock_send):
        response = self.client.post('/api/update-profile', {'email': 'alex@example.com'})
        self.assertEqual(response.status_code, 200)

        user_data = UserData.objects.get(user=self.user)
        self.assertTrue(user_data.email_verified)
        mock_send.assert_not_called()

    @patch('bingeBuddyAPI.verification.resend.Emails.send')
    def test_changing_only_first_name_does_not_touch_verification(self, mock_send):
        response = self.client.post('/api/update-profile', {'first_name': 'Alexandra'})
        self.assertEqual(response.status_code, 200)

        user_data = UserData.objects.get(user=self.user)
        self.assertTrue(user_data.email_verified)
        mock_send.assert_not_called()

    def test_unauthenticated_request_rejected(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/update-profile', {'email': 'new@example.com'})
        self.assertIn(response.status_code, (401, 403))
