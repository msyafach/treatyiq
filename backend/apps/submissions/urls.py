from django.urls import path
from .views import (
    SubmissionListCreateView,
    SubmissionDetailView,
    ApproveSubmissionView,
    RejectSubmissionView,
    DashboardStatsView,
)

urlpatterns = [
    path('submissions/', SubmissionListCreateView.as_view(), name='submission-list'),
    path('submissions/<int:pk>/', SubmissionDetailView.as_view(), name='submission-detail'),
    path('submissions/<int:pk>/approve/', ApproveSubmissionView.as_view(), name='submission-approve'),
    path('submissions/<int:pk>/reject/', RejectSubmissionView.as_view(), name='submission-reject'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
