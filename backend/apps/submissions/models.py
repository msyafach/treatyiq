from decimal import Decimal
from django.db import models
from django.conf import settings

COUNTRY_CHOICES = [
    ('singapore', 'Singapura'),
    ('japan', 'Jepang'),
    ('netherlands', 'Belanda'),
    ('usa', 'Amerika Serikat'),
    ('australia', 'Australia'),
    ('other', 'Negara Lainnya'),
]

INCOME_TYPE_CHOICES = [
    ('technical_services', 'Jasa Teknis / Management Fee'),
    ('royalties', 'Royalti (IP, merek dagang, paten, lisensi software)'),
    ('dividends_general', 'Dividen — kepemilikan <25%'),
    ('dividends_qualified', 'Dividen — kepemilikan ≥25% (365+ hari, PMK 112 Pasal 20)'),
    ('interest', 'Bunga'),
]

STATUS_CHOICES = [
    ('pending', 'Menunggu'),
    ('approved', 'Disetujui'),
    ('rejected', 'Ditolak'),
    ('flagged', 'Ditandai'),
]


class Submission(models.Model):
    # Step 1: Vendor Identity
    vendor_name = models.CharField(max_length=255)
    foreign_tax_id = models.CharField(max_length=100)
    country = models.CharField(max_length=50, choices=COUNTRY_CHOICES)

    # Step 2: Income
    income_type = models.CharField(max_length=50, choices=INCOME_TYPE_CHOICES)
    amount_idr = models.DecimalField(max_digits=20, decimal_places=2)

    # Step 3: PMK 112 Compliance
    is_beneficial_owner = models.BooleanField()
    passes_ppt = models.BooleanField()
    has_economic_substance = models.BooleanField()
    has_permanent_establishment = models.BooleanField(null=True, blank=True)

    # Calculated by treaty engine
    treaty_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.20'))
    domestic_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.20'))
    legal_basis = models.CharField(max_length=200, blank=True)
    risk_flagged = models.BooleanField(default=False)
    risk_flags = models.JSONField(default=list)
    tax_savings_idr = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0'))

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True)

    # Meta
    tax_year = models.IntegerField()
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='submissions',
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_submissions',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Permohonan'
        verbose_name_plural = 'Permohonan'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.vendor_name} — {self.get_income_type_display()} ({self.tax_year})'
