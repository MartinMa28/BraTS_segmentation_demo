# Generated by Django 2.2 on 2019-05-21 07:21

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MRICase',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('case_id', models.CharField(max_length=50)),
                ('t1', models.FileField(upload_to='cases')),
                ('t1ce', models.FileField(upload_to='cases')),
                ('t2', models.FileField(upload_to='cases')),
                ('flair', models.FileField(upload_to='cases')),
            ],
        ),
    ]
