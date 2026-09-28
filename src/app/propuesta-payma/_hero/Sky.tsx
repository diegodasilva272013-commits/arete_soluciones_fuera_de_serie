'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

// Cielo de atardecer: gradiente en shader (naranja → rosado → azul profundo),
// sin textura ni HDR — un shader propio sobre una esfera grande, BackSide.
const vertex = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragment = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    float h = normalize(vWorldPos).y;
    vec3 horizonte = vec3(0.98, 0.55, 0.32);
    vec3 medio     = vec3(0.86, 0.42, 0.46);
    vec3 cenit     = vec3(0.09, 0.10, 0.22);
    vec3 col = mix(horizonte, medio, smoothstep(0.0, 0.25, h));
    col = mix(col, cenit, smoothstep(0.15, 0.85, h));
    // sol bajo
    float sol = smoothstep(0.06, 0.0, abs(h - 0.02));
    col += vec3(1.0, 0.78, 0.5) * sol * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Sky() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    side: THREE.BackSide,
    depthWrite: false,
  }), []);
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[200, 24, 16]} />
    </mesh>
  );
}
