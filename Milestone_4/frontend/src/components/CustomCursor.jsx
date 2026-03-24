import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return undefined;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let activeTarget = null;
    let rafId = null;

    const isMagnetic = (target) => {
      if (!target?.closest) {
        return false;
      }
      return Boolean(target.closest('button, a, [role="button"], input, select'));
    };

    const handleMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      const hovered = document.elementFromPoint(mouseX, mouseY);
      activeTarget = isMagnetic(hovered) ? hovered.closest('button, a, [role="button"], input, select') : null;
    };

    const tick = () => {
      let targetX = mouseX;
      let targetY = mouseY;

      if (activeTarget && document.body.contains(activeTarget)) {
        const rect = activeTarget.getBoundingClientRect();
        targetX += (rect.left + rect.width / 2 - mouseX) * 0.28;
        targetY += (rect.top + rect.height / 2 - mouseY) * 0.28;
      }

      ringX += (targetX - ringX) * 0.28;
      ringY += (targetY - ringY) * 0.28;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return <div ref={ringRef} className="custom-cursor" aria-hidden="true" />;
}
