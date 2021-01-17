# Generated by Django 3.0.7 on 2020-12-25 21:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('charChecker', '0008_auto_20201225_2131'),
    ]

    operations = [
        migrations.AlterField(
            model_name='browser',
            name='complexScriptSupport',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='browser',
            name='latinCombiningSupport',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='browser',
            name='rtlSupport',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='os',
            name='complexScriptSupport',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='os',
            name='latinCombiningSupport',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='os',
            name='rtlSupport',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='sequence',
            name='isEmoji',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AlterField(
            model_name='sequence',
            name='isProvisional',
            field=models.BooleanField(default=False, null=True),
        ),
    ]
