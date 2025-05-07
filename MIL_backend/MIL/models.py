from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# Create your models here.
class CustomUser(AbstractUser):
    avatar = models.ImageField(upload_to="users/",default='users/default.png')
    create_time = models.DateTimeField(auto_now=True)
    unicode = models.CharField(max_length=50,unique=True,editable=False)
    def save(self, *args, **kwargs):
        if not self.unicode:  # 仅在新建时生成
            self.unicode = uuid.uuid4().hex[:10]  # 取uuid前10位
        super().save(*args, **kwargs)
    nickname = models.CharField(max_length=50)


    class Meta:
        verbose_name_plural = "用户权限表"

    def __str__(self):
        return self.username

class BigCategory(models.Model):
    """大分类表"""
    name = models.CharField(max_length=100)
    type_choices = (
        (1, "支出"),
        (2, "收入"),
        (3, "物品收入")
    )
    type = models.SmallIntegerField(verbose_name="类型", choices=type_choices,default=1)

    class Meta:
        verbose_name_plural = "大分类表"

    def __str__(self):
        return self.name

class SmallCategory(models.Model):
    """小分类表"""
    name = models.CharField(max_length=100)
    BigCategory = models.ForeignKey(BigCategory,on_delete=models.CASCADE)
    icon = models.ImageField(upload_to="images/",default='images/default.png')

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
    occurDate = models.DateField(verbose_name='发生日期')
    # 金额字段
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='金额')

    class Meta:
        verbose_name_plural = "用户收支设置表"

    def __str__(self):
        return self.name


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