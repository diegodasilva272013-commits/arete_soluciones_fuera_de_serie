'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { woodTexture, stoneTexture, rugTexture, plasterTexture, grassTexture } from './textures';
import { doorRotation, windowOpen, lampsIntensity } from './CameraPath';

type Props = { progressRef: React.MutableRefObject<number> };

// ── Dimensiones del layout (coinciden con CameraPath.ts) ──────────────────
const FACHADA_Z = 6;
const FONDO_Z = -2.5;
const ANCHO = 5; // medio-ancho de la casa (paredes en x=-5 y x=5)
const ALTO = 2.6;

export function House({ progressRef }: Props) {
  const textures = useMemo(() => ({
    wood: woodTexture(),
    woodDark: woodTexture('#6b4527', '#402813'),
    stone: stoneTexture(),
    stoneLight: stoneTexture('#c9c2b4', '#96897a'),
    rug: rugTexture(),
    plaster: plasterTexture(),
    grass: grassTexture(),
    deck: woodTexture('#a9764a', '#7a4f2c'),
  }), []);

  const doorRef = useRef<THREE.Group>(null);
  const glassLeftRef = useRef<THREE.Mesh>(null);
  const glassRightRef = useRef<THREE.Mesh>(null);
  const lampsRef = useRef<THREE.PointLight[]>([]);

  useFrame(() => {
    const p = progressRef.current;
    if (doorRef.current) doorRef.current.rotation.y = -doorRotation(p);
    const open = windowOpen(p);
    if (glassLeftRef.current) glassLeftRef.current.position.x = -0.9 - open;
    if (glassRightRef.current) glassRightRef.current.position.x = 0.9 + open;
    const li = lampsIntensity(p);
    // Brillo máximo propio de cada lámpara (0: luz de la puerta, 1-3:
    // colgantes de la cocina, 4: lámpara de pie del living).
    const LAMP_MAX = [2.2, 1.6, 1.6, 1.6, 1.1];
    lampsRef.current.forEach((l, i) => { if (l) l.intensity = li * (LAMP_MAX[i] ?? 1.2); });
  });

  return (
    <group>
      {/* ── Terreno ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 4]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial map={textures.grass} roughness={1} />
      </mesh>

      {/* Camino de lajas hasta la puerta */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 11.5]} receiveShadow>
        <planeGeometry args={[1.6, 11]} />
        <meshStandardMaterial map={textures.stoneLight} roughness={0.9} />
      </mesh>

      {/* ── Piso interior + deck exterior, una sola losa ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (FACHADA_Z + FONDO_Z) / 2]} receiveShadow>
        <planeGeometry args={[ANCHO * 2 - 0.4, FACHADA_Z - FONDO_Z]} />
        <meshStandardMaterial map={textures.wood} roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, FONDO_Z - 3]} receiveShadow>
        <planeGeometry args={[7, 7]} />
        <meshStandardMaterial map={textures.deck} roughness={0.8} />
      </mesh>

      {/* Cielorraso con vigas */}
      <mesh position={[0, ALTO, (FACHADA_Z + FONDO_Z) / 2]}>
        <boxGeometry args={[ANCHO * 2 - 0.4, 0.1, FACHADA_Z - FONDO_Z]} />
        <meshStandardMaterial map={textures.plaster} color="#dcd6c8" roughness={1} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-4 + i * 1.7, ALTO - 0.15, (FACHADA_Z + FONDO_Z) / 2]} castShadow>
          <boxGeometry args={[0.18, 0.3, FACHADA_Z - FONDO_Z]} />
          <meshStandardMaterial map={textures.woodDark} roughness={0.8} />
        </mesh>
      ))}

      {/* ── Muros ── */}
      <FrontWall texture={textures.plaster} stone={textures.stone} />
      <SideWall x={-ANCHO} texture={textures.plaster} />
      <SideWall x={ANCHO} texture={textures.plaster} />
      <BackWallWithWindow glassLeftRef={glassLeftRef} glassRightRef={glassRightRef} texture={textures.plaster} />

      {/* Alero de madera sobre la puerta */}
      <mesh position={[0, ALTO + 0.15, FACHADA_Z + 1.1]} castShadow>
        <boxGeometry args={[4.2, 0.12, 2.4]} />
        <meshStandardMaterial map={textures.woodDark} roughness={0.7} />
      </mesh>
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} position={[x, ALTO - 0.5, FACHADA_Z + 1.9]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.2]} />
          <meshStandardMaterial map={textures.woodDark} roughness={0.7} />
        </mesh>
      ))}

      {/* Puerta (pivota sobre su bisagra izquierda) */}
      <group position={[-0.75, 0, FACHADA_Z]} ref={doorRef}>
        <mesh position={[0.65, 1.1, 0]} castShadow>
          <boxGeometry args={[1.3, 2.2, 0.08]} />
          <meshStandardMaterial map={textures.woodDark} roughness={0.55} metalness={0.05} />
        </mesh>
        <mesh position={[1.2, 1.1, 0.05]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#caa457" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Luz que se derrama por la puerta abierta */}
      <pointLight position={[0, 1.6, FACHADA_Z - 0.3]} color="#ffb877" intensity={0} ref={(r) => { if (r) lampsRef.current[0] = r; }} distance={4} decay={2} />

      <LivingRoom textures={textures} lampsRef={lampsRef} />
      <Kitchen textures={textures} lampsRef={lampsRef} />
      <Patio textures={textures} />
    </group>
  );
}

