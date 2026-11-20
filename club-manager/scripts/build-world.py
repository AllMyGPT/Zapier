#!/usr/bin/env python3
"""Build public/world/leagues.json: the top flights of the rest of Europe and of South America.

Input (argv[1]): Transfermarkt export with blocks
    @<TM league code>|<league name>
    #<tm club id>|<club>|<stadium>|<capacity>|<city>|<colour 1>|<colour 2>
    Name|POS|YY(born)|Nationality (Spanish)|value_M€|YY(contract end)
The big five live in src/data/leagues/*.ts; these leagues are loaded at new-game time.
Ratings: players already in the game keep theirs (nudged toward their value); the rest are
estimated from value and age with the fit used for the big five. Club reputation comes from
squad value, fitted on the big-five clubs.
"""
import json, math, os, re, sys, glob, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tm_common import NAT

SRC, OUT = sys.argv[1], 'public/world/leagues.json'
SEASON = 2026
EU, SA = 'Europa', 'Sudamérica'
# TM code -> (league id, nationality code, country, region, display name or None to keep TM's)
LEAGUES = {
  'PO1': ('por', 'POR', 'Portugal', EU, 'Liga Portugal'), 'TR1': ('tur', 'TUR', 'Turquía', EU, 'Süper Lig'),
  'NL1': ('ned', 'NED', 'Países Bajos', EU, 'Eredivisie'), 'BE1': ('bel', 'BEL', 'Bélgica', EU, 'Jupiler Pro League'),
  'RU1': ('rus', 'RUS', 'Rusia', EU, 'Premier Liga rusa'), 'GR1': ('gre', 'GRE', 'Grecia', EU, 'Super League griega'),
  'UKR1': ('ukr', 'UKR', 'Ucrania', EU, 'Premier Liga de Ucrania'), 'TS1': ('cze', 'CZE', 'República Checa', EU, 'Chance Liga'),
  'A1': ('aut', 'AUT', 'Austria', EU, 'Bundesliga austriaca'), 'PL1': ('pol', 'POL', 'Polonia', EU, 'Ekstraklasa'),
  'SC1': ('sco', 'SCO', 'Escocia', EU, 'Scottish Premiership'), 'NO1': ('nor', 'NOR', 'Noruega', EU, 'Eliteserien'),
  'C1': ('sui', 'SUI', 'Suiza', EU, 'Super League suiza'), 'DK1': ('den', 'DEN', 'Dinamarca', EU, 'Superliga danesa'),
  'SE1': ('swe', 'SWE', 'Suecia', EU, 'Allsvenskan'), 'SER1': ('srb', 'SRB', 'Serbia', EU, 'Superliga de Serbia'),
  'RO1': ('rou', 'ROU', 'Rumania', EU, 'SuperLiga rumana'), 'KR1': ('cro', 'CRO', 'Croacia', EU, 'HNL'),
  'BU1': ('bul', 'BUL', 'Bulgaria', EU, 'Primera Liga búlgara'), 'ISR1': ('isr', 'ISR', 'Israel', EU, "Ligat ha'Al"),
  'ZYP1': ('cyp', 'CYP', 'Chipre', EU, 'Liga de Chipre'), 'UNG1': ('hun', 'HUN', 'Hungría', EU, 'NB I'),
  'AZ1': ('aze', 'AZE', 'Azerbaiyán', EU, 'Premyer Liqa'), 'SLO1': ('svk', 'SVK', 'Eslovaquia', EU, 'Niké Liga'),
  'KAS1': ('kaz', 'KAZ', 'Kazajistán', EU, 'Premier Liga de Kazajistán'), 'SL1': ('svn', 'SVN', 'Eslovenia', EU, 'Prva Liga'),
  'WER1': ('blr', 'BLR', 'Bielorrusia', EU, 'Vysheyshaya Liga'), 'ARM1': ('arm', 'ARM', 'Armenia', EU, 'Premier League armenia'),
  'BOS1': ('bih', 'BIH', 'Bosnia y Herzegovina', EU, 'Premijer Liga BiH'), 'LET1': ('lva', 'LVA', 'Letonia', EU, 'Virslīga'),
  'LI1': ('ltu', 'LTU', 'Lituania', EU, 'A Lyga'), 'MT1N': ('mlt', 'MLT', 'Malta', EU, 'Premier League de Malta'),
  'ALB1': ('alb', 'ALB', 'Albania', EU, 'Kategoria Superiore'), 'GE1N': ('geo', 'GEO', 'Georgia', EU, 'Erovnuli Liga'),
  'FI1': ('fin', 'FIN', 'Finlandia', EU, 'Veikkausliiga'), 'KO1': ('kvx', 'KVX', 'Kosovo', EU, 'Superliga de Kosovo'),
  'IR1': ('irl', 'IRL', 'Irlanda', EU, 'Premier Division irlandesa'), 'MAZ1': ('mkd', 'MKD', 'Macedonia del Norte', EU, 'Prva Liga macedonia'),
  'EST1': ('est', 'EST', 'Estonia', EU, 'Premium Liiga'), 'IS1': ('isl', 'ISL', 'Islandia', EU, 'Besta deild'),
  'MNE1': ('mne', 'MNE', 'Montenegro', EU, 'Prva CFL'), 'LUX1': ('lux', 'LUX', 'Luxemburgo', EU, 'BGL Ligue'),
  'NIR1': ('nir', 'NIR', 'Irlanda del Norte', EU, 'NIFL Premiership'), 'MO1N': ('mda', 'MDA', 'Moldavia', EU, 'Super Liga de Moldavia'),
  'AND1': ('and', 'AND', 'Andorra', EU, 'Primera Divisió'), 'WAL1': ('wal', 'WAL', 'Gales', EU, 'Cymru Premier'),
  'FARO': ('fro', 'FRO', 'Islas Feroe', EU, 'Betri deildin'), 'GI1': ('gib', 'GIB', 'Gibraltar', EU, 'Gibraltar Football League'),
  'SMR1': ('smr', 'SMR', 'San Marino', EU, 'Campionato Sammarinese'),
  'BRA1': ('bra', 'BRA', 'Brasil', SA, 'Brasileirão Série A'), 'ARG1': ('arg', 'ARG', 'Argentina', SA, 'Liga Profesional Argentina'),
  'COL1': ('col', 'COL', 'Colombia', SA, 'Liga BetPlay'), 'EC1N': ('ecu', 'ECU', 'Ecuador', SA, 'LigaPro Serie A'),
  'CLPD': ('chi', 'CHI', 'Chile', SA, 'Liga de Primera'), 'URU1': ('uru', 'URU', 'Uruguay', SA, 'Liga AUF Uruguaya'),
  'PR1A': ('par', 'PAR', 'Paraguay', SA, 'Primera División de Paraguay'), 'TDeA': ('per', 'PER', 'Perú', SA, 'Liga 1'),
  'VZ1A': ('ven', 'VEN', 'Venezuela', SA, 'Liga FUTVE'), 'BO1A': ('bol', 'BOL', 'Bolivia', SA, 'División Profesional'),
}
# places in the two European cups / the South American cup (the big five drop to 21+10 when these exist)
EURO = {'por': [2, 1], 'ned': [2, 1], 'bel': [1, 1], 'tur': [1, 1], 'cze': [1, 1], 'aut': [1, 1], 'sco': [1, 1], 'gre': [1, 1], 'sui': [1, 1],
        'den': [0, 1], 'nor': [0, 1], 'swe': [0, 1], 'pol': [0, 1], 'cro': [0, 1], 'srb': [0, 1], 'ukr': [0, 1], 'isr': [0, 1], 'rou': [0, 1],
        'hun': [0, 1], 'cyp': [0, 1], 'bul': [0, 1], 'svk': [0, 1],
        'bra': [7, 0], 'arg': [7, 0], 'col': [3, 0], 'ecu': [3, 0], 'chi': [3, 0], 'uru': [3, 0], 'par': [2, 0], 'per': [2, 0], 'ven': [1, 0], 'bol': [1, 0]}
