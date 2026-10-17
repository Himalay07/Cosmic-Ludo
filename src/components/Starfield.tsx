import React, { useEffect, useRef } from 'react';

export const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
      phase: number;
      hue: number;
    }

    const starCount = Math.min(140, Math.floor((width * height) / 8000));
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.008,
        phase: Math.random() * Math.PI * 2,
        hue: [260, 200, 45, 0][Math.floor(Math.random() * 4)]
      });
    }

    interface ShootingStar {
      x: number;
      y: number;
      len: number;
      speed: number;
      angle: number;
      active: boolean;
      delay: number;
    }

    const shootingStars: ShootingStar[] = [
      { x: 0, y: 0, len: 120, speed: 18, angle: (Math.PI / 4) * 1.1, active: false, delay: 100 },
      { x: 0, y: 0, len: 100, speed: 22, angle: (Math.PI / 4) * 0.9, active: false, delay: 250 }
    ];

    const resetShootingStar = (ss: ShootingStar) => {
      ss.x = Math.random() * (width * 0.7) + width * 0.2;
      ss.y = Math.random() * (height * 0.3);
      ss.len = Math.random() * 80 + 80;
      ss.speed = Math.random() * 10 + 15;
      ss.active = true;
    };

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Deep space ambient nebula glow
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.2, 50, width * 0.2, height * 0.2, width * 0.6);
      grad1.addColorStop(0, 'rgba(176, 107, 255, 0.09)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.8, 50, width * 0.8, height * 0.8, width * 0.5);
      grad2.addColorStop(0, 'rgba(63, 167, 255, 0.08)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (const s of stars) {
        s.phase += s.speed;
        const currentAlpha = 0.2 + (Math.sin(s.phase) + 1) * 0.4 * s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, 90%, ${currentAlpha})`;
        ctx.shadowBlur = s.size > 2 ? 6 : 0;
        ctx.shadowColor = `hsla(${s.hue}, 80%, 90%, 0.8)`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Shooting stars
      for (const ss of shootingStars) {
        if (!ss.active) {
          ss.delay--;
          if (ss.delay <= 0) {
            resetShootingStar(ss);
          }
          continue;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.len;
        const tailY = ss.y - Math.sin(ss.angle) * ss.len;

        const sGrad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        sGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        sGrad.addColorStop(0.3, 'rgba(176, 210, 255, 0.7)');
        sGrad.addColorStop(1, 'transparent');

        ctx.strokeStyle = sGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        if (ss.x > width + 200 || ss.y > height + 200) {
          ss.active = false;
          ss.delay = Math.floor(Math.random() * 300) + 120;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(180deg, #05061a 0%, #0a0c26 60%, #05061a 100%)' }}
    />
  );
};
