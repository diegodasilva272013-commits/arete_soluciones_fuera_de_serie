'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';
import * as THREE from 'three';
import { House } from './House';
import { CameraRig } from './CameraRig';
import { Sky } from './Sky';

// ── Escena: luces + casa + postprocesado. Separada del Canvas para poder
// bajar sombras/bloom en celular sin duplicar código. ──────────────────────
function Scene({ progressRef, mobile, bloomOn }: { progressRef: React.MutableRefObject<number>; mobile: boolean; bloomOn: boolean }) {
  return (
    <>
      <Sky />
      <CameraRig progressRef={progressRef} />
      <House progressRef={progressRef} />

      {/* Sol — direccional cálida, sombras solo en escritorio/gama media */}
      <directionalLight
        position={[-8, 9, 10]}
        intensity={2.2}
        color="#ffb877"
        castShadow
        shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <ambientLight intensity={0.25} color="#8fa7c9" />

      <Environment resolution={128}>
        <Lightformer intensity={2} color="#ffcf94" position={[-6, 6, 8]} scale={[6, 6, 1]} />
        <Lightformer intensity={1} color="#7ea6d9" position={[6, 8, -6]} scale={[8, 8, 1]} />
        <Lightformer intensity={0.6} color="#ffffff" position={[0, 10, 0]} scale={[10, 10, 1]} form="ring" />
      </Environment>

      <EffectComposer multisampling={0} enabled={bloomOn}>
        <SMAA />
        <Bloom intensity={0.5} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </>
  );
}

function LoadingOverlay({ visible }: { visible: boolean }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!visible) { setPct(100); return; }
    let raf: number;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(96, ((t - t0) / 700) * 100);
      setPct(p);
      if (p < 96) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: '#050505',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.5s ease',
      }}
    >
      <p style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#2F7BF6', margin: 0 }}>
        Areté Soluciones
      </p>
      <p style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 800, fontSize: 32, color: '#F2EFE9', margin: 0 }}>
        {Math.round(pct)}%
      </p>
    </div>
  );
}

export function Hero3D({
  progressRef, mobile, dpr, static: isStatic = false,
}: {
  progressRef: React.MutableRefObject<number>;
  mobile: boolean;
  dpr: [number, number];
  static?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [bloomOn, setBloomOn] = useState(!mobile);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        shadows
        dpr={dpr}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        camera={{ fov: 55, position: isStatic ? [0, 1.6, 5.2] : undefined }}
        onCreated={() => setReady(true)}
      >
        {!isStatic && <PerformanceMonitor onDecline={() => setBloomOn(false)} />}
        <Scene progressRef={progressRef} mobile={mobile} bloomOn={bloomOn} />
      </Canvas>
      {!isStatic && <LoadingOverlay visible={!ready} />}
    </div>
  );
}
