'use client';
import React, { useRef } from 'react';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const rotate   = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale    = useTransform(scrollYProgress, [0, 1], [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      style={{
        height: isMobile ? '52rem' : '80rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: isMobile ? '8px 4px' : '80px',
      }}
    >
      <div style={{
        paddingTop: isMobile ? '24px' : '160px',
        paddingBottom: isMobile ? '24px' : '160px',
        width: '100%',
        position: 'relative',
        perspective: '1000px',
      }}>
        <motion.div
          style={{ translateY: translate, maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}
        >
          {titleComponent}
        </motion.div>

        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow: '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
            maxWidth: '64rem',
            marginTop: '-48px',
            marginLeft: 'auto',
            marginRight: 'auto',
            height: isMobile ? '18rem' : '36rem',
            width: '100%',
            border: '2px solid rgba(47,123,246,0.35)',
            padding: isMobile ? '6px' : '8px',
            background: '#0a0a0a',
            borderRadius: '24px',
          }}
        >
          <div style={{
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '18px',
            background: '#050505',
          }}>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
