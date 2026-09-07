"use client";

import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// Fotos reales del proyecto. El componente reparte por columna con
// i % 4 — con estas 5 la columna 4 ya tiene contenido (antes vacia).
const GALLERY_IMAGES = ["/1.png", "/2.png", "/3.png", "/galeria1.png", "/galeria2.png", "/galeria3.png", "/galeria4.png", "/galeria5.png", "/galeria6.png", "/galeria7.png", "/galeria8.png", "/galeria9.png", "/galeria10.png"];

interface ImageCardProps {
  src: string;
  onLoad?: () => void;
}

const ImageCard = ({ src, onLoad }: ImageCardProps) => {
  return (
    <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] flex-shrink-0 bg-[#111] transition-transform duration-300 hover:scale-[1.02] cursor-pointer relative will-change-transform backface-hidden preserve-3d">
      <img
        src={src}
        alt="Areté Fuera de Serie"
        loading="lazy"
        onLoad={onLoad}
        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
};

export default function Component() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const loadedCountRef = useRef(0);

  const handleItemLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (!isReady && loadedCountRef.current >= 1) setIsReady(true);
  }, [isReady]);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const colMedia = useMemo(() => {
    const col1Base = GALLERY_IMAGES.filter((_, i) => i % 4 === 0);
    const col2Base = GALLERY_IMAGES.filter((_, i) => i % 4 === 1);
    const col3Base = GALLERY_IMAGES.filter((_, i) => i % 4 === 2);
    const col4Base = GALLERY_IMAGES.filter((_, i) => i % 4 === 3);

    return {
      col1: [...col1Base, ...col1Base],
      col2: [...col2Base, ...col2Base],
      col3: [...col3Base, ...col3Base],
      col4: [...col4Base, ...col4Base],
    };
  }, []);

  // Scroll de la PAGINA normal (no un contenedor propio anidado): el
  // contenedor overflow-y-auto original quedaba embebido en el medio
  // de una pagina mas larga y atrapaba/perdia el scroll real del
  // mouse/touch (confirmado: la rueda real nunca movia el transform,
  // y en celular directamente trababa el scroll). Mismo patron que
  // ScrollExpandMedia: track alto (600vh) + sticky adentro, todo
  // dentro del flujo normal de la pagina.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });

  // Banner animations
  const bannerWidth = useTransform(smoothProgress, [0, 0.15], ["90vw", "100vw"]);
  const bannerHeight = useTransform(smoothProgress, [0, 0.15], ["80vh", "100vh"]);
  const bannerRadius = useTransform(smoothProgress, [0, 0.15], ["48px", "0px"]);

  // 3D Matrix animations
  const rotateY = useTransform(smoothProgress, [0.15, 1], [-45, 0]);
  const rotateX = useTransform(smoothProgress, [0.15, 1], [25, 0]);
  const rotateZ = useTransform(smoothProgress, [0.15, 1], [15, 0]);
  const translateZ = useTransform(smoothProgress, [0.15, 1], [-800, 0]);

  // Track columns parallax animations
  const yCol1 = useTransform(smoothProgress, [0.15, 1], ["0%", "-40%"]);
  const yCol2 = useTransform(smoothProgress, [0.15, 1], ["-40%", "10%"]);
  const yCol3 = useTransform(smoothProgress, [0.15, 1], ["0%", "-40%"]);
  const yCol4 = useTransform(smoothProgress, [0.15, 1], ["-30%", "20%"]);

  return (
    // Nota: sin overflow-x-hidden aca. En CSS, "overflow-x: hidden" sin
    // overflow-y explicito hace que el eje "visible" pase a computarse
    // como "auto" (regla del spec de overflow), lo que convierte este div
    // en un contenedor de scroll nuevo — y position:sticky adentro calcula
    // su rango de anclaje contra ESE ancestro en vez de la ventana, asi
    // que se despega mucho antes de tiempo (confirmado: a mitad del
    // recorrido el sticky ya tenia top:-2000px en vez de 0, y la galeria
    // se iba de pantalla para siempre). El recorte horizontal del grid de
    // 120vw ya lo hace el propio div "sticky ... overflow-hidden" de abajo,
    // asi que este wrapper no necesita (ni puede tener) su propio overflow.
    <div className="w-full bg-[#050505]">
      <section
        ref={containerRef}
        className="relative w-full h-[600vh] bg-[#050505] text-white font-sans selection:bg-white selection:text-black"
      >
        <div className="sticky top-0 h-screen w-full flex justify-center items-center overflow-hidden">
          <motion.div
            style={{
              width: bannerWidth,
              height: bannerHeight,
              borderRadius: bannerRadius,
            }}
            className="relative bg-black overflow-hidden flex items-center justify-center max-w-[1920px] mx-auto will-change-transform backface-hidden preserve-3d"
          >
            <div
              className="absolute inset-0 flex justify-center items-center pointer-events-none"
              style={{ perspective: "1000px" }}
            >
              {/* Ambient Shadow Box Masking */}
              <div className="absolute inset-0 z-20 shadow-[inset_0_100px_150px_-50px_rgba(0,0,0,1),inset_0_-100px_150px_-50px_rgba(0,0,0,1)]" />
              <div className="absolute inset-0 z-20 shadow-[inset_150px_0_150px_-50px_rgba(0,0,0,1),inset_-150px_0_150px_-50px_rgba(0,0,0,1)]" />

              {/* Parallax Image Grid Matrix */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  rotateZ,
                  z: translateZ,
                  transformStyle: "preserve-3d",
                }}
                className="flex gap-4 md:gap-6 justify-center items-center w-[120vw] h-[150vh] origin-center opacity-100 will-change-transform backface-hidden"
              >
                <motion.div style={{ y: yCol1 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[200px] pointer-events-auto">
                  {colMedia.col1.map((src, index) => (
                    <ImageCard key={`col1-${index}`} src={src} onLoad={handleItemLoad} />
                  ))}
                </motion.div>

                <motion.div style={{ y: yCol2 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[200px] pointer-events-auto">
                  {colMedia.col2.map((src, index) => (
                    <ImageCard key={`col2-${index}`} src={src} onLoad={handleItemLoad} />
                  ))}
                </motion.div>

                <motion.div style={{ y: yCol3 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[200px] pointer-events-auto">
                  {colMedia.col3.map((src, index) => (
                    <ImageCard key={`col3-${index}`} src={src} onLoad={handleItemLoad} />
                  ))}
                </motion.div>

                <motion.div style={{ y: yCol4 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[200px] pointer-events-auto">
                  {colMedia.col4.map((src, index) => (
                    <ImageCard key={`col4-${index}`} src={src} onLoad={handleItemLoad} />
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
