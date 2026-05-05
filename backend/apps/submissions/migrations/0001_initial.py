import django.db.models.deletion
import django.utils.timezone
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vendor_name', models.CharField(max_length=255)),
                ('foreign_tax_id', models.CharField(max_length=100)),
                ('country', models.CharField(
                    choices=[
                        ('singapore', 'Singapura'),
                        ('japan', 'Jepang'),
                        ('netherlands', 'Belanda'),
                        ('usa', 'Amerika Serikat'),
                        ('australia', 'Australia'),
                        ('other', 'Negara Lainnya'),
                    ],
                    max_length=50,
                )),
                ('income_type', models.CharField(
                    choices=[
                        ('technical_services', 'Jasa Teknis / Management Fee'),
                        ('royalties', 'Royalti (IP, merek dagang, paten, lisensi software)'),
                        ('dividends_general', 'Dividen — kepemilikan <25%'),
                        ('dividends_qualified', 'Dividen — kepemilikan ≥25% (365+ hari, PMK 112 Pasal 20)'),
                        ('interest', 'Bunga'),
                    ],
                    max_length=50,
                )),
                ('amount_idr', models.DecimalField(decimal_places=2, max_digits=20)),
                ('is_beneficial_owner', models.BooleanField()),
                ('passes_ppt', models.BooleanField()),
                ('has_economic_substance', models.BooleanField()),
                ('has_permanent_establishment', models.BooleanField(blank=True, null=True)),
                ('treaty_rate', models.DecimalField(decimal_places=4, default=Decimal('0.20'), max_digits=5)),
                ('domestic_rate', models.DecimalField(decimal_places=4, default=Decimal('0.20'), max_digits=5)),
                ('legal_basis', models.CharField(blank=True, max_length=200)),
                ('risk_flagged', models.BooleanField(default=False)),
                ('risk_flags', models.JSONField(default=list)),
                ('tax_savings_idr', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=20)),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Menunggu'),
                        ('approved', 'Disetujui'),
                        ('rejected', 'Ditolak'),
                        ('flagged', 'Ditandai'),
                    ],
                    default='pending',
                    max_length=20,
                )),
                ('rejection_reason', models.TextField(blank=True)),
                ('tax_year', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('submitted_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='submissions',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('reviewed_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='reviewed_submissions',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Permohonan',
                'verbose_name_plural': 'Permohonan',
                'ordering': ['-created_at'],
            },
        ),
    ]
