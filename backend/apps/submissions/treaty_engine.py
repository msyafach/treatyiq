from decimal import Decimal

TREATY_RATES = {
    'singapore': {
        'technical_services': {'rate': Decimal('0.00'), 'basis': 'Art. 7 P3B Indonesia-Singapura'},
        'royalties': {'rate': Decimal('0.08'), 'basis': 'Art. 12 P3B Indonesia-Singapura'},
        'dividends_general': {'rate': Decimal('0.10'), 'basis': 'Art. 10(2)(b) P3B Indonesia-Singapura'},
        'dividends_qualified': {'rate': Decimal('0.05'), 'basis': 'Art. 10(2)(a) P3B Indonesia-Singapura'},
        'interest': {'rate': Decimal('0.10'), 'basis': 'Art. 11 P3B Indonesia-Singapura'},
    },
    'japan': {
        'technical_services': {'rate': Decimal('0.00'), 'basis': 'Art. 7 P3B Indonesia-Jepang'},
        'royalties': {'rate': Decimal('0.10'), 'basis': 'Art. 12 P3B Indonesia-Jepang'},
        'dividends_general': {'rate': Decimal('0.10'), 'basis': 'Art. 10(2)(b) P3B Indonesia-Jepang'},
        'dividends_qualified': {'rate': Decimal('0.05'), 'basis': 'Art. 10(2)(a) P3B Indonesia-Jepang'},
        'interest': {'rate': Decimal('0.10'), 'basis': 'Art. 11 P3B Indonesia-Jepang'},
    },
    'netherlands': {
        'technical_services': {'rate': Decimal('0.00'), 'basis': 'Art. 7 P3B Indonesia-Belanda'},
        'royalties': {'rate': Decimal('0.10'), 'basis': 'Art. 12 P3B Indonesia-Belanda'},
        'dividends_general': {'rate': Decimal('0.10'), 'basis': 'Art. 10(2)(b) P3B Indonesia-Belanda'},
        'dividends_qualified': {'rate': Decimal('0.05'), 'basis': 'Art. 10(2)(a) P3B Indonesia-Belanda'},
        'interest': {'rate': Decimal('0.10'), 'basis': 'Art. 11 P3B Indonesia-Belanda'},
    },
    'usa': {
        'technical_services': {'rate': Decimal('0.00'), 'basis': 'Art. 7 P3B Indonesia-AS'},
        'royalties': {'rate': Decimal('0.10'), 'basis': 'Art. 12 P3B Indonesia-AS'},
        'dividends_general': {'rate': Decimal('0.15'), 'basis': 'Art. 10(2)(b) P3B Indonesia-AS'},
        'dividends_qualified': {'rate': Decimal('0.10'), 'basis': 'Art. 10(2)(a) P3B Indonesia-AS'},
        'interest': {'rate': Decimal('0.10'), 'basis': 'Art. 11 P3B Indonesia-AS'},
    },
    'australia': {
        'technical_services': {'rate': Decimal('0.00'), 'basis': 'Art. 7 P3B Indonesia-Australia'},
        'royalties': {'rate': Decimal('0.10'), 'basis': 'Art. 12 P3B Indonesia-Australia'},
        'dividends_general': {'rate': Decimal('0.15'), 'basis': 'Art. 10(2)(b) P3B Indonesia-Australia'},
        'dividends_qualified': {'rate': Decimal('0.10'), 'basis': 'Art. 10(2)(a) P3B Indonesia-Australia'},
        'interest': {'rate': Decimal('0.10'), 'basis': 'Art. 11 P3B Indonesia-Australia'},
    },
}

DOMESTIC_RATE = Decimal('0.20')
DOMESTIC_BASIS = 'Tarif domestik PPh Pasal 26'


def calculate_treaty_rate(country, income_type, is_beneficial_owner, passes_ppt,
                           has_economic_substance, has_permanent_establishment=None):
    risk_flagged = False
    risk_flags = []

    if not is_beneficial_owner:
        risk_flagged = True
        risk_flags.append('Vendor bukan beneficial owner dari penghasilan ini')
    if not passes_ppt:
        risk_flagged = True
        risk_flags.append('Gagal Uji Tujuan Utama / Principal Purpose Test (PMK 112 Pasal 18)')
    if not has_economic_substance:
        risk_flagged = True
        risk_flags.append('Vendor tidak memiliki substansi ekonomi nyata di negara domisilinya')
    if income_type == 'technical_services' and has_permanent_establishment:
        risk_flagged = True
        risk_flags.append('Vendor memiliki Bentuk Usaha Tetap (BUT) di Indonesia')

    if risk_flagged or country == 'other':
        return {
            'treaty_rate': DOMESTIC_RATE,
            'legal_basis': DOMESTIC_BASIS,
            'risk_flagged': True,
            'risk_flags': risk_flags,
        }

    treaty = TREATY_RATES.get(country, {}).get(income_type)
    if not treaty:
        return {
            'treaty_rate': DOMESTIC_RATE,
            'legal_basis': DOMESTIC_BASIS,
            'risk_flagged': False,
            'risk_flags': [],
        }

    return {
        'treaty_rate': treaty['rate'],
        'legal_basis': treaty['basis'],
        'risk_flagged': False,
        'risk_flags': [],
    }
