from decimal import Decimal
from datetime import date
from django.db.models import Sum, Q
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Submission
from .serializers import SubmissionListSerializer, SubmissionCreateSerializer, DashboardStatsSerializer


class IsCompanyTaxTeam(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'company_tax_team'


class SubmissionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SubmissionCreateSerializer
        return SubmissionListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.select_related('submitted_by', 'reviewed_by')
        if user.role == 'vendor':
            qs = qs.filter(submitted_by=user)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(vendor_name__icontains=search) | Q(foreign_tax_id__icontains=search))
        return qs

    def create(self, request, *args, **kwargs):
        serializer = SubmissionCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()
        return Response(SubmissionListSerializer(submission).data, status=status.HTTP_201_CREATED)


class SubmissionDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmissionListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.select_related('submitted_by', 'reviewed_by').prefetch_related('documents')
        if user.role == 'vendor':
            qs = qs.filter(submitted_by=user)
        return qs


class ApproveSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'company_tax_team':
            return Response({'detail': 'Akses ditolak.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            submission = Submission.objects.get(pk=pk)
        except Submission.DoesNotExist:
            return Response({'detail': 'Tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)
        submission.status = 'approved'
        submission.reviewed_by = request.user
        submission.save()
        return Response(SubmissionListSerializer(submission).data)


class RejectSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'company_tax_team':
            return Response({'detail': 'Akses ditolak.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            submission = Submission.objects.get(pk=pk)
        except Submission.DoesNotExist:
            return Response({'detail': 'Tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)
        reason = request.data.get('rejection_reason', '')
        submission.status = 'rejected'
        submission.rejection_reason = reason
        submission.reviewed_by = request.user
        submission.save()
        return Response(SubmissionListSerializer(submission).data)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        base_qs = Submission.objects.all()
        if user.role == 'vendor':
            base_qs = base_qs.filter(submitted_by=user)

        today = date.today()
        total_vendors = Submission.objects.values('vendor_name').distinct().count() if user.role == 'company_tax_team' else 1
        pending_approvals = base_qs.filter(status__in=['pending', 'flagged']).count()
        approved_this_month = base_qs.filter(
            status='approved',
            updated_at__year=today.year,
            updated_at__month=today.month,
        ).count()
        total_savings = base_qs.filter(status='approved').aggregate(
            total=Sum('tax_savings_idr')
        )['total'] or Decimal('0')
        recent = base_qs.select_related('submitted_by', 'reviewed_by')[:10]

        data = {
            'total_vendors': total_vendors,
            'pending_approvals': pending_approvals,
            'approved_this_month': approved_this_month,
            'total_tax_savings_idr': total_savings,
            'recent_submissions': recent,
        }
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)
