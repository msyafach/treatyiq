from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.submissions.models import Submission


class Command(BaseCommand):
    help = 'Create test users and submissions for development'

    def handle(self, *args, **options):
        # Create company tax team user
        company_user, created = User.objects.get_or_create(
            email='pajak@bni.co.id',
            defaults={
                'full_name': 'Tim Pajak BNI',
                'role': 'company_tax_team',
                'company_name': 'PT Bank Negara Indonesia (Persero) Tbk',
            }
        )
        if created:
            company_user.set_password('TreatyIQ@2026')
            company_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created company user: {company_user.email}'))
        else:
            self.stdout.write(f'Company user already exists: {company_user.email}')

        # Create vendor user
        vendor_user, created = User.objects.get_or_create(
            email='tax@rsm.sg',
            defaults={
                'full_name': 'RSM Singapore Tax',
                'role': 'vendor',
                'company_name': 'RSM Singapore Pte Ltd',
            }
        )
        if created:
            vendor_user.set_password('TreatyIQ@2026')
            vendor_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created vendor user: {vendor_user.email}'))
        else:
            self.stdout.write(f'Vendor user already exists: {vendor_user.email}')

        # Create test submissions
        test_submissions = [
            {
                'vendor_name': 'RSM Singapore Pte Ltd',
                'foreign_tax_id': 'SG-201234567A',
                'country': 'singapore',
                'income_type': 'technical_services',
                'amount_idr': Decimal('500000000'),
                'is_beneficial_owner': True,
                'passes_ppt': True,
                'has_economic_substance': True,
                'has_permanent_establishment': False,
                'status': 'approved',
            },
            {
                'vendor_name': 'Nomura Securities Japan',
                'foreign_tax_id': 'JP-0012345678901',
                'country': 'japan',
                'income_type': 'royalties',
                'amount_idr': Decimal('1200000000'),
                'is_beneficial_owner': True,
                'passes_ppt': True,
                'has_economic_substance': True,
                'status': 'pending',
            },
            {
                'vendor_name': 'Shell Netherlands BV',
                'foreign_tax_id': 'NL-80098765',
                'country': 'netherlands',
                'income_type': 'dividends_qualified',
                'amount_idr': Decimal('3000000000'),
                'is_beneficial_owner': True,
                'passes_ppt': True,
                'has_economic_substance': True,
                'status': 'approved',
            },
            {
                'vendor_name': 'Conduit Holdings LLC',
                'foreign_tax_id': 'US-55-9876543',
                'country': 'usa',
                'income_type': 'interest',
                'amount_idr': Decimal('750000000'),
                'is_beneficial_owner': False,
                'passes_ppt': True,
                'has_economic_substance': False,
                'status': 'flagged',
            },
            {
                'vendor_name': 'BHP Group Australia',
                'foreign_tax_id': 'AU-987654321',
                'country': 'australia',
                'income_type': 'dividends_general',
                'amount_idr': Decimal('2500000000'),
                'is_beneficial_owner': True,
                'passes_ppt': True,
                'has_economic_substance': True,
                'status': 'rejected',
            },
        ]

        from apps.submissions.treaty_engine import calculate_treaty_rate
        from datetime import date

        for data in test_submissions:
            if Submission.objects.filter(vendor_name=data['vendor_name'], tax_year=2026).exists():
                self.stdout.write(f'Submission already exists: {data["vendor_name"]}')
                continue

            status_val = data.pop('status')
            result = calculate_treaty_rate(
                country=data['country'],
                income_type=data['income_type'],
                is_beneficial_owner=data['is_beneficial_owner'],
                passes_ppt=data['passes_ppt'],
                has_economic_substance=data['has_economic_substance'],
                has_permanent_establishment=data.get('has_permanent_establishment'),
            )

            amount = data['amount_idr']
            domestic_rate = Decimal('0.20')
            treaty_rate = result['treaty_rate']
            tax_savings = max((domestic_rate - treaty_rate) * amount, Decimal('0'))

            sub = Submission.objects.create(
                **data,
                treaty_rate=treaty_rate,
                domestic_rate=domestic_rate,
                legal_basis=result['legal_basis'],
                risk_flagged=result['risk_flagged'],
                risk_flags=result['risk_flags'],
                tax_savings_idr=tax_savings,
                tax_year=2026,
                submitted_by=vendor_user,
                reviewed_by=company_user if status_val in ('approved', 'rejected') else None,
                status=status_val,
            )
            self.stdout.write(self.style.SUCCESS(f'Created submission: {sub}'))

        self.stdout.write(self.style.SUCCESS('\n✅ Test data created successfully!'))
        self.stdout.write('Login credentials:')
        self.stdout.write('  Company: pajak@bni.co.id / TreatyIQ@2026')
        self.stdout.write('  Vendor:  tax@rsm.sg / TreatyIQ@2026')
