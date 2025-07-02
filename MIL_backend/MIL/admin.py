from django.contrib import admin
from django.contrib.auth.admin import UserAdmin, GroupAdmin
from .models import CustomUser, Setting, CashFlow, SmallCategory, BigCategory, Group, Message, ProfitDetail, ProfitStat, \
    EmailVerificationCode, Notice
from django.contrib.auth.forms import UserChangeForm, UserCreationForm, AdminPasswordChangeForm

class CustomUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = CustomUser
        exclude = ('password',)

class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'avatar', 'nickname'),
        }),
    )

    fieldsets = (
        (None, {'fields': ('username',)}),
        ('个人信息', {'fields': ('first_name', 'last_name', 'email', 'avatar', 'nickname', 'group')}),
        ('权限', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('重要日期', {'fields': ('last_login', 'date_joined')}),
    )

    list_display = ('id','username', 'nickname', 'email', 'is_staff', 'unicode')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'group')
    search_fields = ('username', 'nickname', 'email', 'unicode')
    ordering = ('username',)
    filter_horizontal = ('groups', 'user_permissions',)

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                '<id>/password/',
                self.admin_site.admin_view(self.user_change_password),
                name='auth_user_password_change',
            ),
        ]
        return custom_urls + urls

    def render_change_form(self, request, context, *args, **kwargs):
        # 确保密码修改链接出现在上下文
        if 'original' in context:
            context['show_password_change'] = True
        return super().render_change_form(request, context, *args, **kwargs)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_password_change'] = True
        extra_context['has_password_change_permission'] = True
        return super().change_view(request, object_id, form_url, extra_context)

#自定义小分类的Admin界面
class SmallCategoryAdmin(admin.ModelAdmin):
    list_display = ('id','name','BigCategory','user')
    search_fields = ('name',)

class BigCategoryAdmin(admin.ModelAdmin):
    list_display = ('id','name','user')
    search_fields = ('name',)

class CashFlowAdmin(admin.ModelAdmin):
    list_display = ('id','transaction_date','transaction_type','subcategory','user','item_name','created_at','updated_at')
    search_fields = ('transaction_type','user',)

class GroupAdmin(admin.ModelAdmin):
    list_display = ('id','name','leader')
    search_fields = ('name', 'leader',)

class ProfitDetailAdmin(admin.ModelAdmin):
    list_display = ('id','original_amount','amortized_amount','amortization_date','transaction_type','subcategory','user')
    search_fields = ('cash_flow','subcategory','user')

class ProfitStatAdmin(admin.ModelAdmin):
    list_display = ('id','user','month','profit','total_income','total_expense','updated_at','created_at')

class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('email','code','created_at','is_verified')

class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title','content','created_at')

# 注册模型
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Setting)
admin.site.register(CashFlow, CashFlowAdmin)
admin.site.register(SmallCategory, SmallCategoryAdmin)
admin.site.register(BigCategory,BigCategoryAdmin)
admin.site.register(Group, GroupAdmin)
admin.site.register(Message)
admin.site.register(ProfitDetail, ProfitDetailAdmin)
admin.site.register(ProfitStat, ProfitStatAdmin)
admin.site.register(EmailVerificationCode, EmailVerificationCodeAdmin)
admin.site.register(Notice, NoticeAdmin)

