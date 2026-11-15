#!/usr/bin/env python3
"""Rebuild the top-flight squads of eng/ger/ita/fra from a Transfermarkt export.

Input (argv[1]): blocks
    @<league>
    #<tm club id>|<tm club name>
    Name|POS|YY(born)|Nationality (Spanish name)|value_M€|YY(contract end)
Clubs are matched to game clubs through TM_IDS. Top-flight clubs missing from the
export are relegated to tier2; tier2 clubs present in it are promoted with their
real squad; brand-new clubs take their metadata from NEW.
Ratings follow scripts/build-laliga.py: known players keep their rating nudged
toward what their value suggests (fit per league), new ones are estimated.
"""
import json, math, re, subprocess, sys, glob

SRC = sys.argv[1]
SEASON = 2026

TM_IDS = {
  'eng': {'281': 'e_mci', '11': 'e_ars', '631': 'e_che', '31': 'e_liv', '985': 'e_mun', '148': 'e_tot', '762': 'e_new', '1237': 'e_bha',
          '1148': 'e_bre', '405': 'e_avl', '989': 'e_bou', '873': 'e_cry', '703': 'e_nfo', '289': 'e_sun', '399': 'e_lee', '29': 'e_eve',
          '931': 'e_ful', '677': 'e_ips', '990': 'e_cov', '3008': 'e_hul'},
  'ger': {'27': 'g_fcb', '16': 'g_bvb', '15': 'g_b04', '23826': 'g_rbl', '79': 'g_vfb', '24': 'g_sge', '533': 'g_tsg', '60': 'g_scf',
          '167': 'g_fca', '39': 'g_m05', '3': 'g_koe', '41': 'g_hsv', '18': 'g_bmg', '86': 'g_svw', '89': 'g_fcu', '33': 'g_s04',
          '64': 'g_sve', '127': 'g_scp'},
  'ita': {'46': 'i_int', '506': 'i_juv', '1047': 'i_com', '5': 'i_mil', '12': 'i_rom', '800': 'i_ata', '6195': 'i_nap', '430': 'i_fio',
          '398': 'i_laz', '1025': 'i_bol', '6574': 'i_sas', '416': 'i_tor', '252': 'i_gen', '410': 'i_udi', '130': 'i_par', '1390': 'i_cag',
          '607': 'i_ven', '8970': 'i_fro', '2919': 'i_mon', '1005': 'i_lec'},
  'fra': {'583': 'f_psg', '162': 'f_asm', '667': 'f_rcsa', '1041': 'f_ol', '273': 'f_srfc', '1082': 'f_losc', '826': 'f_rcl', '10004': 'f_pfc',
          '244': 'f_om', '417': 'f_nice', '415': 'f_tfc', '1158': 'f_fcl', '290': 'f_aja', '3911': 'f_brest', '1420': 'f_sco', '738': 'f_hac',
          '1095': 'f_estac', '1164': 'f_lmfc'},
}
# clubs that were not in the game at all
NEW = {
  'e_hul': dict(name='Hull City', short='HUL', city='Hull', stadium='MKM Stadium', capacity=25586, colors=['#F5A12D', '#000000'], reputation=66),
  'g_sve': dict(name='SV 07 Elversberg', short='SVE', city='Spiesen-Elversberg', stadium='Ursapharm-Arena an der Kaiserlinde', capacity=10000, colors=['#000000', '#FFFFFF'], reputation=60),
  'g_scp': dict(name='SC Paderborn 07', short='SCP', city='Paderborn', stadium='Home Deluxe Arena', capacity=15000, colors=['#005CA9', '#000000'], reputation=62),
  'f_lmfc': dict(name='Le Mans FC', short='LMF', city='Le Mans', stadium='MMArena', capacity=25064, colors=['#E30613', '#FFD100'], reputation=60),
}
PROMOTED_BUDGET = {'eng': 30, 'ger': 10, 'ita': 10, 'fra': 6}

