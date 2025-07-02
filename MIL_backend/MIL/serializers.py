from rest_framework import serializers
from django.contrib.auth import authenticate
from MIL.models import *
import re
from django.core.mail import send_mail
from django.conf import settings

# 用户登录
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError("用户名或密码错误")
        return user

# 用户组信息
class GroupInfoSerializer(serializers.ModelSerializer):
    leader_username = serializers.CharField(source='leader.username', read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'leader', 'leader_username', 'description','create_time']
        read_only_fields = ['id','leader', 'leader_username', 'create_time']

# 用户信息
class UsersSerializer(serializers.ModelSerializer):
    # 嵌套组信息
    group_info = GroupInfoSerializer(source='group', read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'nickname',
            'avatar',  # 头像
            'unicode',  # 唯一码
            'group_info'
        ]
# 用户注册
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})
    email = serializers.EmailField(required=True)
    code = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = [
            'username',
            'nickname',
            'password',
            'password2',
            'email',
            'code'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': True},
            'email': {'required': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("两次密码不一致")
        if len(data['password']) < 6:
            raise serializers.ValidationError("密码必须至少6位")
        if CustomUser.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("用户名已存在")
            # 校验用户名不能包含中文和特殊字符
        if not re.match(r'^[a-zA-Z0-9_]+$', data['username']):
            raise serializers.ValidationError("用户名不能包含中文和特殊字符，只允许字母、数字和下划线")
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "该邮箱已被注册"})

        # 验证码验证
        try:
            verification = EmailVerificationCode.objects.get(
                email=data['email'],
                code=data['code'],
                is_verified=False
            )

            if verification.is_expired():
                raise serializers.ValidationError({"code": "验证码已过期"})

            # 标记验证码为已验证
            verification.is_verified = True
            verification.save()

        except EmailVerificationCode.DoesNotExist:
            raise serializers.ValidationError({"code": "无效的验证码"})

        return data

    def create(self, validated_data):
        # 移除不需要的字段
        validated_data.pop('password2')
        validated_data.pop('code')

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            nickname=validated_data['nickname'],
            password=validated_data['password'],
            email=validated_data['email'],
        )
        return user
# 发送验证码邮件
class EmailCodeSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        # 验证邮箱是否已注册
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("该邮箱已被注册")
        return value

    def create(self, validated_data):
        email = validated_data['email']

        # 检查是否存在未过期的验证码
        now = timezone.now()
        existing_code = EmailVerificationCode.objects.filter(
            email=email,
            created_at__gte=now - timedelta(minutes=15),  # 15分钟内
            is_verified=False
        ).first()

        if existing_code:
            # 存在未过期的验证码，不再发送新的
            return existing_code

        # 删除旧的验证码（如果存在）
        EmailVerificationCode.objects.filter(email=email).delete()

        # 生成新验证码
        code = EmailVerificationCode.generate_code()
        verification = EmailVerificationCode.objects.create(
            email=email,
            code=code
        )

        # 发送邮件
        send_mail(
            '您的注册验证码',
            f'您的验证码是: {code}，15分钟内有效。',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return verification

# 更换头像
class UserAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['avatar']

# 修改用户团队信息
class UserGroupUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['group']

# 用户作为外键时，显示id和用户名
class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser  # 或你的自定义用户模型
        fields = ['id', 'username','nickname']  # 显示用户名、昵称

# 类别作为外键时，显示id和类别名
class CategorySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmallCategory
        fields = ['id', 'name','icon','BigCategory']  # 显示分类名称、图标

# 大类作为外键时，显示id，名称和收支类别
class BigCategorySimpleSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(
        source='get_type_display',
        read_only=True  # 确保这是只读的
    )
    class Meta:
        model = BigCategory
        fields = '__all__'  # 显示分类名称、收支类别
        read_only_fields = ['user']

# 现金流水
class CashFlowSerializer(serializers.ModelSerializer):
    # 覆盖外键字段，使用嵌套序列化器
    user = UserSimpleSerializer(read_only=True)
    subcategory = CategorySimpleSerializer(read_only=True)
    subcategory_id = serializers.PrimaryKeyRelatedField(
        queryset=SmallCategory.objects.all(),
        source='subcategory',
        write_only=True,
    )
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display',
        read_only=True  # 确保这是只读的
    )

    class Meta:
        model = CashFlow
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

