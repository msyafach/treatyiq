import logging
from django.conf import settings
from django.http import HttpResponseRedirect
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
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


class DocumentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            user = request.user
            qs = Document.objects.select_related('submission', 'uploaded_by')
            if user.role == 'vendor':
                qs = qs.filter(submission__submitted_by=user)
            doc = qs.get(pk=pk)
        except Document.DoesNotExist:
            return Response({'detail': 'Tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)

        if not doc.file:
            return Response({'detail': 'Berkas tidak tersedia.'}, status=status.HTTP_404_NOT_FOUND)

        filename = doc.filename or doc.file.name.split('/')[-1]

        if getattr(settings, 'USE_S3', False):
            import boto3
            from botocore.config import Config
            s3 = boto3.client(
                's3',
                region_name=settings.AWS_S3_REGION_NAME,
                endpoint_url=getattr(settings, 'AWS_S3_ENDPOINT_URL', None),
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                config=Config(signature_version='s3v4'),
            )
            url = s3.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                    'Key': doc.file.name,
                    'ResponseContentDisposition': f'attachment; filename="{filename}"',
                },
                ExpiresIn=300,
            )
            return HttpResponseRedirect(url)

        # Local: stream file with attachment header
        from django.http import FileResponse
        response = FileResponse(doc.file.open('rb'), as_attachment=True, filename=filename)
        return response