NAT = {'España': 'ESP', 'Francia': 'FRA', 'Alemania': 'GER', 'Italia': 'ITA', 'Inglaterra': 'ENG', 'Portugal': 'POR', 'Países Bajos': 'NED', 'Bélgica': 'BEL',
  'Brasil': 'BRA', 'Argentina': 'ARG', 'Uruguay': 'URU', 'Croacia': 'CRO', 'Colombia': 'COL', 'Marruecos': 'MAR', 'Senegal': 'SEN', 'Noruega': 'NOR',
  'Dinamarca': 'DEN', 'Suiza': 'SUI', 'Estados Unidos': 'USA', 'Japón': 'JPN', 'Polonia': 'POL', 'Austria': 'AUT', 'Turquía': 'TUR', 'Serbia': 'SRB',
  'Ucrania': 'UKR', 'Escocia': 'SCO', 'Gales': 'WAL', 'Nigeria': 'NGA', 'Ghana': 'GHA', 'Costa de Marfil': 'CIV', 'Egipto': 'EGY', 'Argelia': 'ALG',
  'Camerún': 'CMR', 'México': 'MEX', 'Ecuador': 'ECU', 'Chile': 'CHI', 'Corea del Sur': 'KOR', 'Suecia': 'SWE', 'República Checa': 'CZE', 'Georgia': 'GEO',
  'Rumania': 'ROU', 'Guinea': 'GUI', 'Venezuela': 'VEN', 'Paraguay': 'PAR', 'Perú': 'PER', 'Eslovenia': 'SVN', 'Eslovaquia': 'SVK', 'Grecia': 'GRE',
  'Hungría': 'HUN', 'Mali': 'MLI', 'Malí': 'MLI', 'Túnez': 'TUN', 'Canadá': 'CAN', 'Irlanda': 'IRL', 'Bosnia-Herzegovina': 'BIH', 'Bosnia y Herzegovina': 'BIH',
  'Montenegro': 'MNE', 'Albania': 'ALB', 'Kosovo': 'KVX', 'Islandia': 'ISL', 'Finlandia': 'FIN', 'Rusia': 'RUS', 'Israel': 'ISR', 'Gabón': 'GAB',
  'Guinea Ecuatorial': 'EQG', 'Cabo Verde': 'CPV', 'Angola': 'ANG', 'RD del Congo': 'COD', 'Burkina Faso': 'BFA', 'Níger': 'NIG', 'Gambia': 'GAM',
  'Togo': 'TOG', 'Benín': 'BEN', 'Uzbekistán': 'UZB', 'Australia': 'AUS', 'Jamaica': 'JAM', 'Honduras': 'HON', 'Costa Rica': 'CRC', 'Panamá': 'PAN',
  'Bolivia': 'BOL', 'Armenia': 'ARM', 'Macedonia del Norte': 'MKD', 'Bulgaria': 'BUL', 'República Dominicana': 'DOM', 'Mozambique': 'MOZ',
  'Sudáfrica': 'RSA', 'Zambia': 'ZAM', 'Guinea-Bissau': 'GNB', 'Guinea-Bisáu': 'GNB', 'Lituania': 'LTU', 'Letonia': 'LVA', 'Luxemburgo': 'LUX',
  'Chipre': 'CYP', 'Irán': 'IRN', 'Haití': 'HAI', 'Curazao': 'CUW', 'Surinam': 'SUR', 'Estonia': 'EST', 'Irlanda del Norte': 'NIR',
  'República Centroafricana': 'CTA', 'Mauritania': 'MTN', 'Martinica': 'FRA', 'Guadalupe': 'FRA', 'Indonesia': 'IDN', 'Comoras': 'COM', 'Congo': 'CGO',
  'Tanzania': 'TAN', 'Tailandia': 'THA', 'Sierra Leona': 'SLE', 'Nueva Zelanda': 'NZL', 'Jordania': 'JOR', 'Filipinas': 'PHI', 'China': 'CHN',
  'Burundi': 'BDI', 'Arabia Saudita': 'KSA', 'Guayana Francesa': 'FRA'}

def yy(s, default):
    s = s.strip()
    if not s.isdigit(): return default
    n = int(s); return (2000 + n) if n <= 40 else (1900 + n)

def load(lg):
    js = open(f'src/data/leagues/{lg}.ts', encoding='utf-8').read()
    js = js.replace("import type { RawLeague } from '../types';", '').replace('export const LEAGUE: RawLeague =', 'module.exports =')
    return json.loads(subprocess.check_output(['node', '-e', 'const m=new module.constructor();m._compile(require("fs").readFileSync(0,"utf8"),"x.js");process.stdout.write(JSON.stringify(m.exports))'], input=js.encode()))

# ---- existing ratings across all leagues
old = {}
for f in glob.glob('src/data/leagues/*.ts'):
    for m in re.finditer(r'^([^|\n`]+)\|(GK|CB|LB|RB|DM|CM|AM|LW|RW|ST)\|(\d{4})\|([A-Z]{3})\|(\d+)\|(\d+)', open(f, encoding='utf-8').read(), re.M):
        old[m.group(1).strip()] = (int(m.group(5)), int(m.group(6)))

# ---- parse export
data, lg, cur = {}, None, None
for line in open(SRC, encoding='utf-8'):
    line = line.rstrip('\n')
    if not line.strip(): continue
    if line.startswith('@'): lg = line[1:].strip(); data[lg] = {}; continue
    if line.startswith('#'):
        tid = line[1:].split('|')[0]; cur = TM_IDS[lg][tid]; data[lg][cur] = []; continue
    name, pos, by, nat, mv, ct = line.split('|')
    try: mv = float(mv)
    except ValueError: mv = 0.0
    data[lg][cur].append(dict(name=name.strip(), pos=pos, born=yy(by, SEASON - 25), nat=NAT.get(nat.strip(), ''), mv=mv, ct=yy(ct, SEASON + 1)))

