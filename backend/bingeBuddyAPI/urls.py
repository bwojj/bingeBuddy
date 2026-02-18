from django.urls import path, include
from rest_framework import routers 
from .views import CustomTokenObtainPairView, CustomTokenRefreshView, is_authenticated, UserDataView

router = routers.DefaultRouter()
router.register(r'data', UserDataView, 'data')

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('api/token/refresh', CustomTokenRefreshView.as_view(), name='token-refresh'),
    path('api/authenticated', is_authenticated, name='authenticated'),
    path('api/', include(router.urls)), 
]