from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    vendor_name = serializers.CharField(source='submission.vendor_name', read_only=True)
    income_type_display = serializers.CharField(source='submission.get_income_type_display', read_only=True)
    tax_year = serializers.IntegerField(source='submission.tax_year', read_only=True)
    submission_status = serializers.CharField(source='submission.status', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            'id', 'submission', 'vendor_name', 'income_type_display',
            'uploaded_by', 'uploaded_by_name',
            'document_type', 'document_type_display',
            'file', 'file_url', 'filename', 'file_size',
            'tax_year', 'submission_status',
            'created_at',
        )
        read_only_fields = ('id', 'filename', 'file_size', 'uploaded_by', 'created_at')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def create(self, validated_data):
        file = validated_data.get('file')
        validated_data['filename'] = file.name if file else ''
        validated_data['file_size'] = file.size if file else 0
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)
