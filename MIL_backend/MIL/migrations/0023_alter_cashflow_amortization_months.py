# Generated by Django 5.1.7 on 2025-06-15 10:10

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MIL', '0022_alter_smallcategory_icon'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cashflow',
            name='amortization_months',
            field=models.PositiveIntegerField(blank=True, null=True, validators=[django.core.validators.MaxValueValidator(50)], verbose_name='摊销天数'),
        ),
    ]
