from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    # 添加表单中显示的字段
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'avatar','nickname'),
        }),
    )

    # 编辑用户时显示的字段
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('个人信息', {'fields': ('first_name', 'last_name', 'avatar','nickname')}),
        ('权限', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('重要日期', {'fields': ('last_login', 'date_joined')}),
    )

    # 用户列表页显示的字段
    list_display = ('username', 'nickname','unicode')
    search_fields = ('username', 'nickname','unicode')

# Register your models here.
admin.site.register(CustomUser, CustomUserAdmin)