# 类别序列化器，用于页面展示所有类别
class CategorySerializer(serializers.ModelSerializer):
    BigCategory_detail = serializers.SerializerMethodField(read_only=True)
    BigCategory = serializers.PrimaryKeyRelatedField(
        queryset=BigCategory.objects.all(),
        write_only=True  # 仅在写入时使用，不会在返回数据中显示
    )

    class Meta:
        model = SmallCategory
        fields = '__all__'
        read_only_fields = ['user']

    def get_BigCategory_detail(self, obj):
        # 手动序列化 BigCategory 数据
        serializer = BigCategorySimpleSerializer(obj.BigCategory)
        return serializer.data

# 组队消息查询
class MessageListSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    sender = UserSimpleSerializer(read_only=True)
    status = serializers.CharField(source='get_status_display', read_only=True)
    class Meta:
        model = Message
        fields = '__all__' # 显式列出字段

# 组队消息发送
class MessageCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True) #用于创建新消息时验证
    unicode = serializers.CharField(write_only=True, required=True) #用于创建新消息时验证

    class Meta:
        model = Message
        fields = ['id', 'user', 'sender', 'status', 'create_time', 'update_time', 'username', 'unicode']  # 显式列出字段
        read_only_fields = ['id', 'create_time', 'update_time', 'user', 'sender']  # 保护只读字段

    def validate(self, data):
        username = data.get('username')
        unicode = data.get('unicode')

        try:
            user = CustomUser.objects.get(username=username)
            if user.unicode != unicode:
                raise serializers.ValidationError({"用户名和unicode不匹配"})
            data['user'] = user
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"用户名不存在"})
        return data

    def create(self, validated_data):
        # 移除临时字段（username/unicode）
        validated_data.pop('unicode')
        validated_data.pop('username')
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)

# 组队消息状态修改接口
class MessageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['status']

# 每月固定收入和支出设置
class SettingSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(
        source='get_type_display',
        read_only=True  # 确保这是只读的
    )
    small_category_id = serializers.PrimaryKeyRelatedField(
        queryset=SmallCategory.objects.all(),
        source='small_category',
        write_only=True,
        required=True
    )
    small_category = CategorySimpleSerializer(read_only=True)

    class Meta:
        model = Setting
        fields = '__all__'
        extra_kwargs = {
            "user": {"read_only": True},
            "type": {"read_only": True},
            "day_of_month": {
                "error_messages": {
                    "min_value": "触发日必须在1到28日之间",
                    "max_value": "触发日必须在1到28日之间",
                }
            },
            "amount": {
                "error_messages": {
                    "invalid": "金额必须是有效的数字",
                }
            }
        }

    def validate(self, data):
        """全局校验逻辑"""
        errors = {}

        small_category = data.get('small_category')
        if small_category:
            # 根据大类的 type 设置 Setting 的 type
            big_category_type = small_category.BigCategory.type
            data['type'] = 1 if big_category_type == 1 else 2  # 大类为1=支出，其他=收入

        # 校验 day_of_month 是否在1-28日
        day_of_month = data.get('day_of_month')
        if day_of_month and (day_of_month < 1 or day_of_month > 28):
            errors['day_of_month'] = ["触发日必须在1到28日之间"]

        # 校验金额不能为负数（如果允许负数则跳过）
        amount = data.get('amount')
        if amount and amount < 0:
            errors['amount'] = ["金额不能为负数"]

        if not data.get('small_category'):
            errors['small_category_id'] = ["必须选择小分类"]

        if errors:
            raise serializers.ValidationError(errors)

        return data

# 现金流统计
class CashFlowSummarySerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    big_category_id = serializers.IntegerField(required=False)

# 利润统计
class ProfitStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfitStat
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')  # 创建时间和更新时间字段只读

# 利润明细
class ProfitDetailSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    subcategory = CategorySimpleSerializer(read_only=True)
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display',
        read_only=True  # 确保这是只读的
    )
    class Meta:
        model = ProfitDetail
        fields = '__all__'

# 站内消息通知
class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = '__all__'