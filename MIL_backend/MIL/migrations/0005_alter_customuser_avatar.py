# Generated by Django 5.1.7 on 2025-04-23 20:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MIL', '0004_alter_customuser_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='avatar',
            field=models.ImageField(default='users/default.png', upload_to='users/'),
        ),
    ]
