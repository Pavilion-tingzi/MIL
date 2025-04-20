from rest_framework import serializers
from django.contrib.auth import authenticate
from MIL.models import *


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError("用户名或密码错误")
        return user

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'nickname',
            'avatar',  # 头像
            'unicode'  # 唯一码
        ]
