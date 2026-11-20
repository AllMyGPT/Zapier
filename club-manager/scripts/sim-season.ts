import { createWorld } from '../src/game/data';
import { startCareer, advance, simFixture, endSeason, fmtMoney } from '../src/game/season';
import { resolveDecision } from '../src/game/events';
import { table } from '../src/game/calendar';
import { ovr } from '../src/game/player';

const t0 = Date.now();
const gs = createWorld('Test', 12345);
console.log('world', Date.now() - t0, 'ms players', Object.keys(gs.players).length, 'clubs', Object.keys(gs.clubs).length);
startCareer(gs, process.argv[2] ?? 'rma');
const seasons = +(process.argv[3] ?? 1);
for (let s = 0; s < seasons; s++) {
  const t1 = Date.now();
  let guard = 0;
  while (guard++ < 3000) {
    const r = advance(gs);
    if (r.type === 'match') { simFixture(gs, r.fixture); continue; }
    if (r.type === 'decision') { resolveDecision(gs, gs.pending![0].id, 0); continue; }
    if (r.type === 'seasonEnd' || r.type === 'sacked') { console.log(r.type); break; }
  }
  const played = gs.fixtures.filter(f => f.played);
  const goals = played.reduce((a, f) => a + f.hg! + f.ag!, 0);
  const homeW = played.filter(f => f.hg! > f.ag!).length, draws = played.filter(f => f.hg === f.ag).length;
  console.log(`season ${gs.season} sim ${Date.now() - t1}ms matches ${played.length} unplayed ${gs.fixtures.length - played.length} gpg ${(goals / played.length).toFixed(2)} home ${(homeW / played.length * 100).toFixed(0)}% draw ${(draws / played.length * 100).toFixed(0)}%`);
  for (const lid of ['esp1', 'eng1']) {
    const rows = table(gs, lid);
    console.log(lid, rows.slice(0, 5).map(r => `${gs.clubs[r.id].short} ${r.pts}`).join(' | '), ' ... ', rows.slice(-3).map(r => `${gs.clubs[r.id].short} ${r.pts}`).join(' | '));
  }
  const top = Object.values(gs.players).sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 5);
  console.log('scorers', top.map(p => `${p.name} ${p.stats.goals}`).join(', '));
  console.log('cups', Object.values(gs.cups).map(c => `${c.name}: ${c.winner ? gs.clubs[c.winner].name : '-'}`).join(' | '));
  const me = gs.clubs[gs.manager.clubId];
  console.log('balance', fmtMoney(me.balance), 'board', gs.manager.board.toFixed(0), 'injured', Object.values(gs.players).filter(p => p.injury > 0).length);
  const sum = endSeason(gs);
  console.log(sum.slice(0, 4).join('\n'));
  console.log('size KB', Math.round(JSON.stringify(gs).length / 1024), 'avg ovr rma', (Object.values(gs.players).filter(p => p.clubId === 'rma').map(ovr).sort((a,b)=>b-a).slice(0,11).reduce((a,b)=>a+b,0)/11).toFixed(1));
}
