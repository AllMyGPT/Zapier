'use client';
import { useState } from 'react';
import Menu from '@/components/Menu';
import Game from '@/components/Game';
import type { GameState } from '@/engine/types';

export default function Home() {
  const [game, setGame] = useState<GameState | null>(null);
  return game ? <Game initial={game} onExit={() => setGame(null)} /> : <Menu onStart={setGame} />;
}
