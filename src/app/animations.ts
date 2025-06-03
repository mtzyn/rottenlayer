// src/app/animations.ts
import { keyframes } from 'styled-components';

// Fade + Slide muy sutil
export const fadeSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Glow botón CTA (sombra blanca muy leve, latido lento)
export const ctaGlow = keyframes`
  0%   { box-shadow: 0 0 12px 0 rgba(255,255,255,0.08); }
  45%  { box-shadow: 0 0 26px 2px rgba(180,200,255,0.20); }
  55%  { box-shadow: 0 0 26px 2px rgba(180,200,255,0.20); }
  100% { box-shadow: 0 0 12px 0 rgba(255,255,255,0.08); }
`;

// Pulsación de fondo más lenta y más leve
export const bgPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.012); }
  100% { transform: scale(1); }
`;

// “Hover” elegante en letras: scale y sombra suave, sin shake
export const textGlow = keyframes`
  0%   { text-shadow: 0 0 4px #fff, 0 0 0px #b5cdfc; }
  100% { text-shadow: 0 0 14px #dbeafe, 0 0 22px #3b82f6; }
`;