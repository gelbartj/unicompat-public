# Generated by Django 3.0.7 on 2020-06-21 20:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('charChecker', '0003_auto_20200621_0759'),
    ]

    operations = [
        migrations.AddField(
            model_name='sequence',
            name='isProvisional',
            field=models.NullBooleanField(default=False),
        ),
    ]
