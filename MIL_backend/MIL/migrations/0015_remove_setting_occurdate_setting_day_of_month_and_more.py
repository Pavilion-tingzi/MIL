# Generated by Django 5.1.7 on 2025-05-25 14:43

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MIL', '0014_alter_message_sender'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='setting',
            name='occurDate',
        ),
        migrations.AddField(
            model_name='setting',
            name='day_of_month',
            field=models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(28)], verbose_name='每月触发日'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='setting',
            name='last_executed',
            field=models.DateField(blank=True, null=True, verbose_name='上次执行日期'),
        ),
        migrations.AddField(
            model_name='setting',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
