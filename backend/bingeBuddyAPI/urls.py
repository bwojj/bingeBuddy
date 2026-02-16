from django.urls import path
from .views import CustomTokenObtainPairView, CustomTokenRefreshView

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('api/token/refresh', CustomTokenRefreshView.as_view(), name='token-refresh')
]