import React, { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  primaryColor?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glowColor: string;
  type: 'ribbon' | 'star' | 'sparkle' | 'orb' | 'ring';
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  opacity: number;
  decay: number;
  drag: number;
  gravity: number;
  wobbleSpeed: number;
  wobblePhase: number;
}

const GALACTIC_COLORS = [
  { color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.8)' },    // Electric Cyan
  { color: '#b06bff', glow: 'rgba(176, 107, 255, 0.8)' },  // Warp Purple
  { color: '#ffc247', glow: 'rgba(255, 194, 71, 0.8)' },   // Solar Gold
  { color: '#ff5b4a', glow: 'rgba(255, 91, 74, 0.8)' },    // Supernova Coral
  { color: '#00f5d4', glow: 'rgba(0, 245, 212, 0.8)' },    // Aurora Teal
  { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.9)' },   // Starlight White
  { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.8)' },   // Nebula Pink
];

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({ primaryColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const colorPalette = primaryColor
      ? [{ color: primaryColor, glow: `${primaryColor}cc` }, ...GALACTIC_COLORS]
      : GALACTIC_COLORS;

    // Helper to spawn a particle
    const createParticle = (
      x: number,
      y: number,
      angleRad: number,
      speed: number,
      customType?: 'ribbon' | 'star' | 'sparkle' | 'orb' | 'ring'
    ): Particle => {
      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const types: Array<'ribbon' | 'star' | 'sparkle' | 'orb' | 'ring'> = [
        'ribbon',
        'ribbon',
        'star',
        'sparkle',
        'orb',
        'ring'
      ];
      const type = customType || types[Math.floor(Math.random() * types.length)];

      return {
        x,
        y,
        vx: Math.cos(angleRad) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angleRad) * speed + (Math.random() - 0.5) * 2,
        size: type === 'ribbon' ? Math.random() * 8 + 6 : Math.random() * 7 + 4,
        color: col.color,
        glowColor: col.glow,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        tilt: Math.random() * Math.PI * 2,
        tiltSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        decay: Math.random() * 0.003 + 0.002,
        drag: 0.985,
        gravity: 0.22,
        wobbleSpeed: Math.random() * 0.08 + 0.02,
        wobblePhase: Math.random() * Math.PI * 2
      };
    };

    // Cannon 1: Left Bottom
    const fireLeftCannon = (count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 4 - (Math.random() * 0.4 - 0.2); // ~45 deg up-right
        const speed = Math.random() * 16 + 12;
        particles.push(createParticle(width * 0.1, height * 0.95, angle, speed));
      }
    };

    // Cannon 2: Right Bottom
    const fireRightCannon = (count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (-3 * Math.PI) / 4 + (Math.random() * 0.4 - 0.2); // ~135 deg up-left
        const speed = Math.random() * 16 + 12;
        particles.push(createParticle(width * 0.9, height * 0.95, angle, speed));
      }
    };

    // Nova Burst: Center
    const fireCenterNova = (count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 14 + 4;
        particles.push(
          createParticle(
            width * 0.5,
            height * 0.45,
            angle,
            speed,
            Math.random() > 0.4 ? 'star' : 'sparkle'
          )
        );
      }
    };

    // Sky drizzle: Gentle stardust falling from top
    const spawnSkyDrift = () => {
      if (particles.length < 280) {
        particles.push(
          createParticle(
            Math.random() * width,
            -20,
            Math.PI / 2 + (Math.random() - 0.5) * 0.3,
            Math.random() * 3 + 1.5
          )
        );
      }
    };

    // Initial Volley
    fireLeftCannon(60);
    fireRightCannon(60);
    fireCenterNova(70);

    // Follow-up secondary burst after 500ms
    const timer1 = setTimeout(() => {
      fireLeftCannon(40);
      fireRightCannon(40);
    }, 450);

    const timer2 = setTimeout(() => {
      fireCenterNova(45);
    }, 1100);

    // Draw Star Shape
    const drawStar = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    // Draw Diamond Sparkle
    const drawSparkle = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 1.5);
      ctx.quadraticCurveTo(cx, cy, cx + r * 1.5, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + r * 1.5);
      ctx.quadraticCurveTo(cx, cy, cx - r * 1.5, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - r * 1.5);
      ctx.closePath();
      ctx.fill();
    };

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Continuous gentle celebratory drift
      if (frameCount % 6 === 0) {
        spawnSkyDrift();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Physics update
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx + Math.sin(p.wobblePhase) * 0.8;
        p.y += p.vy;
        p.wobblePhase += p.wobbleSpeed;

        p.rotation += p.rotationSpeed;
        p.tilt += p.tiltSpeed;
        p.opacity -= p.decay;

        // Remove dead particles
        if (p.opacity <= 0 || p.y > height + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.opacity);

        ctx.shadowBlur = 10;
        ctx.shadowColor = p.glowColor;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        const tiltFactor = Math.cos(p.tilt);

        switch (p.type) {
          case 'ribbon': {
            const rw = p.size;
            const rh = p.size * 1.6 * tiltFactor;
            ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
            break;
          }
          case 'star': {
            drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
            break;
          }
          case 'sparkle': {
            drawSparkle(ctx, 0, 0, p.size);
            break;
          }
          case 'orb': {
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(1.5, p.size * 0.6), 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case 'ring': {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, Math.max(1, p.size * 0.5 * Math.abs(tiltFactor)), 0, 0, Math.PI * 2);
            ctx.stroke();
            break;
          }
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, [primaryColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
