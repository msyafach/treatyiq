from decimal import Decimal

def _r(rate, basis):
    return {'rate': Decimal(str(rate)), 'basis': basis}

def _country(name_id, div_gen, div_qual, interest, royalty):
    return {
        'technical_services': _r(0,        f'Art. 7 P3B Indonesia-{name_id}'),
        'royalties':          _r(royalty,   f'Art. 12 P3B Indonesia-{name_id}'),
        'dividends_general':  _r(div_gen,   f'Art. 10(2)(b) P3B Indonesia-{name_id}'),
        'dividends_qualified':_r(div_qual,  f'Art. 10(2)(a) P3B Indonesia-{name_id}'),
        'interest':           _r(interest,  f'Art. 11 P3B Indonesia-{name_id}'),
    }

# Rates: (div_general%, div_qualified%, interest%, royalty%)
# "—" on DJP table → 20% domestic applies for that income type
TREATY_RATES = {
    'algeria':        _country('Aljazair',         15,    15,    15,    15),
    'australia':      _country('Australia',        15,    10,    10,    10),
    'austria':        _country('Austria',          15,    10,    10,    20),
    'bangladesh':     _country('Bangladesh',       15,    10,    10,    20),
    'belgium':        _country('Belgia',           15,    15,    10,    20),
    'brunei':         _country('Brunei',           15,    15,    15,    20),
    'bulgaria':       _country('Bulgaria',         15,    15,    10,    20),
    'canada':         _country('Kanada',           15,    15,    15,    20),
    'china':          _country('Tiongkok',         10,    10,    10,    20),
    'croatia':        _country('Kroasia',          10,    10,    10,    20),
    'czech_republic': _country('Republik Ceko',    15,    10,  12.5,    20),
    'denmark':        _country('Denmark',          20,    10,    10,    20),
    'egypt':          _country('Mesir',            15,    15,    15,    20),
    'finland':        _country('Finlandia',        15,    10,    10,    10),
    'france':         _country('Prancis',          15,    10,    15,    10),
    'germany':        _country('Jerman',           15,    10,    10,    10),
    'hong_kong':      _country('Hong Kong',        10,     5,    10,    20),
    'hungary':        _country('Hungaria',         15,    15,    15,    20),
    'india':          _country('India',            10,    10,    10,    20),
    'iran':           _country('Iran',              7,     7,    10,    12),
    'italy':          _country('Italia',           15,    10,    10,    10),
    'japan':          _country('Jepang',           15,    10,    10,    10),
    'jordan':         _country('Yordania',         10,    10,    10,    20),
    'south_korea':    _country('Korea Selatan',    15,    10,    10,    20),
    'north_korea':    _country('Korea Utara',      10,    10,    10,    20),
    'kuwait':         _country('Kuwait',           10,    10,     5,    20),
    'luxembourg':     _country('Luksemburg',       15,    10,    10,  12.5),
    'malaysia':       _country('Malaysia',         10,    10,    10,    20),
    'mexico':         _country('Meksiko',          10,    10,    10,    20),
    'mongolia':       _country('Mongolia',         10,    10,    10,    20),
    'morocco':        _country('Maroko',           10,    10,    10,    20),
    'netherlands':    _country('Belanda',          15,     5,    10,    10),
    'new_zealand':    _country('Selandia Baru',    15,    15,    10,    20),
    'norway':         _country('Norwegia',         15,    15,    10,    10),
    'pakistan':       _country('Pakistan',         15,    10,    15,    20),
    'philippines':    _country('Filipina',         20,    15,    15,    15),
    'poland':         _country('Polandia',         15,    10,    10,    20),
    'portugal':       _country('Portugal',         10,    10,    10,    20),
    'qatar':          _country('Qatar',            10,    10,    10,     5),
    'romania':        _country('Romania',          15,  12.5,  12.5,    15),
    'russia':         _country('Rusia',            15,    15,    15,    20),
    'saudi_arabia':   _country('Arab Saudi',       20,    20,    20,    20),
    'seychelles':     _country('Seychelles',       10,    10,    10,    20),
    'singapore':      _country('Singapura',        15,    10,    10,     8),
    'slovakia':       _country('Slovakia',         10,    10,    10,    10),
    'south_africa':   _country('Afrika Selatan',   15,    10,    10,    20),
    'spain':          _country('Spanyol',          15,    10,    10,    20),
    'sri_lanka':      _country('Sri Lanka',        15,    15,    15,    20),
    'sudan':          _country('Sudan',            10,    10,    15,    20),
    'sweden':         _country('Swedia',           15,    10,    10,    10),
    'switzerland':    _country('Swiss',            15,    10,    10,    20),
    'syria':          _country('Suriah',           10,    10,    10,    20),
    'taiwan':         _country('Taiwan',           10,    10,    10,    20),
    'thailand':       _country('Thailand',         15,    15,    15,    15),
    'tunisia':        _country('Tunisia',          12,    12,    12,    20),
    'turkey':         _country('Turki',            15,    10,    10,    20),
    'uae':            _country('Uni Emirat Arab',  10,    10,     5,     5),
    'ukraine':        _country('Ukraina',          15,    10,    10,    20),
    'uk':             _country('Inggris',          15,    10,    10,    10),
    'usa':            _country('AS',               15,    10,    10,    10),
    'uzbekistan':     _country('Uzbekistan',       10,    10,    10,    20),
    'venezuela':      _country('Venezuela',        15,    10,    10,    20),
    'vietnam':        _country('Vietnam',          15,    15,    15,    20),
}

DOMESTIC_RATE  = Decimal('0.20')
DOMESTIC_BASIS = 'Tarif domestik PPh Pasal 26'


def calculate_treaty_rate(country, income_type, is_beneficial_owner, passes_ppt,
                           has_economic_substance, has_permanent_establishment=None):
    risk_flagged = False
    risk_flags   = []

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
            'risk_flags':   risk_flags,
        }

    treaty = TREATY_RATES.get(country, {}).get(income_type)
    if not treaty:
        return {
            'treaty_rate': DOMESTIC_RATE,
            'legal_basis': DOMESTIC_BASIS,
            'risk_flagged': False,
            'risk_flags':   [],
        }

    return {
        'treaty_rate': treaty['rate'],
        'legal_basis': treaty['basis'],
        'risk_flagged': False,
        'risk_flags':   [],
    }
