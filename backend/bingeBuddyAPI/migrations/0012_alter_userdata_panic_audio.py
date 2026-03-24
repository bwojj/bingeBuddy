from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bingeBuddyAPI', '0011_userdata_panic_audio'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userdata',
            name='panic_audio',
            field=models.URLField(blank=True, null=True),
        ),
    ]