CUP = {'por': 'Taça de Portugal', 'ned': 'Copa de los Países Bajos', 'tur': 'Copa de Turquía', 'bel': 'Copa de Bélgica', 'sco': 'Copa de Escocia',
       'bra': 'Copa de Brasil', 'arg': 'Copa Argentina'}

def yy(s, default):
    s = s.strip()
    if not s.isdigit(): return default
    n = int(s); return (2000 + n) if n <= 40 else (1900 + n)

# ---- big five: player ratings and club reputation vs squad value
old, big = {}, []
for f in glob.glob('src/data/leagues/*.ts'):
    txt = open(f, encoding='utf-8').read()
    for m in re.finditer(r'^([^|\n`]+)\|(GK|CB|LB|RB|DM|CM|AM|LW|RW|ST)\|(\d{4})\|([A-Z]{3})\|(\d+)\|(\d+)', txt, re.M):
        old[m.group(1).strip()] = (int(m.group(5)), int(m.group(6)))
    for m in re.finditer(r'reputation: (\d+), budget: [\d.]+,\s*players: `(.*?)`', txt, re.S):
        tot = sum(float(l.split('|')[6]) for l in m.group(2).split('\n') if len(l.split('|')) > 6 and l.split('|')[6])
        if tot > 0: big.append((math.log(tot), int(m.group(1))))
