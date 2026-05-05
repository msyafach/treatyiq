from django.db import models
from django.conf import settings

DOCUMENT_TYPE_CHOICES = [
    ('dgt1', 'Form DGT-1 (Format PMK 112/2025)'),
    ('cor', 'Certificate of Residence (CoR)'),
    ('service_agreement', 'Service Agreement / Kontrak'),
    ('beneficial_owner', 'Dokumentasi Beneficial Owner'),
    ('economic_substance', 'Bukti Economic Substance'),
]


class Document(models.Model):
    submission = models.ForeignKey(
        'submissions.Submission',
        on_delete=models.CASCADE,
        related_name='documents',
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='documents/%Y/%m/')
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Dokumen'
        verbose_name_plural = 'Dokumen'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.filename} — {self.submission.vendor_name}'
