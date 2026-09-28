'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { evaluatePath } from './CameraPath';

export function CameraRig({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    evaluatePath(progressRef.current, pos.current, target.current);
    camera.position.copy(pos.current);
    camera.lookAt(target.current);
  });

  return null;
}