n = len(big); mx = sum(x for x, _ in big) / n; my = sum(y for _, y in big) / n
rb = sum((x - mx) * (y - my) for x, y in big) / sum((x - mx) ** 2 for x, _ in big); ra = my - rb * mx
print(f'reputation = {ra:.1f} + {rb:.2f}*ln(squad M€) (fit on {n} clubs)', file=sys.stderr)
A, B, C = 41.4, 3.9, 0.92   # ovr ~ value and age, average of the per-league fits of the big five

def rate(p):
    ag = SEASON - p['born']
    e = A + B * math.log(max(p['mv'], 0.02)) + C * min(ag, 32)
    floor = 62 + 4 * math.log(max(p['mv'], 0.02))
    if p['name'] in old:
        o0, pot0 = old[p['name']]
        o = round(0.6 * o0 + 0.4 * e)
        if ag <= 23: o = max(o, round(floor))
        pot = max(o, pot0 + (o - o0))
    else:
        o = round(max(e, floor) if ag <= 23 else e)
        pot = o + (max(0, 24 - ag) * 2 + (3 if ag <= 21 else 0))
    o = max(40, min(93, o)); pot = max(o, min(95, pot))
    return o, pot

STOP = {'FC', 'CF', 'SC', 'AC', 'CD', 'SL', 'SK', 'FK', 'NK', 'AS', 'US', 'SS', 'SSC', 'KV', 'KRC', 'RSC', 'AFC', 'BK', 'IF', 'GD', 'CA', 'CR', 'SE', 'EC', 'AA',
        'SV', 'RB', 'OGC', 'AJ', 'RC', 'UD', 'SD', 'CS', 'PFC', 'HNK', 'GNK', 'KS', 'MKS', 'GKS', 'CSD', 'CSKA', 'PAOK', 'AEK', 'TSV', 'BSC', 'JK', 'IFK', 'FF', 'IK', 'GIF', 'SFC',
        'CLUB', 'CLUBE', 'CD.', 'DE', 'DA', 'DO', 'DEL', 'LA', 'LE', 'THE', 'Y', 'E', '1.', 'AFK', 'MFK', 'ŠK', 'FC.', 'ATLÉTICO', 'ATLETICO', 'DEPORTIVO', 'SPORTING', 'REAL', 'CLUB'}
KEEP = {'CSKA', 'PAOK', 'AEK', 'AIK'}
def ascii_(s): return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
def short_of(name, used):
    words = [w for w in re.split(r'[\s\-/.]+', ascii_(name)) if w]
    keep = [w for w in words if w.upper() in KEEP]
    core = [w for w in words if w.upper() not in STOP and not w.isdigit()] or words
    cands = [keep[0].upper()[:3]] if keep else []
    w0 = re.sub(r'[^A-Za-z]', '', core[0]).upper()
    cands += [w0[:3]]
    if len(core) > 1: cands += [(w0[:2] + re.sub(r'[^A-Za-z]', '', core[1]).upper()[:1])]
    cands += [w0[:1] + w0[2:4], w0[:2] + w0[3:4]]
    for c in cands:
        if len(c) == 3 and c not in used: used.add(c); return c
    i = 0
    while True:
        c = w0[:2] + str(i); i += 1
        if c not in used: used.add(c); return c

