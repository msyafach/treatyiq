import logging
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer

logger = logging.getLogger(__name__)


class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as exc:
            logger.exception('Document upload failed: %s', exc)
            msg = str(exc)
            if 'credential' in msg.lower() or 'NoCredentialsError' in type(exc).__name__:
                detail = 'Konfigurasi S3 tidak lengkap — periksa AWS credentials di environment production.'
            elif 'NoSuchBucket' in msg or 'bucket' in msg.lower():
                detail = 'S3 bucket tidak ditemukan — pastikan bucket sudah dibuat dan region sesuai.'
            elif 'AccessDenied' in msg or 'forbidden' in msg.lower():
                detail = 'Akses S3 ditolak — periksa IAM policy untuk PutObject permission.'
            else:
                detail = f'Gagal mengunggah dokumen: {msg}'
            return Response({'detail': detail}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def get_queryset(self):
        user = self.request.user
        qs = Document.objects.select_related('submission', 'uploaded_by')
        if user.role == 'vendor':
            qs = qs.filter(submission__submitted_by=user)
        submission_id = self.request.query_params.get('submission')
        if submission_id:
            qs = qs.filter(submission_id=submission_id)
        vendor = self.request.query_params.get('vendor')
        if vendor:
            qs = qs.filter(submission__vendor_name__icontains=vendor)
        sub_status = self.request.query_params.get('status')
        if sub_status:
            qs = qs.filter(submission__status=sub_status)
        return qs


class DocumentDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Document.objects.select_related('submission', 'uploaded_by')
        if user.role == 'vendor':
            qs = qs.filter(submission__submitted_by=user)
        return qs
