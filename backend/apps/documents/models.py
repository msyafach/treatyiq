import re
from django.db import models
from django.conf import settings

DOCUMENT_TYPE_CHOICES = [
    ('dgt1', 'Form DGT-1 (Format PMK 112/2025)'),
    ('cor', 'Certificate of Residence (CoR)'),
    ('service_agreement', 'Service Agreement / Kontrak'),
    ('beneficial_owner', 'Dokumentasi Beneficial Owner'),
    ('economic_substance', 'Bukti Economic Substance'),
]


def _slugify(text):
    return re.sub(r'[^\w-]', '-', text.lower().strip()).strip('-') or 'unknown'


def document_upload_path(instance, filename):
    """
    Path: documents/{company_slug}/{submission_id}/{doc_type}/{safe_filename}

    Contoh:
      documents/bank-negara-indonesia/42/dgt1/RSM_DGT1_2026.pdf
    """
    parts = filename.rsplit('.', 1)
    stem = re.sub(r'[^\w.-]', '_', parts[0])[:80]
    ext  = parts[1].lower() if len(parts) > 1 else 'pdf'

    company = ''
    if instance.uploaded_by_id:
        # uploaded_by sudah di-set di serializer sebelum save
        try:
            company = instance.uploaded_by.company_name
        except Exception:
            pass
    company_slug = _slugify(company) if company else f'user-{instance.uploaded_by_id or 0}'

    sub_id   = instance.submission_id or 0
    doc_type = instance.document_type or 'misc'

    return f'documents/{company_slug}/{sub_id}/{doc_type}/{stem}.{ext}'


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
    file = models.FileField(upload_to=document_upload_path)
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Dokumen'
        verbose_name_plural = 'Dokumen'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.filename} — {self.submission.vendor_name}'
