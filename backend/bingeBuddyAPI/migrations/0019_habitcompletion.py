import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('bingeBuddyAPI', '0018_userdata_seen_recovery_intro'),
    ]

    operations = [
        migrations.CreateModel(
            name='HabitCompletion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('habit_name', models.CharField(max_length=64)),
                ('date', models.DateField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='habit_completions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'habit_name', 'date')},
            },
        ),
    ]
