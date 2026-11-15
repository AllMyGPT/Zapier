'use client';
import React, { useEffect, useState } from 'react';
import { useGame } from '../GameApp';
import { cloudList, deleteCloud, deleteLocal, loadCloud, loadLocal, localList, saveCloud, saveLocal, type SaveMeta } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import AuthBox from '../AuthBox';

export default function SaveScreen() {
  const { gs, toast, setGs } = useGame();
  const [local, setLocal] = useState<SaveMeta[]>([]);
  const [cloud, setCloud] = useState<SaveMeta[]>([]);
  const [busy, setBusy] = useState(false);
  const reload = () => { setLocal(localList()); cloudList().then(setCloud); };
  useEffect(reload, []);
  const slots = [1, 2, 3, 4, 5];
  const Slot = ({ where, slot }: { where: 'local' | 'cloud'; slot: number }) => {
    const m = (where === 'local' ? local : cloud).find(s => s.slot === slot);
    return (
      <div className="news-item row wrap" style={{ cursor: 'default' }}>
        <b style={{ width: 70 }}>Ranura {slot}</b>
        <div className="grow small">{m ? <>{m.club} · {m.season} · <span className="muted">{new Date(m.updated_at).toLocaleString('es-ES')}</span></> : <span className="muted">Vacía</span>}</div>
        <button className="btn sm primary" disabled={busy} onClick={async () => {
          setBusy(true);
          const err = where === 'local' ? ((await saveLocal(gs, slot)) ? null : 'Sin espacio en el navegador') : await saveCloud(gs, slot);
          setBusy(false); toast(err ?? 'Partida guardada'); reload();
        }}>Guardar</button>
        {m && <button className="btn sm" disabled={busy} onClick={async () => { setBusy(true); const g = where === 'local' ? await loadLocal(slot) : await loadCloud(slot); setBusy(false); if (g) { setGs(g); toast('Partida cargada'); } }}>Cargar</button>}
        {m && <button className="btn sm danger" onClick={async () => { if (!confirm('¿Borrar esta partida?')) return; if (where === 'local') deleteLocal(slot); else await deleteCloud(slot); reload(); }}>Borrar</button>}
      </div>
    );
  };
  return (
    <div className="grid g2">
      <div className="panel col"><h3 style={{ margin: 0 }}>En este navegador</h3><div className="small muted">La partida también se autoguarda tras cada acción.</div>{slots.map(s => <Slot key={s} where="local" slot={s} />)}</div>
      <div className="col">
        <div className="panel col"><h3 style={{ margin: 0 }}>En la nube (Supabase)</h3>{supabase() ? slots.map(s => <Slot key={s} where="cloud" slot={s} />) : <div className="small muted">No configurado.</div>}</div>
        <AuthBox onChange={reload} />
        <div className="panel"><button className="btn danger" onClick={() => { if (confirm('¿Salir al menú principal? Se mantiene el autoguardado.')) setGs(null); }}>Salir al menú principal</button></div>
      </div>
    </div>
  );
}
