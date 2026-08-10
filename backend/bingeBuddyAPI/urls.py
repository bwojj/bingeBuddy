from django.urls import path, include
from rest_framework import routers
from .views import (CustomTokenObtainPairView, CustomTokenRefreshView,
                    is_authenticated, UserDataView, UserView, register, logout, add_data_main_cause,
                    add_data_motivation, set_motivation_image, JournalEntryView, add_journal_entry,
                    delete_entry, UrgesView, log_urge, delete_urge, update_profile, urges_by_day, social_auth,
                    delete_account, set_panic_audio, get_panic_audio, delete_panic_audio, ai_coach, UserHabitsView,
                    add_to_habits, add_data_coaching_style, mark_recovery_intro_seen, mark_ai_coach_intro_seen, delete_habit,
                    set_habit_completion, habit_days, reset_habits, reorder_habits, set_default_urge_screen,
                    chat_sessions, chat_session_messages, add_memory, verify_email, resend_verification,
                    verify_subscription, revenuecat_webhook, set_reminder_preferences,
                    request_password_reset, reset_password)

router = routers.DefaultRouter()
router.register(r'data', UserDataView, 'data')
router.register(r'credentials', UserView, 'credentials')
router.register(r'journal', JournalEntryView, 'entries')
router.register(r'urges', UrgesView, 'urges')   
router.register(r'habits', UserHabitsView, 'habits')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('api/token/refresh', CustomTokenRefreshView.as_view(), name='token-refresh'),
    path('api/authenticated', is_authenticated, name='authenticated'),
    path('api/register', register, name="register"),
    path('api/verify-email', verify_email, name="verify-email"),
    path('api/resend-verification', resend_verification, name="resend-verification"),
    path('api/request-password-reset', request_password_reset, name="request-password-reset"),
    path('api/reset-password', reset_password, name="reset-password"),
    path('api/logout', logout, name="logout"),
    path('api/add-data-main-cause', add_data_main_cause, name="main-cause"),
    path('api/add-data-coaching-style', add_data_coaching_style, name="coaching-style"),
    path('api/add-data-motivation', add_data_motivation, name="motivation"),
    path('api/add-motivation-image', set_motivation_image, name="motivation-image"),
    path('api/add-journal-entry', add_journal_entry, name="add-journal-entry"),
    path('api/delete-journal-entry', delete_entry, name="delete-journal-entry"),
    path('api/log-urge', log_urge, name="log-urge"),
    path('api/delete-urge', delete_urge, name="delete-urge"),
    path('api/update-profile', update_profile, name="update-profile"),
    path('api/urges-by-day', urges_by_day, name="urges-by-day"),
    path('api/social-auth', social_auth, name="social-auth"),
    path('api/delete-account', delete_account, name="delete-account"),
    path('api/set-panic-audio', set_panic_audio, name="set-panic-audio"),
    path('api/get-panic-audio', get_panic_audio, name="get-panic-audio"),
    path('api/delete-panic-audio', delete_panic_audio, name="delete-panic-audio"),
    path('api/chat', ai_coach, name="ai-binge-eating-coach"),
    path('api/chat/sessions', chat_sessions, name="chat-sessions"),
    path('api/chat/sessions/<uuid:session_id>/messages', chat_session_messages, name="chat-session-messages"),
    path('api/add-to-habits', add_to_habits, name="add-to-habits"),
    path('api/mark-recovery-intro-seen', mark_recovery_intro_seen, name="mark-recovery-intro-seen"),
    path('api/mark-ai-coach-intro-seen', mark_ai_coach_intro_seen, name="mark-ai-coach-intro-seen"),
    path('api/set-default-urge-screen', set_default_urge_screen, name="default-urge-screen"),
    path('api/set-reminder-preferences', set_reminder_preferences, name="set-reminder-preferences"),
    path('api/delete-habit', delete_habit, name="delete_habit"),
    path('api/set-habit-completion', set_habit_completion, name="set-habit-completion"),
    path('api/habit-days', habit_days, name="habit-days"),
    path('api/reset-habits', reset_habits, name="reset-habits"),
    path('api/reorder-habits', reorder_habits, name="reorder-habits"),
    path('api/add-memory', add_memory, name="add-memory"),
    path('api/subscription/verify', verify_subscription, name="verify-subscription"),
    path('api/subscription/webhook', revenuecat_webhook, name="revenuecat-webhook"),
]
