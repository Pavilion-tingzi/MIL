from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.mixins import ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from .models import *
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from django.db.models import Q
from datetime import datetime
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .permissions import IsGroupLeader

from MIL.serializers import UsersSerializer, LoginSerializer, RegisterSerializer, UserAvatarSerializer, \
    CashFlowSerializer, CategorySerializer


# 设置分页显示
class CustomPagination(PageNumberPagination):
    page_size = 10 #默认值
    page_size_query_param = 'size'  # 前端传递的每页数量参数名
    max_page_size = 100  # 每页最大数量限制

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UsersSerializer(user).data
            })
        return Response(serializer.errors, status=400)

class UserInfo(GenericViewSet,ListModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UsersSerializer

    def get_queryset(self):
        """只返回当前登录用户的数据"""
        return CustomUser.objects.filter(id=self.request.user.id)

    def list(self, request, *args, **kwargs):
        """覆盖默认的list方法，返回单个用户而非列表"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset.first())  # 获取第一个（唯一）用户
        return Response(serializer.data)

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "注册成功",
                "user": {
                    "id": user.id,
                    "username": user.username
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AvatarUploadView(GenericViewSet, CreateModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserAvatarSerializer  # 使用自定义 Serializer

    def get_object(self):
        """返回当前登录用户对象"""
        return self.request.user

    def create(self, request, *args, **kwargs):
        """覆盖 create 方法，直接操作用户对象"""
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class CashFlowViewSet(GenericViewSet, CreateModelMixin, ListModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CashFlowSerializer
    pagination_class = CustomPagination  # 添加分页类

    def get_queryset(self):
        queryset = CashFlow.objects.filter(user=self.request.user)
        # 获取查询参数
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        # 如果有日期范围参数，添加过滤条件
        if start_date and end_date:
            try:
                # 转换日期格式
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

                # 添加日期范围过滤
                queryset = queryset.filter(
                    transaction_date__gte=start_date,
                    transaction_date__lte=end_date
                )
            except ValueError:
                # 日期格式错误，忽略过滤
                pass

        return queryset.order_by('-transaction_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryViewSet(GenericViewSet, ListModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer
    queryset = SmallCategory.objects.all()
    pagination_class = None  # 禁用分页

# 查看团队成员
class GroupMembersAPIView(GenericViewSet, ListModelMixin):
    """查看团队成员（所有成员可访问）"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UsersSerializer

    def get_queryset(self):
        """返回当前用户所在组的成员列表"""
        user = self.request.user
        if not user.group:
            return CustomUser.objects.none()  # 返回空查询集
        # 获取除自己外的组成员（如需包含自己则移除exclude）
        return user.group.members.exclude(id=user.id)

    def list(self, request, *args, **kwargs):
        """重写list方法返回自定义响应结构"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# 管理员修改用户密码接口
User = get_user_model()

@csrf_exempt  # 仅用于测试，正式环境请用 CSRF 保护
@require_POST
def change_password_api(request):

    try:
        user_id = request.POST.get("user_id")
        new_password = request.POST.get("new_password")

        if not user_id or not new_password:
            return JsonResponse({"error": "缺少 user_id 或 new_password 参数"}, status=400)

        user = User.objects.get(pk=user_id)
        user.set_password(new_password)  # Django 会自动加密密码
        user.save()

        return JsonResponse({"success": True, "message": "密码已更新"})
    except User.DoesNotExist:
        return JsonResponse({"error": "用户不存在"}, status=404)