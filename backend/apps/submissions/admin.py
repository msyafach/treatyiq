from django.contrib import admin
from .models import Submission


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('vendor_name', 'country', 'income_type', 'amount_idr', 'treaty_rate', 'status', 'tax_year', 'created_at')
    list_filter = ('status', 'country', 'income_type', 'risk_flagged', 'tax_year')
    search_fields = ('vendor_name', 'foreign_tax_id')
    readonly_fields = ('treaty_rate', 'legal_basis', 'risk_flagged', 'risk_flags', 'tax_savings_idr', 'created_at', 'updated_at')
    ordering = ('-created_at',)
