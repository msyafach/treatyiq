from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('filename', 'document_type', 'submission', 'uploaded_by', 'file_size', 'created_at')
    list_filter = ('document_type', 'created_at')
    search_fields = ('filename', 'submission__vendor_name')
    readonly_fields = ('created_at',)
