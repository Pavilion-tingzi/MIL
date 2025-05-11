from django.contrib import admin
from django.urls import path,include
from django.views.static import serve
from django.conf import settings
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenRefreshView
from MIL.views import LoginView, UserInfo, RegisterView, AvatarUploadView, CashFlowViewSet, CategoryViewSet,change_password_api,GroupMembersAPIView

router = SimpleRouter()
router.register(prefix="users",viewset=UserInfo,basename="users")
router.register(prefix="uploadAvatar",viewset=AvatarUploadView,basename="uploadAvatar")
router.register(prefix="cashFlow",viewset=CashFlowViewSet,basename="cashFlow")
router.register(prefix="category",viewset=CategoryViewSet,basename="category")

router.register(prefix="group_members",viewset=GroupMembersAPIView,basename="group_members")

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('api/change-password/', change_password_api, name='change_password_api'),

]