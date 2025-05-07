from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Setting, CashFlow, SmallCategory, BigCategory


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

#自定义小分类的Admin界面
class SmallCategoryAdmin(admin.ModelAdmin):
    list_display = ('name','BigCategory')
    search_fields = ('name',)

class CashFlowAdmin(admin.ModelAdmin):
    list_display = ('transaction_date','transaction_type','subcategory','user','item_name')
    search_fields = ('transaction_type','user',)


# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Setting)
admin.site.register(CashFlow,CashFlowAdmin)
admin.site.register(SmallCategory,SmallCategoryAdmin)
admin.site.register(BigCategory)


