from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('bingeBuddyAPI', '0016_urges_urge_note_alter_urges_urge_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='urges',
            name='urge_note',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='urges',
            name='urge_time',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
