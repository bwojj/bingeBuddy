from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bingeBuddyAPI', '0020_userdata_default_urge_screen'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdata',
            name='seen_ai_coach_intro',
            field=models.BooleanField(default=False),
        ),
    ]
