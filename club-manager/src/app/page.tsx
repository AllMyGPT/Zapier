'use client';
import dynamic from 'next/dynamic';
const GameApp = dynamic(() => import('@/components/GameApp'), { ssr: false, loading: () => <div className="title-screen"><div className="spin" /></div> });
export default function Page() { return <GameApp />; }
