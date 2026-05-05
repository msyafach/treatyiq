from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer


class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer

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
