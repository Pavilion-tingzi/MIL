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
        return CashFlow.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryViewSet(GenericViewSet, ListModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer
    queryset = SmallCategory.objects.all()
