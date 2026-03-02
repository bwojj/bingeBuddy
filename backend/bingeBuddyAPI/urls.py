from django.urls import path, include
from rest_framework import routers
from .views import (CustomTokenObtainPairView, CustomTokenRefreshView,
                    is_authenticated, UserDataView, UserView, register, logout, add_data_main_cause,
                    add_data_coaching_style, add_data_motivation, set_motivation_image, JournalEntryView, add_journal_entry,
                    delete_entry)

router = routers.DefaultRouter()
router.register(r'data', UserDataView, 'data')
router.register(r'credentials', UserView, 'credentials')
router.register(r'journal', JournalEntryView, 'entries')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('api/token/refresh', CustomTokenRefreshView.as_view(), name='token-refresh'),
    path('api/authenticated', is_authenticated, name='authenticated'),
    path('api/register', register, name="register"),
    path('api/logout', logout, name="logout"),
    path('api/add-data-main-cause', add_data_main_cause, name="main-cause"),
    path('api/add-data-coaching-style', add_data_coaching_style, name="coaching-style"),
    path('api/add-data-motivation', add_data_motivation, name="motivation"),
    path('api/add-motivation-image', set_motivation_image, name="motivation-image"),
    path('api/add-journal-entry', add_journal_entry, name="add-journal-entry"),
    path('api/delete-journal-entry', delete_entry, name="delete-journal-entry")
]
