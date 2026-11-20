#!/usr/bin/env python3
"""Rebuild the LaLiga squads in src/data/leagues/esp.ts from a Transfermarkt export.

Input: a text file with blocks
    #<club code>
    Name|POS|YY(born)|NAT|value_M€|YY(contract end)
Ratings: players already in the game (any league) keep their rating, nudged
toward what their current market value suggests; new players get a rating
estimated from value and age (fitted on the players present in both).
Output player lines: Name|POS|born|NAT|ovr|pot|valueM|contractEnd
"""
import math, re, sys, glob

SRC = sys.argv[1]
ESP = 'src/data/leagues/esp.ts'
CODE = {'esp': 'esy'}                     # export code -> game club id
PROMOTED = {'dep': dict(budget=12), 'rac': dict(budget=8), 'mal': dict(budget=8)}
RELEGATED = ['mll', 'gir', 'ovi']
SEASON = 2026

def yy(s, base=1900):
    n = int(s); return (2000 + n) if n <= 40 else (1900 + n)

# ---- existing ratings across all leagues
old = {}
for f in glob.glob('src/data/leagues/*.ts'):
    for m in re.finditer(r'^([^|\n`]+)\|(GK|CB|LB|RB|DM|CM|AM|LW|RW|ST)\|(\d{4})\|([A-Z]{3})\|(\d+)\|(\d+)', open(f).read(), re.M):
        old[m.group(1).strip()] = (int(m.group(5)), int(m.group(6)), int(m.group(3)))

# ---- parse export
clubs, cur = {}, None
for line in open(SRC, encoding='utf-8'):
    line = line.strip()
    if not line: continue
    if line.startswith('#'): cur = CODE.get(line[1:], line[1:]); clubs[cur] = []; continue
    name, pos, by, nat, mv, ct = line.split('|')
    nat = {'Kenia': 'KEN', 'Guinea-Bissau': 'GNB', 'Guadalupe': 'FRA', 'Malí': 'MLI', 'Indonesia': 'IDN', 'Malasia': 'ARG'}.get(nat, nat)
    clubs[cur].append(dict(name=name, pos=pos, born=yy(by), nat=nat, mv=float(mv or 0), ct=yy(ct)))

# ---- fit ovr ~ a + b*ln(value) + c*age on players with a known rating
X, Y = [], []
for ps in clubs.values():
    for p in ps:
        if p['name'] in old and p['mv'] > 0:
            X.append((1.0, math.log(p['mv']), SEASON - p['born'])); Y.append(old[p['name']][0])
def solve(X, Y):  # 3x3 normal equations
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
a, bv, c = solve(X, Y)
est = lambda p: a + bv * math.log(max(p['mv'], 0.1)) + c * (SEASON - p['born'])
print(f'fit on {len(X)} players: ovr = {a:.1f} + {bv:.2f}*ln(M€) + {c:.2f}*age', file=sys.stderr)

def rate(p):
    e = est(p)
    if p['name'] in old:
        o0, pot0, _ = old[p['name']]
        o = round(0.6 * o0 + 0.4 * e)
        if SEASON - p['born'] <= 23: o = max(o, round(62 + 4 * math.log(max(p['mv'], 0.1))))
        pot = max(o, pot0 + (o - o0))
    else:
        ag = SEASON - p['born']
        # young players' value is mostly potential: don't let youth drag the rating down
        o = round(max(e, 62 + 4 * math.log(max(p['mv'], 0.1))) if ag <= 23 else e)
        pot = o + (max(0, 24 - ag) * 2 + (3 if ag <= 21 else 0))
    o = max(55, min(93, o)); pot = max(o, min(95, pot))
    return o, pot

def block(ps):
    out = []
    for p in ps:
        o, pot = rate(p)
        out.append(f"{p['name']}|{p['pos']}|{p['born']}|{p['nat']}|{o}|{pot}|{p['mv']:g}|{p['ct']}")
    return '\n'.join(out)

src = open(ESP, encoding='utf-8').read()
# ---- replace squads of clubs that already exist
for cid, ps in clubs.items():
    if cid in PROMOTED: continue
    m = re.search(r"(id: '%s',.*?players: `)(.*?)(`)" % re.escape(cid), src, re.S)
    if not m: print('missing club', cid, file=sys.stderr); continue
    src = src[:m.start(2)] + block(ps) + src[m.end(2):]

# ---- relegated top-flight clubs become tier-2 entries (generated squads)
moved = []
for cid in RELEGATED:
    m = re.search(r"\n    \{\n      id: '%s',.*?\n    \},?\n" % cid, src, re.S)
    meta = re.search(r"id: '%s', name: '([^']+)', short: '([^']+)', city: '([^']+)', stadium: '([^']+)', capacity: (\d+),\s*colors: (\[[^\]]+\]), reputation: (\d+)" % cid, m.group(0), re.S)
    moved.append("    { id: '%s', name: '%s', short: '%s', city: '%s', stadium: '%s', capacity: %s, colors: %s, reputation: %d }," % (cid, *meta.groups()[:6], max(60, int(meta.group(7)) - 4)))
    src = src[:m.start()] + '\n' + src[m.end():]

# ---- promoted clubs: pull their tier-2 entry up with the real squad
for cid, extra in PROMOTED.items():
    m = re.search(r"    \{ id: '%s', name: '([^']+)', short: '([^']+)', city: '([^']+)', stadium: '([^']+)', capacity: (\d+), colors: (\[[^\]]+\]), reputation: (\d+) \},\n" % cid, src)
    name, short, city, stadium, cap, colors, rep = m.groups()
    src = src[:m.start()] + src[m.end():]
    entry = ("    {\n      id: '%s', name: '%s', short: '%s', city: '%s', stadium: '%s', capacity: %s,\n      colors: %s, reputation: %d, budget: %d,\n      players: `%s`,\n    },\n"
             % (cid, name, short, city, stadium, cap, colors, int(rep) + 3, extra['budget'], block(clubs[cid])))
    i = src.index('  ],\n  tier2: [')
    src = src[:i] + entry + src[i:]

# relegated entries go to the top of tier2
i = src.index('  tier2: [\n') + len('  tier2: [\n')
src = src[:i] + '\n'.join(moved) + '\n' + src[i:]
src = src.replace('\n\n\n', '\n')
open(ESP, 'w', encoding='utf-8').write(src)
print('ok', sum(len(v) for v in clubs.values()), 'players', file=sys.stderr)