// ── Muros ──────────────────────────────────────────────────────────────────

function FrontWall({ texture, stone }: { texture: THREE.Texture; stone: THREE.Texture }) {
  // Fachada con hueco de puerta (x: -1.5..1.5) armado con 3 cajas alrededor.
  return (
    <group position={[0, 0, FACHADA_Z]}>
      <mesh position={[-3.25, ALTO / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, ALTO, 0.25]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      <mesh position={[3.25, ALTO / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, ALTO, 0.25]} />
        <meshStandardMaterial map={stone} roughness={0.9} />
      </mesh>
      <mesh position={[0, ALTO - 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.4, 0.25]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
    </group>
  );
}

function SideWall({ x, texture }: { x: number; texture: THREE.Texture }) {
  const depth = FACHADA_Z - FONDO_Z;
  return (
    <mesh position={[x, ALTO / 2, (FACHADA_Z + FONDO_Z) / 2]} castShadow receiveShadow>
      <boxGeometry args={[0.25, ALTO, depth]} />
      <meshStandardMaterial map={texture} roughness={0.95} />
    </mesh>
  );
}

function BackWallWithWindow({ glassLeftRef, glassRightRef, texture }: {
  glassLeftRef: React.RefObject<THREE.Mesh>; glassRightRef: React.RefObject<THREE.Mesh>; texture: THREE.Texture;
}) {
  return (
    <group position={[0, 0, FONDO_Z]}>
      <mesh position={[0, ALTO - 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[ANCHO * 2 - 0.4, 0.4, 0.25]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      <mesh position={[-3.3, ALTO / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, ALTO, 0.25]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      <mesh position={[3.3, ALTO / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, ALTO, 0.25]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      {/* Hojas de vidrio corredizas */}
      <mesh ref={glassLeftRef} position={[-0.9, ALTO / 2 - 0.2, 0]}>
        <boxGeometry args={[1.9, ALTO - 0.4, 0.04]} />
        <meshPhysicalMaterial color="#bcd7e0" transmission={0.85} thickness={0.2} roughness={0.05} ior={1.45} />
      </mesh>
      <mesh ref={glassRightRef} position={[0.9, ALTO / 2 - 0.2, 0]}>
        <boxGeometry args={[1.9, ALTO - 0.4, 0.04]} />
        <meshPhysicalMaterial color="#bcd7e0" transmission={0.85} thickness={0.2} roughness={0.05} ior={1.45} />
      </mesh>
    </group>
  );
}

// ── Living ───────────────────────────────────────────────────────────────

function LivingRoom({ textures, lampsRef }: { textures: Record<string, THREE.Texture>; lampsRef: React.MutableRefObject<THREE.PointLight[]> }) {
  const ox = -3, oz = 1.5;
  return (
    <group position={[ox, 0, oz]}>
      {/* Alfombra */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.005, 0]}>
        <planeGeometry args={[3.2, 2.6]} />
        <meshStandardMaterial map={textures.rug} roughness={1} />
      </mesh>
      {/* Sillón en L */}
      <RoundedBox args={[2.4, 0.5, 0.9]} radius={0.08} position={[-0.5, 0.25, -0.6]} castShadow>
        <meshStandardMaterial color="#38424a" roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.9, 0.5, 1.6]} radius={0.08} position={[0.85, 0.25, 0.05]} castShadow>
        <meshStandardMaterial color="#38424a" roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[2.4, 0.35, 0.16]} radius={0.06} position={[-0.5, 0.62, -1.0]} castShadow>
        <meshStandardMaterial color="#2c343a" roughness={0.85} />
      </RoundedBox>
      {/* Mesa baja */}
      <RoundedBox args={[0.9, 0.12, 0.55]} radius={0.03} position={[0.3, 0.32, 0.6]} castShadow>
        <meshStandardMaterial map={textures.wood} roughness={0.6} />
      </RoundedBox>
      {[[-0.3, 0.85], [0.9, 0.85], [-0.3, 0.35], [0.9, 0.35]].map(([dx, dz], i) => (
        <mesh key={i} position={[0.3 + dx, 0.16, 0.6 + dz - 0.6]}>
          <cylinderGeometry args={[0.02, 0.02, 0.32]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Biblioteca baja */}
      <RoundedBox args={[1.6, 0.7, 0.32]} radius={0.03} position={[-1.9, 0.35, -0.9]} castShadow>
        <meshStandardMaterial map={textures.woodDark} roughness={0.6} />
      </RoundedBox>
      {/* Lámpara de pie */}
      <mesh position={[1.7, 0.7, -0.9]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.4]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[1.7, 1.42, -0.9]}>
        <coneGeometry args={[0.22, 0.3, 16, 1, true]} />
        <meshStandardMaterial color="#e8dcc4" emissive="#ffb877" emissiveIntensity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <pointLight
        position={[1.7, 1.35, -0.9]}
        color="#ffb877"
        intensity={0}
        distance={3.5}
        decay={2}
        castShadow
        ref={(r) => { if (r) lampsRef.current[4] = r; }}
      />
    </group>
  );
}

// ── Cocina ───────────────────────────────────────────────────────────────

function Kitchen({ textures, lampsRef }: { textures: Record<string, THREE.Texture>; lampsRef: React.MutableRefObject<THREE.PointLight[]> }) {
  const ox = 2.8, oz = -0.2;
  return (
    <group position={[ox, 0, oz]}>
      {/* Isla */}
      <RoundedBox args={[2.1, 0.9, 1.0]} radius={0.04} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#efece4" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[2.2, 0.06, 1.1]} radius={0.02} position={[0, 0.93, 0]} castShadow>
        <meshStandardMaterial map={textures.stoneLight} roughness={0.35} />
      </RoundedBox>
      {/* Banquetas */}
      {[-0.7, 0, 0.7].map((x) => (
        <group key={x} position={[x, 0, 0.85]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.05]} />
            <meshStandardMaterial map={textures.wood} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.3]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Colgantes */}
      {[-0.6, 0, 0.6].map((x, i) => (
        <group key={x} position={[x, 0, -0.1]}>
          <mesh position={[0, 2.0, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.7]} />
            <meshStandardMaterial color="#1c1c1c" />
          </mesh>
          <mesh position={[0, 1.62, 0]}>
            <coneGeometry args={[0.16, 0.16, 20, 1, true]} />
            <meshStandardMaterial color="#3a3a3a" emissive="#ffcf94" emissiveIntensity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <pointLight
            position={[0, 1.55, 0]}
            color="#ffcf94"
            intensity={0}
            distance={2.6}
            decay={2}
            ref={(r) => { if (r) lampsRef.current[i + 1] = r; }}
          />
        </group>
      ))}
    </group>
  );
}

// ── Patio ────────────────────────────────────────────────────────────────

function Patio({ textures }: { textures: Record<string, THREE.Texture> }) {
  return (
    <group position={[0, 0, FONDO_Z - 3]}>
      {/* Pileta */}
      <mesh position={[0, -0.15, -3.5]}>
        <boxGeometry args={[3.2, 0.3, 4.2]} />
        <meshPhysicalMaterial color="#1c6e78" transmission={0.55} roughness={0.1} thickness={0.6} ior={1.33} />
      </mesh>
      <mesh position={[0, -0.31, -3.5]}>
        <boxGeometry args={[3.4, 0.05, 4.4]} />
        <meshStandardMaterial map={textures.stoneLight} roughness={0.8} />
      </mesh>

      {/* Galería / pérgola */}
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, 1.3, 1.5]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.6]} />
          <meshStandardMaterial map={textures.woodDark} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 2.55, 1.5]} castShadow>
        <boxGeometry args={[6.4, 0.1, 2.2]} />
        <meshStandardMaterial map={textures.woodDark} roughness={0.7} />
      </mesh>
      {[-2, 0, 2].map((x) => (
        <pointLight key={x} position={[x, 2.3, 1.5]} color="#ffb877" intensity={0.7} distance={3} decay={2} />
      ))}

      {/* Vegetación simple (siluetas creíbles, formas simples) */}
      {[[-4.2, -1], [4.4, -0.5], [-4.6, -5], [4.6, -6]].map(([x, z], i) => (
        <Palmera key={i} position={[x, 0, z]} />
      ))}
    </group>
  );
}

function Palmera({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 2.4]} />
        <meshStandardMaterial color="#5a4632" roughness={0.9} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 2.3, 0]} rotation={[0.5, (i / 6) * Math.PI * 2, 0]} castShadow>
          <planeGeometry args={[0.35, 1.4]} />
          <meshStandardMaterial color="#3b5c34" side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
