import * as THREE from 'three';

// Dos curvas (punto 5 de la orden): una para la posición de la cámara y otra
// para el punto al que mira, así la mirada gira con suavidad en vez de quedar
// clavada. Los puntos siguen el layout de la casa (ver House.tsx):
//  - Fachada y puerta en z=6 (x=0).
//  - Living del lado oeste (x negativo), cocina del lado este (x positivo).
//  - Ventanal de fondo en z=-2.5.
//  - Patio y pileta más allá, z negativo creciente.

const positionPoints = [
  new THREE.Vector3(0, 1.65, 17),   // 0.00 llegada, plano abierto
  new THREE.Vector3(0, 1.62, 10),
  new THREE.Vector3(0, 1.6, 6.6),   // 0.15 frente a la puerta
  new THREE.Vector3(0, 1.6, 5.2),   // 0.30 recién cruzado el umbral
  new THREE.Vector3(-1.8, 1.6, 2.6),// 0.40 adentro del living
  new THREE.Vector3(-0.6, 1.6, 0.6),// 0.50 girando hacia la cocina
  new THREE.Vector3(2.6, 1.6, -0.2),// 0.60 en la isla
  new THREE.Vector3(1.6, 1.6, -1.8),// 0.70 yendo al ventanal
  new THREE.Vector3(0, 1.6, -3.0),  // 0.80 en el umbral del ventanal
  new THREE.Vector3(0, 1.65, -5.4), // 0.88 saliendo al deck
  new THREE.Vector3(0.4, 1.7, -8.2),// 0.94 junto a la pileta
  new THREE.Vector3(0, 3.2, -12),   // 1.00 sube, casa iluminada de fondo
];

const targetPoints = [
  new THREE.Vector3(0, 1.4, 6),
  new THREE.Vector3(0, 1.35, 6),
  new THREE.Vector3(0, 1.3, 5.8),
  new THREE.Vector3(-1, 1.25, 2),
  new THREE.Vector3(-2.6, 1.15, 1.4),
  new THREE.Vector3(0.4, 1.25, -0.4),
  new THREE.Vector3(2.7, 1.1, -1.6),
  new THREE.Vector3(0.6, 1.25, -3.2),
  new THREE.Vector3(0, 1.2, -6.5),
  new THREE.Vector3(0, 1.0, -8),
  new THREE.Vector3(0.2, 0.7, -9.2),
  new THREE.Vector3(0, 2.2, 4),
];

export const cameraCurve = new THREE.CatmullRomCurve3(positionPoints, false, 'catmullrom', 0.5);
export const targetCurve = new THREE.CatmullRomCurve3(targetPoints, false, 'catmullrom', 0.5);

// Progreso de scroll al que corresponde cada waypoint de arriba (mismo orden).
// Usamos esto en vez de getPointAt (parametrizado por longitud de arco) porque
// los tramos tienen distancias muy distintas entre sí (el tramo de llegada mide
// ~10 unidades, los tramos dentro de la casa ~2-3): con longitud de arco, un
// progress de 0.60 terminaba cayendo cerca del patio en vez de la cocina.
const WAYPOINT_PROGRESS = [0.00, 0.08, 0.15, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.88, 0.94, 1.00];

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Convierte progress -> parámetro u de la curva (getPoint, NO getPointAt),
// interpolando por tramos para que cada waypoint caiga exactamente en el
// progress indicado en WAYPOINT_PROGRESS, con ease-in-out dentro de cada tramo.
function progressToU(progress: number) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const segments = WAYPOINT_PROGRESS.length - 1;
  let i = 0;
  while (i < segments - 1 && p > WAYPOINT_PROGRESS[i + 1]) i++;
  const segStart = WAYPOINT_PROGRESS[i];
  const segEnd = WAYPOINT_PROGRESS[i + 1];
  const localT = segEnd > segStart ? (p - segStart) / (segEnd - segStart) : 0;
  return (i + easeInOutCubic(localT)) / segments;
}

const tmpPos = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();

export function evaluatePath(progress: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  const u = progressToU(progress);
  cameraCurve.getPoint(u, tmpPos);
  targetCurve.getPoint(u, tmpTarget);
  outPos.copy(tmpPos);
  outTarget.copy(tmpTarget);
}

// Etapas — mismos rangos que content/hero.json y la tabla de la orden.
export const STAGES = [
  { id: 'llegada', desde: 0.00, hasta: 0.15 },
  { id: 'puerta',  desde: 0.15, hasta: 0.30 },
  { id: 'living',  desde: 0.30, hasta: 0.50 },
  { id: 'cocina',  desde: 0.50, hasta: 0.70 },
  { id: 'ventanal',desde: 0.70, hasta: 0.88 },
  { id: 'patio',   desde: 0.88, hasta: 1.00 },
] as const;

// Rotación de la puerta (0 → ~1.9 rad) durante la etapa "puerta".
export function doorRotation(progress: number) {
  const p = THREE.MathUtils.clamp((progress - 0.15) / (0.30 - 0.15), 0, 1);
  return easeInOutCubic(p) * 1.9;
}

// Apertura de las hojas del ventanal (0 → 1.1m) durante "ventanal".
export function windowOpen(progress: number) {
  const p = THREE.MathUtils.clamp((progress - 0.70) / (0.88 - 0.70), 0, 1);
  return easeInOutCubic(p) * 1.1;
}

// Intensidad de las lámparas interiores: terminan de encender apenas se
// cruza el umbral (arranca en "puerta", termina temprano en "living").
export function lampsIntensity(progress: number) {
  const p = THREE.MathUtils.clamp((progress - 0.18) / (0.34 - 0.18), 0, 1);
  return easeInOutCubic(p);
}
