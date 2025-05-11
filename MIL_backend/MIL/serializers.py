from rest_framework import serializers
from django.contrib.auth import authenticate
from MIL.models import *
import re

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
        fields = ['id', 'name', 'leader_username']
        read_only_fields = fields

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

    class Meta:
        model = CustomUser
        fields = [
            'username',
            'nickname',
            'password',
            'password2',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': True}
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
        return data

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            nickname=validated_data['nickname'],
            password=validated_data['password'],
        )
        return user

# 更换头像
class UserAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['avatar']

# 用户作为外键时，显示id和用户名
class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser  # 或你的自定义用户模型
        fields = ['id', 'username','nickname']  # 显示用户名、昵称

# 类别作为外键时，显示id和类别名
class CategorySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmallCategory
        fields = ['id', 'name','icon']  # 显示分类名称、图标

# 大类作为外键时，显示id，名称和收支类别
class BigCategorySimpleSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(
        source='get_type_display',
        read_only=True  # 确保这是只读的
    )
    class Meta:
        model = BigCategory
        fields = '__all__'  # 显示分类名称、收支类别

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
    BigCategory = BigCategorySimpleSerializer(read_only=True)

    class Meta:
        model = SmallCategory
        fields = '__all__'