# ---- parse export
blocks, lg, club = {}, None, None
for line in open(SRC, encoding='utf-8'):
    line = line.rstrip('\n')
    if not line.strip(): continue
    if line.startswith('@'):
        code = line[1:].split('|')[0]; lg = blocks.setdefault(code, []); club = None; continue
    if line.startswith('#'):
        tid, name, stadium, cap, city, c1, c2 = (line[1:].split('|') + [''] * 7)[:7]
        club = dict(tid=tid, name=name.strip(), stadium=stadium.strip(), cap=int(cap or 0), city=city.strip(), colors=[c1, c2], players=[])
        lg.append(club); continue
    parts = line.split('|')
    if len(parts) < 6 or club is None: continue
    name, pos, by, nat, mv, ct = parts[:6]
    if pos not in ('GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'): continue
    try: mv = float(mv)
    except ValueError: mv = 0.0
    club['players'].append(dict(name=name.strip(), pos=pos, born=yy(by, SEASON - 25), nat=NAT.get(nat.strip(), ''), rawnat=nat.strip(), mv=mv, ct=yy(ct, SEASON + 1)))

unknown = {}
def colour(c, fallback):
    c = (c or '').strip()
    if re.fullmatch(r'#[0-9A-Fa-f]{6}', c): return c.upper()
    if re.fullmatch(r'#[0-9A-Fa-f]{3}', c): return ('#' + ''.join(ch * 2 for ch in c[1:])).upper()
    return fallback

out = []
for code, (lid, nat, country, region, lname) in LEAGUES.items():
    clubs = blocks.get(code)
    if not clubs: print('missing league', code, file=sys.stderr); continue
    used, rclubs, total = set(), [], 0.0
    for c in clubs:
        if len(c['players']) < 14: print('  thin squad', code, c['name'], len(c['players']), file=sys.stderr)
        tot = sum(p['mv'] for p in c['players']); total += tot
        rep = round(max(35, min(88, ra + rb * math.log(max(tot, 0.3)))))
        lines = []
        for p in c['players']:
            if not p['nat'] and p['rawnat']: unknown[p['rawnat']] = unknown.get(p['rawnat'], 0) + 1
            o, pot = rate(p)
            lines.append(f"{p['name']}|{p['pos']}|{p['born']}|{p['nat'] or nat}|{o}|{pot}|{p['mv']:g}|{p['ct']}")
        rclubs.append(dict(id=f"{lid}_{c['tid']}", name=c['name'], short=short_of(c['name'], used), city=c['city'] or c['name'], stadium=c['stadium'] or f"Estadio de {c['name']}",
                           capacity=c['cap'] or 5000, colors=[colour(c['colors'][0], '#3A4A6B'), colour(c['colors'][1], '#FFFFFF')], reputation=rep,
                           budget=round(max(0.3, tot * 0.1), 1), players='\n'.join(lines)))
    L = dict(id=lid, name=lname, country=country, nat=nat, tier2Name='', clubs=rclubs, tier2=[], region=region,
             continent='sa' if region == SA else 'eu', euro=EURO.get(lid, [0, 0]), tv=max(15_000, round(190 * total * 20 / max(1, len(rclubs)) / 1000) * 1000),
             cup=CUP.get(lid))
    if L['cup'] is None: del L['cup']
    out.append(L)
    print(f"{code} {lid}: {len(rclubs)} clubs, {sum(len(c['players'].splitlines()) for c in rclubs)} players, squad value {total:.0f} M€, tv {L['tv']}, rep {min(c['reputation'] for c in rclubs)}-{max(c['reputation'] for c in rclubs)}", file=sys.stderr)

if unknown: print('unknown nationalities:', unknown, file=sys.stderr)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB;', sum(len(L['clubs']) for L in out), 'clubs', file=sys.stderr)
