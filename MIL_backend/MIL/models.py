import random
import string
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
import uuid
from django.utils import timezone
from datetime import timedelta

# Create your models here.
class CustomUser(AbstractUser):
    avatar = models.ImageField(upload_to="users/",default='users/default.png')
    create_time = models.DateTimeField(auto_now=True)
    unicode = models.CharField(max_length=50,unique=True,editable=False)
    nickname = models.CharField(max_length=50)
    email = models.EmailField(unique=True)  # 确保email字段是唯一的
    group = models.ForeignKey(
        'Group',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members',
        verbose_name='所属组'
    )

    def save(self, *args, **kwargs):
        if not self.unicode:  # 仅在新建时生成
            self.unicode = uuid.uuid4().hex[:10]  # 取uuid前10位
        super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "用户权限表"

    def __str__(self):
        return self.username

class Group(models.Model):
    """
    用户组模型
    """
    name = models.CharField(max_length=100, unique=True, verbose_name='组名')
    leader = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='leading_group',
        verbose_name='组长'
    )
    create_time = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    description = models.TextField(blank=True, null=True, verbose_name='描述')

    class Meta:
        verbose_name = '用户组'
        verbose_name_plural = '用户组'
        ordering = ['-create_time']

    def __str__(self):
        return self.name

class BigCategory(models.Model):
    """大分类表"""
    name = models.CharField(max_length=100)
    type_choices = (
        (1, "支出"),
        (2, "收入"),
        (3, "物品收入")
    )
    type = models.SmallIntegerField(verbose_name="类型", choices=type_choices,default=1)
    icon = models.ImageField(upload_to="images/",default='images/default.png')
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "大分类表"

    def __str__(self):
        return self.name

class SmallCategory(models.Model):
    """小分类表"""
    name = models.CharField(max_length=100)
    BigCategory = models.ForeignKey(BigCategory,on_delete=models.CASCADE)
    icon = models.ImageField(upload_to="icons/",default='icons/default.png')
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "小分类表"

    def __str__(self):
        return self.name

class Setting(models.Model):
    """设置表"""
    name = models.CharField(max_length=100)
    type_choices = (
        (1,"支出"),
        (2,"收入")
    )
    type = models.SmallIntegerField(verbose_name="类型",choices=type_choices)
    small_category = models.ForeignKey(SmallCategory,on_delete=models.PROTECT)
    day_of_month = models.PositiveSmallIntegerField(
        verbose_name="每月触发日",
        validators=[MinValueValidator(1), MaxValueValidator(28)]  # 限制1-28日避免月份差异
    )
    # 金额字段
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='金额')
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    last_executed = models.DateField(null=True, blank=True, verbose_name="上次执行日期")

    class Meta:
        verbose_name_plural = "用户收支设置表"

    def __str__(self):
        return f"{self.user.username}的每月{self.day_of_month}日{self.name}"

class CashFlow(models.Model):
    """现金流表"""
    # 类别选项
    TYPE_CHOICES = [
        (1, '支出'),
        (2, '收入'),
        (3, '物品收入'),
    ]

    # 自动生成的时间字段
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    # 金额字段
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='金额')

    # 外键字段
    subcategory = models.ForeignKey(
        SmallCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='小分类'
    )

    # 发生日期
    transaction_date = models.DateField(verbose_name='发生日期')

    # 备注
    notes = models.TextField(blank=True, null=True, verbose_name='备注')

    # 类别选择
    transaction_type = models.SmallIntegerField(
        choices=TYPE_CHOICES,
        verbose_name='类型'
    )

    # 摊销相关字段
    is_amortized = models.BooleanField(default=False, verbose_name='是否摊销')
    amortization_start_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='摊销起始日'
    )
    amortization_months = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MaxValueValidator(50)],
        verbose_name='摊销天数'
    )

    # 用户外键
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        verbose_name='所属用户'
    )

    # 设置外键
    setting = models.ForeignKey(
        Setting,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='所属设置'
    )

    # 物品名称，设置物品收入时所需字段
    item_name = models.TextField(blank=True, null=True, verbose_name='物品名称')

    class Meta:
        verbose_name = '现金流'
        verbose_name_plural = '现金流'
        ordering = ['-transaction_date']

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount} - {self.transaction_date}"

# 消息表
class Message(models.Model):
    create_time = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    update_time = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        verbose_name='接收用户',
        related_name='received_messages'
    )
    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        verbose_name='发送用户',
        related_name='sent_messages',
    )
    STATUS_CHOICES = [
        (1, '未决定'),
        (2, '接受'),
        (3, '拒绝'),
    ]
    status = models.SmallIntegerField(choices=STATUS_CHOICES,default=1,verbose_name='状态')

    class Meta:
        verbose_name = '消息'
        verbose_name_plural = '消息'
        ordering = ['-create_time']  # 默认按时间倒序

    def __str__(self):
        return f"{self.sender} -> {self.user} - {self.create_time}"

# 利润明细表
class ProfitDetail(models.Model):
    cash_flow = models.ForeignKey(
        CashFlow,
        on_delete=models.CASCADE,
        verbose_name="关联现金流",
        null=True,
        blank=True,
    )
    # 金额相关字段
    original_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='原始金额')
    amortized_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='摊销金额')
    # 时间字段
    transaction_date = models.DateField(verbose_name='交易日期')
    amortization_date = models.DateField(verbose_name='摊销日期')  # 实际计入利润的日期
    # 分类信息
    transaction_type = models.SmallIntegerField(choices=CashFlow.TYPE_CHOICES, verbose_name='类型')
    subcategory = models.ForeignKey(
        SmallCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='小分类'
    )
    # 摊销信息
    is_amortized = models.BooleanField(default=False, verbose_name='是否摊销')
    amortization_period = models.PositiveIntegerField(null=True, blank=True, verbose_name='摊销期数')
    current_period = models.PositiveIntegerField(null=True, blank=True, verbose_name='当前期数')
    # 用户关联
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        verbose_name='所属用户'
    )
    # 备注
    notes = models.TextField(blank=True, null=True, verbose_name='备注')

    class Meta:
        verbose_name = '利润明细'
        verbose_name_plural = '利润明细'
        ordering = ['-amortization_date']

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amortized_amount} - {self.amortization_date}"

# 利润统计表
class ProfitStat(models.Model):
    # 用户关联
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        verbose_name='所属用户',
        related_name='monthly_profits'
    )
    year = models.PositiveIntegerField(verbose_name='统计年份')
    month = models.PositiveIntegerField(verbose_name='统计月份(1-12)')
    total_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='总收入'
    )
    total_expense = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='总支出'
    )
    profit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='净利润'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='生成时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '月度利润统计'
        verbose_name_plural = '月度利润统计'
        unique_together = [['user', 'year', 'month']]  # 防止重复统计
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.user.username}-{self.year}年{self.month}月利润"

# 邮箱验证码
class EmailVerificationCode(models.Model):
    email = models.EmailField(unique=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    @classmethod
    def generate_code(cls):
        return ''.join(random.choices(string.digits, k=6))

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=15)

    def __str__(self):
        return f"{self.email}: {self.code}"

# 小程序站内通知
class Notice(models.Model):
    title = models.CharField(max_length=64,verbose_name="公告标题")
    content = models.TextField(verbose_name="公告内容")
    created_at = models.DateTimeField(auto_now_add=True,verbose_name="创建时间")
    class Meta:
        verbose_name = "公告表"
    def __str__(self):
        return self.title