'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { Oswald } from 'next/font/google';
import { Metal_Mania } from 'next/font/google';
import { fadeSlideUp, ctaGlow, bgPulse, textGlow } from './animations';
import { motion } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';

// Tipografía fuerte y geométrica para el sitio entero
const oswald = Oswald({ weight: ['400', '700'], subsets: ['latin'] });
// Tipografía "metal" para el texto hero principal
const metalMania = Metal_Mania({ weight: '400', subsets: ['latin'] });

/* ---- HERO BASE COMPONENTS ---- */
const HeroPhrase = styled.h1`
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 3rem; /* mayor espacio antes del botón */
  color: #eee;
  background: rgba(0, 0, 0, 0.6);         /* overlay semitransparente */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); /* legible y dramático */
  display: inline-block;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;

  @media (max-width: 600px) {
    font-size: 2.8rem;
    margin-bottom: 2.5rem;
  }
`;

const CtaButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(145deg, #2b2b2b, #111111, #2b2b2b);
  color: #eee;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 1rem 3rem; /* padding horizontal aumentado */
  text-decoration: none;
  border: 2px solid #4b4b4b;
  border-radius: 4px;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.8); /* solo sombra negra */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.9); /* sombra negra en hover */
  }
`;

const HeroBgGlobal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
`;

const Accent = styled.span`
  color: rgb(189, 0, 0);
  letter-spacing: 0.02em;
  font-family: inherit;
`;

/* ---- ANIMATED COMPONENTS ---- */
// Hero principal con animación avanzada
const AnimatedHeroPhrase = motion(HeroPhrase);

// Botón CTA "Contact Us" con animación pulsante
const AnimatedCtaButton = motion(CtaButton);

// Fondo pulsante
// (Ya no se usa AnimatedHeroBgGlobal en JSX, por lo que no es necesario mantenerlo)
// const AnimatedHeroBgGlobal = styled(HeroBgGlobal)`
//   animation: ${bgPulse} 32s ease-in-out infinite;
// `;

// Glitch/Jitter para spans
const GlitchAccent = styled(Accent)`
  cursor: pointer;
  transition: 
    filter 0.23s cubic-bezier(.36,.4,.44,1.2), 
    text-shadow 0.22s cubic-bezier(.36,.4,.44,1.2), 
    transform 0.24s cubic-bezier(.36,.4,.44,1.2);
  &:hover {
    animation: ${textGlow} 0.8s alternate infinite;
    filter: brightness(1.2);
    transform: scale(1.1);
    text-shadow: 0 0 24px #dbeafe, 0 0 16px #3b82f6, 0 0 4px #fff;
  }
`;

// Array con los links de la navbar (orden actualizado)
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Band', href: '/band' },
  { label: 'Gigs', href: '/gigs' },
  { label: 'Merch', href: '/merch' },
  { label: 'Media', href: '/media' },
  { label: 'Contact', href: '/contact' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // Configuración de partículas como any para evitar errores de tipado
  const particlesOptions: any = {
    particles: {
      number: {
        value: 100,
        density: { enable: true, area: 800 }
      },
      color: { value: "#777777" },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.1, max: 0.4 },
        anim: { enable: true, speed: 0.5, min: 0.1, sync: false }
      },
      size: { value: { min: 1, max: 4 } },
      move: {
        direction: "top",
        enable: true,
        speed: 0.8,
        outModes: { default: "out" }
      }
    },
    interactivity: {
      detectsOn: "canvas",
      events: { onHover: { enable: false }, onClick: { enable: false } },
      resize: { enable: true }
    },
    detectRetina: true,
    background: { color: "" }
  };

  return (
    <>
      <HeroBgGlobal>
        {init && (
          <Particles
            id="tsparticles"
            options={particlesOptions}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
          />
        )}
        <AnimatedBgImage
          src="/hero.webp"
          alt="Fondo Hero Rotten Layer"
          fill
          sizes="100vw"
          priority
        />
        <DarkOverlay />
      </HeroBgGlobal>
      <Main className={oswald.className}>
        <Header>
          <LogoLink href="/" style={{ marginLeft: 0 }}>
            <Image
              src="/logo.png"
              alt="Rotten Layer Logo"
              width={64}
              height={64}
              priority
              style={{ filter: 'drop-shadow(0 0 2px #111)' }}
            />
          </LogoLink>
          <Nav>
            <NavToggle onClick={() => setMenuOpen((prev) => !prev)}>
              {menuOpen ? '✕' : '☰'}
            </NavToggle>

            <NavList className={menuOpen ? 'open' : ''}>
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <NavLink href={href}>{label}</NavLink>
                </li>
              ))}
            </NavList>
          </Nav>
        </Header>

        <Container>
          <Hero>
            <HeroContent>
              <AnimatedHeroPhrase
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={metalMania.className}
              >
                We are the layer that{' '}
                <GlitchAccent style={{ fontSize: '4rem', fontWeight: '700' }}>
                  blooms
                </GlitchAccent>{' '}
                after rotting.<br />
                What lives after{' '}
                <GlitchAccent style={{ fontSize: '4.5rem', fontWeight: '700' }}>
                  death
                </GlitchAccent>
                .<br />
                <Tagline>
                  Rötten Layer is a thrash metal band from Costa Rica.
                </Tagline>
              </AnimatedHeroPhrase>
              <CtaButton
                href="/contact"
              >
                Contact Us
              </CtaButton>
            </HeroContent>
          </Hero>
        </Container>
      </Main>
    </>
  );
}

