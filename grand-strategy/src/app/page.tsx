'use client';
import { useCallback, useState } from 'react';
import Menu from '@/components/Menu';
import Game from '@/components/Game';
import LoadingScreen from '@/components/LoadingScreen';
import { scenarioById } from '@/data/scenarios';
import { artEra } from '@/lib/art';
import type { GameState } from '@/engine/types';

export default function Home() {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const start = useCallback((s: GameState) => { setGame(s); setLoading(true); }, []);
  const done = useCallback(() => setLoading(false), []);
  if (!game) return <Menu onStart={start} />;
  const sc = scenarioById(game.scenarioId);
  return (
    <>
      <Game initial={game} onExit={() => setGame(null)} paused={loading} />
      {loading && <LoadingScreen scenarioId={game.scenarioId} era={artEra(game)} title={sc?.name ?? 'Gran Estrategia'} text={sc?.description ?? ''} onDone={done} />}
    </>
  );
}
