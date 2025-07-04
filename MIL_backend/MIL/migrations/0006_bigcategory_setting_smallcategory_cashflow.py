# Generated by Django 5.1.7 on 2025-05-03 15:42

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MIL', '0005_alter_customuser_avatar'),
    ]

    operations = [
        migrations.CreateModel(
            name='BigCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'verbose_name_plural': '大分类表',
            },
        ),
        migrations.CreateModel(
            name='Setting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('type', models.SmallIntegerField(choices=[(1, '支出'), (2, '收入')], verbose_name='类型')),
                ('occurDate', models.DateField(verbose_name='发生日期')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='金额')),
            ],
            options={
                'verbose_name_plural': '用户收支设置表',
            },
        ),
        migrations.CreateModel(
            name='SmallCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('BigCategory', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='MIL.bigcategory')),
            ],
            options={
                'verbose_name_plural': '小分类表',
            },
        ),
        migrations.CreateModel(
            name='CashFlow',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='创建时间')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='金额')),
                ('transaction_date', models.DateField(verbose_name='发生日期')),
                ('notes', models.TextField(blank=True, null=True, verbose_name='备注')),
                ('transaction_type', models.SmallIntegerField(choices=[(1, '支出'), (2, '收入'), (3, '物品收入')], verbose_name='小分类')),
                ('is_amortized', models.BooleanField(default=False, verbose_name='是否摊销')),
                ('amortization_start_date', models.DateField(blank=True, null=True, verbose_name='摊销起始日')),
                ('amortization_months', models.PositiveIntegerField(blank=True, null=True, verbose_name='摊销月数')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='所属用户')),
                ('setting', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='MIL.setting', verbose_name='所属设置')),
                ('subcategory', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='MIL.smallcategory', verbose_name='小分类')),
            ],
            options={
                'verbose_name': '现金流',
                'verbose_name_plural': '现金流',
                'ordering': ['-transaction_date'],
            },
        ),
    ]