/* ==== STYLES ==== */

const Main = styled.div`
  background: #181818;
  color: #eee;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100vh - 70px);
  overflow: hidden;
`;

const Header = styled.header`
  width: 100%;
  height: 70px;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(30, 30, 30, 0.77); /* translúcido más sutil y oscuro */
  backdrop-filter: blur(8px);         /* difuminado más fuerte */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(60, 60, 60, 0.12);
`;
  
/* ---- Ajuste para agrandar el logo ---- */
const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  height: 82px;

  img {
    width: 82px;
    height: 82px;
    object-fit: contain;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  position: absolute;
  right: 2rem;
`;

const NavToggle = styled.button`
  display: inline-block;
  background: none;
  border: none;
  color: #eee;
  font-size: 2rem;
  cursor: pointer;
  margin-left: 1rem;

  @media (min-width: 900px) {
    display: none;
  }
`;

/*
  - En desktop (>=900px) quiero que los enlaces tengan espacio entre sí:
    por eso agrego `gap: 3rem` en la regla correspondiente.
  - En mobile, dejo la lista oculta por defecto y, al abrir (`.open`),
    cada enlace tiene padding vertical + horizontal para no quedar “pegado”.
*/
const NavList = styled.ul`
  display: none;
  flex-direction: column;
  position: absolute;
  top: 100px;
  right: 0;
  min-width: 140px;
  background: rgba(10, 10, 10, 0.95);
  box-shadow: 0 6px 30px 0 rgba(0, 0, 0, 0.21);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  padding: 0.7rem 0;
  transition: all 0.3s ease;

  &.open {
    display: flex;
  }

  @media (min-width: 900px) {
    position: static;
    display: flex;
    flex-direction: row;
    background: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    gap: 3rem; /* <-- aquí genero espacio entre cada <li> en desktop */
    padding: 0;   /* quito padding extra en desktop */
    transition: none;
  }

  li {
    list-style: none;
  }
`;

const NavLink = styled(Link)`
  color: #eee;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-decoration: none;
  padding: 0.2em 0;
  font-size: 1.08rem;
  border-bottom: 2px solid transparent;
  transition: border 0.25s, color 0.2s;

  &:hover {
    border-bottom: 2px solid rgb(243, 18, 18);
    color: rgb(255, 255, 255);
  }

  @media (max-width: 900px) {
    display: block;
    padding: 0.7rem 1.8rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    box-shadow: none;
    font-size: 1.05rem;
    border: none;
    color: #eee;
    background: transparent;
    transition: background 0.25s, transform 0.2s;

    &:hover {
      background: rgba(189, 0, 0, 0.9);
      transform: translateX(8px);
    }
  }
`;

/* ---- HERO ---- */
const Hero = styled.section`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 0;
  text-align: center;
  max-width: 800px;
  padding: 0 1rem;
`;

const Tagline = styled.p`
  margin-top: 0.5rem;
  font-size: 1.1rem;
  color: #ccc;
  display: block;
`;

const DarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.19) 0%,
    rgb(0, 0, 0) 65%,
    #181818 92%,
    #181818 100%
  );
`;

const AnimatedBgImage = styled(Image)`
  width: 100vw !important;
  height: 100vh !important;
  object-fit: cover;
  object-position: center;
  filter: blur(4px);
  z-index: -1;

  /* Aplica la animación directamente al <img> interno generado por Next.js */
  & > img {
    animation: ${bgPulse} 40s ease-in-out infinite;
    transition: transform 0.5s ease;
    width: 100vw !important;
    height: 100vh !important;
    object-fit: cover;
    object-position: center;
    filter: blur(4px);
  }
`;