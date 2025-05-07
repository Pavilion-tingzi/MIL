from django.contrib import admin
from django.urls import path,include
from django.views.static import serve
from django.conf import settings
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenRefreshView
from MIL.views import LoginView, UserInfo, RegisterView, AvatarUploadView, CashFlowViewSet, CategoryViewSet

router = SimpleRouter()
router.register(prefix="users",viewset=UserInfo,basename="users")
router.register(prefix="uploadAvatar",viewset=AvatarUploadView,basename="uploadAvatar")
router.register(prefix="cashFlow",viewset=CashFlowViewSet,basename="cashFlow")
router.register(prefix="category",viewset=CategoryViewSet,basename="category")

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register')

]