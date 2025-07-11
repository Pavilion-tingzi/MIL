# Generated by Django 5.1.7 on 2025-06-09 19:40

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MIL', '0020_profitstat'),
    ]

    operations = [
        migrations.AddField(
            model_name='bigcategory',
            name='user',
            field=models.ForeignKey(default=2, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='smallcategory',
            name='user',
            field=models.ForeignKey(default=2, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
