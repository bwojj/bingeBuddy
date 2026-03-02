from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bingeBuddyAPI', '0004_userdata_motivation_image_userurges'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UserUrges',
        ),
    ]
