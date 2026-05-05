import re
from datetime import date
from django.db import models
from django.conf import settings

DOCUMENT_TYPE_CHOICES = [
    ('dgt1', 'Form DGT-1 (Format PMK 112/2025)'),
    ('cor', 'Certificate of Residence (CoR)'),
    ('service_agreement', 'Service Agreement / Kontrak'),
    ('beneficial_owner', 'Dokumentasi Beneficial Owner'),
    ('economic_substance', 'Bukti Economic Substance'),
]

DOC_TYPE_LABEL = {
    'dgt1':               'DGT1',
    'cor':                'CoR',
    'service_agreement':  'ServiceAgreement',
    'beneficial_owner':   'BeneficialOwner',
    'economic_substance': 'EconomicSubstance',
}


def _slugify(text):
    return re.sub(r'[^\w-]', '-', text.lower().strip()).strip('-') or 'unknown'


def _formatted_filename(instance, ext):
    """
    Format: {TipeDoc}_{TIQ-ID}_{YYYYMMDD}.{ext}
    Contoh: DGT1_TIQ00042_20260105.pdf
    """
    doc_label = DOC_TYPE_LABEL.get(instance.document_type, instance.document_type or 'Doc')
    sub_id    = instance.submission_id or 0
    date_str  = date.today().strftime('%Y%m%d')
    return f'{doc_label}_TIQ{sub_id:05d}_{date_str}.{ext}'


def document_upload_path(instance, filename):
    """
    Path: documents/{company_slug}/{submission_id}/{doc_type}/{formatted_name}
    Contoh: documents/rsm-singapore/42/dgt1/DGT1_TIQ00042_20260105.pdf
    """
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'pdf'

    company = ''
    if instance.uploaded_by_id:
        try:
            company = instance.uploaded_by.company_name
        except Exception:
            pass
    company_slug = _slugify(company) if company else f'user-{instance.uploaded_by_id or 0}'

    sub_id       = instance.submission_id or 0
    doc_type     = instance.document_type or 'misc'
    fname        = _formatted_filename(instance, ext)

    return f'documents/{company_slug}/{sub_id}/{doc_type}/{fname}'


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
