'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthBox({ onChange }: { onChange?: () => void }) {
  const sb = supabase();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [user, setUser] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
    const { data } = sb.auth.onAuthStateChange((_e, s) => { setUser(s?.user?.email ?? null); onChange?.(); });
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!sb) return <div className="panel small muted">☁️ Guardado en la nube desactivado: configura <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Las partidas se guardan en este navegador.</div>;
  if (user) return <div className="panel row"><span>☁️ Sesión: <b>{user}</b></span><button className="btn sm right" onClick={() => sb.auth.signOut()}>Salir</button></div>;
  const go = async (mode: 'in' | 'up') => {
    setMsg('...');
    const r = mode === 'in' ? await sb.auth.signInWithPassword({ email, password: pass }) : await sb.auth.signUp({ email, password: pass });
    setMsg(r.error ? r.error.message : mode === 'up' && !r.data.session ? 'Revisa tu correo para confirmar la cuenta.' : '');
  };
  return (
    <div className="panel col">
      <h3 style={{ margin: 0 }}>Cuenta (guardado en la nube)</h3>
      <input type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="contraseña" value={pass} onChange={e => setPass(e.target.value)} />
      <div className="row"><button className="btn primary" onClick={() => go('in')}>Entrar</button><button className="btn" onClick={() => go('up')}>Crear cuenta</button></div>
      {msg && <div className="small muted">{msg}</div>}
    </div>
  );
}
