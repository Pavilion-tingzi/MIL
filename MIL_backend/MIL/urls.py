from django.contrib import admin
from django.urls import path,include
from django.views.static import serve
from django.conf import settings
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenRefreshView
from MIL.views import LoginView, UserInfo

router = SimpleRouter()
router.register(prefix="users",viewset=UserInfo,basename="users")

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]