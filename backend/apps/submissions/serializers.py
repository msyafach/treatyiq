from decimal import Decimal
from datetime import date
from rest_framework import serializers
from .models import Submission
from .treaty_engine import calculate_treaty_rate


class SubmissionListSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.CharField(source='submitted_by.full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True, default=None)
    country_display = serializers.CharField(source='get_country_display', read_only=True)
    income_type_display = serializers.CharField(source='get_income_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    treaty_rate_pct = serializers.SerializerMethodField()
    domestic_rate_pct = serializers.SerializerMethodField()
    documents_count = serializers.IntegerField(source='documents.count', read_only=True)

    class Meta:
        model = Submission
        fields = (
            'id', 'vendor_name', 'foreign_tax_id', 'country', 'country_display',
            'income_type', 'income_type_display', 'amount_idr',
            'treaty_rate', 'treaty_rate_pct', 'domestic_rate', 'domestic_rate_pct',
            'legal_basis', 'risk_flagged', 'risk_flags',
            'tax_savings_idr', 'status', 'status_display',
            'rejection_reason', 'tax_year',
            'submitted_by', 'submitted_by_name',
            'reviewed_by', 'reviewed_by_name',
            'documents_count',
            'created_at', 'updated_at',
        )

    def get_treaty_rate_pct(self, obj):
        return float(obj.treaty_rate * 100)

    def get_domestic_rate_pct(self, obj):
        return float(obj.domestic_rate * 100)


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = (
            'vendor_name', 'foreign_tax_id', 'country', 'income_type', 'amount_idr',
            'is_beneficial_owner', 'passes_ppt', 'has_economic_substance',
            'has_permanent_establishment',
        )

    def create(self, validated_data):
        result = calculate_treaty_rate(
            country=validated_data['country'],
            income_type=validated_data['income_type'],
            is_beneficial_owner=validated_data['is_beneficial_owner'],
            passes_ppt=validated_data['passes_ppt'],
            has_economic_substance=validated_data['has_economic_substance'],
            has_permanent_establishment=validated_data.get('has_permanent_establishment'),
        )

        amount = validated_data['amount_idr']
        domestic_rate = Decimal('0.20')
        treaty_rate = result['treaty_rate']
        tax_savings = (domestic_rate - treaty_rate) * amount

        status = 'flagged' if result['risk_flagged'] else 'pending'

        submission = Submission.objects.create(
            **validated_data,
            treaty_rate=treaty_rate,
            domestic_rate=domestic_rate,
            legal_basis=result['legal_basis'],
            risk_flagged=result['risk_flagged'],
            risk_flags=result['risk_flags'],
            tax_savings_idr=max(tax_savings, Decimal('0')),
            tax_year=date.today().year,
            submitted_by=self.context['request'].user,
            status=status,
        )
        return submission


class DashboardStatsSerializer(serializers.Serializer):
    total_vendors = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    approved_this_month = serializers.IntegerField()
    total_tax_savings_idr = serializers.DecimalField(max_digits=20, decimal_places=2)
    recent_submissions = SubmissionListSerializer(many=True)
