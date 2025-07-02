from django.http import JsonResponse
from rest_framework.decorators import action
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
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.permissions import BasePermission
from django.db.models import Sum
from MIL_backend.settings import MEDIA_URL
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from urllib.parse import unquote
from .utils import calculate_current_user_monthly_profit
from MIL.serializers import UsersSerializer, LoginSerializer, RegisterSerializer, UserAvatarSerializer, \
    CashFlowSerializer, CategorySerializer, MessageListSerializer, MessageUpdateSerializer, MessageCreateSerializer, \
    GroupInfoSerializer, UserGroupUpdateSerializer, SettingSerializer, CashFlowSummarySerializer, ProfitStatSerializer, \
    BigCategorySimpleSerializer, ProfitDetailSerializer, EmailCodeSerializer, NoticeSerializer


class IsOwnerOrReadOnly(BasePermission):
    """
    只允许流水记录的所有者进行修改/删除
    """
    def has_object_permission(self, request, view, obj):
        # 读取权限允许所有请求
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # 写入权限只允许所有者
        return obj.user == request.user

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
# 注册
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
# 更换头像
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
# 现金流水明细
class CashFlowViewSet(GenericViewSet, CreateModelMixin, ListModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated,IsOwnerOrReadOnly]
    serializer_class = CashFlowSerializer
    pagination_class = CustomPagination  # 添加分页类

    def get_queryset(self):
        user = self.request.user
        queryset = CashFlow.objects.all()

        # 获取查询参数
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        hasgroup = self.request.query_params.get('group', None)
        categories = self.request.query_params.get('categories', None)
        noteskey = self.request.query_params.get('noteskey', None)

        if hasgroup == "1":
            if user.group:
                queryset = queryset.filter(
                    models.Q(user=user) |  # 用户自己的数据
                    models.Q(user__group=user.group)  # 或同组数据（仅当用户有组时）
                )
            else:
                queryset = queryset.filter(user=user)  # 无组用户只能看自己的数据
        else:
            queryset = queryset.filter(user=user)

        # 如果有日期范围参数，添加过滤条件
        if start_date and end_date:
            try:
                # 转换日期格式
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

                # 添加日期范围过滤
                queryset = queryset.filter(
                    transaction_date__gte=start_date,
                    transaction_date__lte=end_date,
                )
            except ValueError:
                # 日期格式错误，忽略过滤
                pass

        # 如果有分类参数，添加过滤条件
        if categories:
            try:
                # 解码 URL 编码的 categories
                decoded_categories = unquote(categories)
                # 按逗号拆分，并去除可能的空格
                category_names = [name.strip() for name in decoded_categories.split(',')]
                # 使用 subcategory__name 进行查询
                queryset = queryset.filter(subcategory__name__in=category_names)
            except (ValueError, AttributeError):
                pass

        if noteskey:
            queryset = queryset.filter(notes__icontains=noteskey)

        return queryset.order_by('-transaction_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# 小类别的增删改查
class CategoryViewSet(GenericViewSet, ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer
    pagination_class = None  # 禁用分页

    def get_queryset(self):
        return SmallCategory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # 检查该小类别是否被任何现金流水使用
        if CashFlow.objects.filter(subcategory=instance).exists():
            return Response(
                {"detail": "无法删除，类别正被使用"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

# 大类别的增删改查
class BigCategoryViewSet(GenericViewSet, ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = BigCategorySimpleSerializer
    pagination_class = None  # 禁用分页

    def get_queryset(self):
        return BigCategory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # 检查该大类别下的任何小类别是否被现金流水使用
        if CashFlow.objects.filter(subcategory__BigCategory=instance).exists():
            return Response(
                {"detail": "无法删除，类别正被使用"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

# 查看团队成员
class GroupMembersAPIView(GenericViewSet, ListModelMixin):
    """查看团队成员（所有成员可访问）"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UsersSerializer
    pagination_class = None  # 禁用分页

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

# 创建团队
class CreateGroupAPIView(GenericViewSet, CreateModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = GroupInfoSerializer

    def create(self, request, *args, **kwargs):
        leader = self.request.user
        if leader.group:
            return Response({"error":"用户已有团队"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 创建团队
        group = serializer.save(leader=leader)
        # 更新用户表队长的group字段
        leader.group = group
        leader.save()
        return Response(serializer.data)

# 删除团队
class DeleteGroupAPIView(GenericViewSet, DestroyModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = GroupInfoSerializer
    queryset = Group.objects.all()
    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        group = self.get_object()
        if user.id == group.leader.id:
            return super().destroy(request, *args, **kwargs)
        return Response({'error':'请联系团队长解散该团队'}, status=status.HTTP_403_FORBIDDEN)

# 接受组队邀请，修改用户表自己的团队字段
class UserGroupUpdateAPIView(GenericViewSet, UpdateModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserGroupUpdateSerializer
    queryset = CustomUser.objects.all()

    def update(self, request, *args, **kwargs):
        current_user = request.user
        inviter = self.get_object()
        if not current_user.group:
            serializer = self.get_serializer(current_user, data={"group": inviter.group.id},partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({'success': f'已成功加入 {inviter.group} 组'},status=status.HTTP_200_OK)
        return Response({'error':'您已有团队，不能重复加入'}, status=status.HTTP_400_BAD_REQUEST)

# 删除团队成员，即修改成员的用户表group字段为null
class UserGroupDeleteAPIView(GenericViewSet, UpdateModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserGroupUpdateSerializer
    queryset = CustomUser.objects.all()

    def update(self, request, *args, **kwargs):
        member = self.get_object()
        serializer = self.get_serializer(member, data={"group": ""},partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'success': '已删除该成员'}, status=status.HTTP_200_OK)
# 查看自己的消息
class MessageListViewSet(GenericViewSet, ListModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = MessageListSerializer
    pagination_class = None  # 禁用分页

    def get_queryset(self):
        return Message.objects.filter(user=self.request.user)

# 新增一条消息
class MessageCreateViewSet(GenericViewSet, CreateModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = MessageCreateSerializer

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

# 修改消息状态
class MessageUpdateViewSet(GenericViewSet, UpdateModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = MessageUpdateSerializer

    def get_queryset(self):
        return Message.objects.filter(user=self.request.user)

# 每月固定收入和支出设置
class SettingViewSet(GenericViewSet, ListModelMixin, CreateModelMixin, UpdateModelMixin, DestroyModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = SettingSerializer
    pagination_class = None  # 禁用分页

    def get_queryset(self):
        return Setting.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=self.request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 现金流统计
class CashFlowSummaryView(GenericViewSet,ListModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CashFlowSummarySerializer
    pagination_class = None  # 禁用分页

    def get_queryset(self):
        queryset = CashFlow.objects.all()
        user = self.request.user

        params = self.request.query_params
        start_date = params.get('start_date',None)
        end_date = params.get('end_date',None)
        big_category_id = params.get('big_category_id',None)
        hasgroup = params.get('group', None)

        if hasgroup == "1":
            if user.group:
                queryset = queryset.filter(
                    models.Q(user=user) |  # 用户自己的数据
                    models.Q(user__group=user.group)  # 或同组数据（仅当用户有组时）
                )
            else:
                queryset = queryset.filter(user=user)  # 无组用户只能看自己的数据
        else: queryset = queryset.filter(user=user)

        # 如果有日期范围参数，添加过滤条件
        if start_date and end_date:
            try:
                # 转换日期格式
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

                # 添加日期范围过滤
                queryset = queryset.filter(
                    transaction_date__gte=start_date,
                    transaction_date__lte=end_date,
                )
            except ValueError:
                # 日期格式错误
                end_date = timezone.now().date()
                start_date = end_date - timedelta(days=180)  # 约6个月
                queryset = queryset.filter(
                    transaction_date__gte=start_date,
                    transaction_date__lte=end_date,
                )
        else:
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=180)  # 约6个月
            queryset = queryset.filter(
                    transaction_date__gte=start_date,
                    transaction_date__lte=end_date,
                )

        if big_category_id:
            queryset = queryset.filter(subcategory__BigCategory_id=big_category_id)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # 分组统计
        summary = queryset.values(
            'transaction_type',
            'subcategory__BigCategory__name',
        ).annotate(
            total_amount=Sum('amount')
        ).order_by('transaction_type')

        # 格式化结果
        result = {
            'income': {
                'total_income':0,
                'details':[]
            },
            'expense': {
                'total_expense':0,
                'details':[]
            },
        }

        for item in summary:
            if item['transaction_type'] == 1:
                result['expense']['details'].append({
                    'big_category_name': item['subcategory__BigCategory__name'],
                    'total_amount': float(item['total_amount'])
                })
                result['expense']['total_expense'] += float(item['total_amount'])
            else:
                result['income']['details'].append({
                    'big_category_name': item['subcategory__BigCategory__name'],
                    'total_amount': float(item['total_amount'])
                })
                result['income']['total_income'] += float(item['total_amount'])
        for item in result['expense']['details']:
            item['percent'] = round(item['total_amount'] / result['expense']['total_expense'],4)
        for item in result['income']['details']:
            item['percent'] = round(item['total_amount'] / result['income']['total_income'],4)

        return Response(result)

# 利润统计
class ProfitStatView(GenericViewSet,ListModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ProfitStatSerializer
    pagination_class = None  # 禁用分页

    def get_queryset(self):
        queryset = ProfitStat.objects.all()
        user = self.request.user

        params = self.request.query_params
        start_date = params.get('start_date',None)
        end_date = params.get('end_date',None)
        hasgroup = params.get('group', None)

        if hasgroup == "1":
            if user.group:
                queryset = queryset.filter(
                    models.Q(user=user) |  # 用户自己的数据
                    models.Q(user__group=user.group)  # 或同组数据（仅当用户有组时）
                )
            else:
                queryset = queryset.filter(user=user)  # 无组用户只能看自己的数据
        else:
            queryset = queryset.filter(user=user)

        if start_date and end_date:
            try:
                # 转换日期格式
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

                queryset = self.apply_date_filter(queryset, start_date, end_date)

            except ValueError:
                # 处理日期格式错误，类比未输入日期参数
                end_date = timezone.now().date()
                start_date = end_date - timedelta(days=180)  # 约6个月
                queryset = self.apply_date_filter(queryset, start_date, end_date)
        else:
            # 无日期参数时默认近6个月
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=180)  # 约6个月
            queryset = self.apply_date_filter(queryset, start_date, end_date)

        return queryset.order_by('year', 'month')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # 计算汇总数据
        summary = queryset.aggregate(
            total_income_sum=Sum('total_income'),
            total_expense_sum=Sum('total_expense'),
            profit_sum=Sum('profit')
        )
        monthly_summary = queryset.values('year', 'month').annotate(
            income_sum=Sum('total_income'),
            expense_sum=Sum('total_expense'),
            profit_sum=Sum('profit')
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'data': serializer.data,
            'summary': summary,
            'monthly_summary': monthly_summary,
        })

    def apply_date_filter(self, queryset, start_date, end_date):
        start_month = start_date.month
        end_month = end_date.month
        start_year = start_date.year
        end_year = end_date.year

        if start_year == end_year:
            # 同一年份内的查询
            queryset = queryset.filter(
                year=start_year,
                month__gte=start_month,
                month__lte=end_month
            )
        else:
            # 跨年份的查询
            queryset = queryset.filter(
                Q(year=start_year, month__gte=start_month) |
                Q(year__gt=start_year, year__lt=end_year) |
                Q(year=end_year, month__lte=end_month)
            )

        return queryset

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def calculate_profit(self, request):
        """
        自定义动作：触发计算近6个月的利润统计
        """
        try:
            calculate_current_user_monthly_profit(self.request.user)
            return Response({"status": "success", "message": "利润统计更新成功"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 利润明细查询
class ProfitDetailView(GenericViewSet,ListModelMixin):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    serializer_class = ProfitDetailSerializer
    pagination_class = CustomPagination  # 添加分页类

    def get_queryset(self):
        user = self.request.user
        queryset = ProfitDetail.objects.all()

        # 获取查询参数
        hasgroup = self.request.query_params.get('group', None)

        if hasgroup == "1":
            if user.group:
                queryset = queryset.filter(
                    models.Q(user=user) |  # 用户自己的数据
                    models.Q(user__group=user.group)  # 或同组数据（仅当用户有组时）
                )
            else:
                queryset = queryset.filter(user=user)  # 无组用户只能看自己的数据
        else:
            queryset = queryset.filter(user=user)

        return queryset
# 发送验证码邮件
class SendEmailCodeView(APIView):
    def post(self, request):
        serializer = EmailCodeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "验证码已发送",
                "email": serializer.validated_data['email']
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 站内消息通知
class NoticeView(GenericViewSet,ListModelMixin):
    pagination_class = None  # 禁用分页
    serializer_class = NoticeSerializer

    def get_queryset(self):
        latest_notice = Notice.objects.order_by('-created_at').first()
        return Notice.objects.filter(pk=latest_notice.pk) if latest_notice else Notice.objects.none()

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