def solve(X, Y):
    A = [[sum(x[i] * x[j] for x in X) for j in range(3)] for i in range(3)]
    b = [sum(x[i] * y for x, y in zip(X, Y)) for i in range(3)]
    for i in range(3):
        piv = A[i][i]
        for j in range(i, 3): A[i][j] /= piv
        b[i] /= piv
        for k in range(3):
            if k != i:
                f = A[k][i]
                for j in range(i, 3): A[k][j] -= f * A[i][j]
                b[k] -= f * b[i]
    return b

def q(v): return json.dumps(v, ensure_ascii=False)

def ser_lower(c):
    keys = ['id', 'name', 'short', 'city', 'stadium', 'capacity', 'colors', 'reputation'] + [k for k in c if k not in ('id', 'name', 'short', 'city', 'stadium', 'capacity', 'colors', 'reputation')]
    return '    { ' + ', '.join(f'{k}: {q(c[k])}' for k in keys if k in c) + ' },'

def ser_club(c):
    head = ['id', 'name', 'short', 'city', 'stadium', 'capacity']
    rest = [k for k in c if k not in head + ['players']]
    return ('    {\n      ' + ', '.join(f'{k}: {q(c[k])}' for k in head) + ',\n      ' + ', '.join(f'{k}: {q(c[k])}' for k in rest) +
            ',\n      players: `' + c['players'] + '`,\n    },')

for lg, clubs in data.items():
    L = load(lg)
    X, Y = [], []
    for ps in clubs.values():
        for p in ps:
            if p['name'] in old and p['mv'] > 0:
                X.append((1.0, math.log(p['mv']), SEASON - p['born'])); Y.append(old[p['name']][0])
    a, bv, c = solve(X, Y)
    print(f'{lg}: fit on {len(X)}: ovr = {a:.1f} + {bv:.2f}*ln(M€) + {c:.2f}*age', file=sys.stderr)

    def rate(p):
        ag = SEASON - p['born']
        e = a + bv * math.log(max(p['mv'], 0.1)) + c * ag
        floor = 62 + 4 * math.log(max(p['mv'], 0.1))
        if p['name'] in old:
            o0, pot0 = old[p['name']]
            o = round(0.6 * o0 + 0.4 * e)
            if ag <= 23: o = max(o, round(floor))
            pot = max(o, pot0 + (o - o0))
        else:
            o = round(max(e, floor) if ag <= 23 else e)
            pot = o + (max(0, 24 - ag) * 2 + (3 if ag <= 21 else 0))
        o = max(52, min(93, o)); pot = max(o, min(95, pot))
        return o, pot

    def block(ps):
        out = []
        for p in ps:
            o, pot = rate(p)
            out.append(f"{p['name']}|{p['pos']}|{p['born']}|{p['nat'] or L['nat']}|{o}|{pot}|{p['mv']:g}|{p['ct']}")
        return '\n'.join(out)

    top = {cl['id']: cl for cl in L['clubs']}
    low = {cl['id']: cl for cl in L['tier2']}
    new_top, relegated, promoted = [], [], []
    # keep the existing order for clubs that stay, then promoted ones
    for cid, cl in top.items():
        if cid in clubs:
            cl['players'] = block(clubs[cid]); new_top.append(cl)
        else:
            relegated.append(cid)
            meta = {k: cl[k] for k in ('id', 'name', 'short', 'city', 'stadium', 'capacity', 'colors')}
            meta['reputation'] = max(60, cl['reputation'] - 4)
            low[cid] = meta
    for cid, ps in clubs.items():
        if cid in top: continue
        if cid in low: meta = low.pop(cid)
        else: meta = dict(id=cid, **NEW[cid])
        meta = {**meta}; meta['reputation'] = meta['reputation'] + 3
        meta['budget'] = PROMOTED_BUDGET[lg]
        meta['players'] = block(ps)
        new_top.append(meta); promoted.append(cid)
    # relegated clubs go first in tier2
    tier2 = [low[c] for c in relegated] + [v for k, v in low.items() if k not in relegated]
    print(f'{lg}: {len(new_top)} clubs, promoted {promoted}, relegated {relegated}', file=sys.stderr)

    out = ["import type { RawLeague } from '../types';", '', 'export const LEAGUE: RawLeague = {']
    for k in ('id', 'name', 'country', 'nat', 'tier2Name'):
        out.append(f'  {k}: {q(L[k])},')
    out.append('  clubs: [')
    out += [ser_club(cl) for cl in new_top]
    out.append('  ],')
    out.append('  tier2: [')
    out += [ser_lower(cl) for cl in tier2]
    out.append('  ],')
    if 'tier3' in L: out.append(f"  tier3: {q(L['tier3'])},")
    out.append('};')
    open(f'src/data/leagues/{lg}.ts', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
