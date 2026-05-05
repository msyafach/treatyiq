import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('submissions', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_type', models.CharField(
                    choices=[
                        ('dgt1', 'Form DGT-1 (Format PMK 112/2025)'),
                        ('cor', 'Certificate of Residence (CoR)'),
                        ('service_agreement', 'Service Agreement / Kontrak'),
                        ('beneficial_owner', 'Dokumentasi Beneficial Owner'),
                        ('economic_substance', 'Bukti Economic Substance'),
                    ],
                    max_length=50,
                )),
                ('file', models.FileField(upload_to='documents/%Y/%m/')),
                ('filename', models.CharField(max_length=255)),
                ('file_size', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('submission', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='documents',
                    to='submissions.submission',
                )),
                ('uploaded_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Dokumen',
                'verbose_name_plural': 'Dokumen',
                'ordering': ['-created_at'],
            },
        ),
    ]
