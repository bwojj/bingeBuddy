from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bingeBuddyAPI', '0017_alter_urges_urge_note_alter_urges_urge_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdata',
            name='seen_recovery_intro',
            field=models.BooleanField(default=False),
        ),
    ]
