// src/app/gigs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { Oswald, Metal_Mania } from 'next/font/google';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import Link from 'next/link';

function ensureArray(data: any) {
  return Array.isArray(data) ? data : [];
}

// Tipado para los eventos
interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  posterUrl: string;
  status: 'upcoming' | 'previous';
}

// Tipografía
const oswald = Oswald({ weight: ['400', '700'], subsets: ['latin'] });
const metalMania = Metal_Mania({ weight: '400', subsets: ['latin'] });

// Estilos globales (reset + overflow-x hidden)
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden; /* Previene scroll horizontal */
  }
`;

export default function GigsPage() {
  // Estados para eventos y carga de partículas
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [previous, setPrevious] = useState<Event[]>([]);
  const [init, setInit] = useState(false);

  // Estado para menú hamburguesa
  const [menuOpen, setMenuOpen] = useState(false);
  // Estado de error de fetch
  const [fetchError, setFetchError] = useState(false);

  // Cargar datos de la API una vez al montar
  useEffect(() => {
    fetch('/api/events?status=upcoming', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setUpcoming(ensureArray(data)))
      .catch(() => {
        setUpcoming([]);
        setFetchError(true);
      });

    fetch('/api/events?status=previous', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setPrevious(ensureArray(data)))
      .catch(() => {
        setPrevious([]);
        setFetchError(true);
      });
  }, []);

  // Inicializar partículas en el cliente
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesOptions: any = {
    particles: {
      number: { value: 100, density: { enable: true, area: 800 } },
      color: { value: '#777777' },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.1, max: 0.4 },
        anim: { enable: true, speed: 0.5, min: 0.1, sync: false },
      },
      size: { value: { min: 1, max: 4 } },
      move: { direction: 'top', enable: true, speed: 0.8, outModes: { default: 'out' } },
    },
    interactivity: {
      detectsOn: 'canvas',
      events: { onHover: { enable: false }, onClick: { enable: false } },
      resize: { enable: true },
    },
    detectRetina: true,
    background: { color: '' },
  };

  return (
    <>
      <GlobalStyle />
      <Wrapper className={oswald.className}>
        <HeroBg>
          {init && (
            <Particles
              id="tsparticles"
              options={particlesOptions}
              style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}
            />
          )}
          <AnimatedBackground src="/DC112.webp" alt="Background" fill sizes="100%" priority />
          <DarkOverlay />
        </HeroBg>

        {/* ===== Navbar ===== */}
        <Header>
          <LogoLink href="/">
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
            <NavToggle onClick={() => setMenuOpen((prev: boolean) => !prev)}>
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

        {/* ===== Contenido principal ===== */}
        <ContentContainer>
          {/* ===== Upcoming Event ===== */}
          <Section>
            <SectionTitle className={metalMania.className}>Upcoming Event</SectionTitle>
            {fetchError ? (
              <p style={{ color: '#f31212' }}>Error al cargar los eventos. Intenta de nuevo más tarde.</p>
            ) : upcoming.length === 0 ? (
              <p>There are no upcoming events.</p>
            ) : (
              upcoming.map((evt: Event) => (
                <EventCard key={evt._id}>
                  <PosterWrapper>
                    <Image
                      src={evt.posterUrl}
                      alt={`Poster of ${evt.title}`}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  </PosterWrapper>
                  <EventInfo>
                    <EventName className={metalMania.className}>{evt.title}</EventName>
                    <EventDetail>
                      <strong>Date:</strong>{' '}
                      {new Date(evt.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </EventDetail>
                    <EventDetail>
                      <strong>Location:</strong> {evt.location}
                    </EventDetail>
                    <CalendarButton
                      href={`https://www.google.com/calendar/render?action=TEMPLATE&amp;text=${encodeURIComponent(
                        evt.title
                      )}&amp;dates=${evt.date.substring(0, 10).replace(/-/g, '')}/${evt.date
                        .substring(0, 10)
                        .replace(/-/g, '')}&amp;location=${encodeURIComponent(evt.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Add to Calendar
                    </CalendarButton>
                  </EventInfo>
                </EventCard>
              ))
            )}
          </Section>

          {/* ===== Previous Events ===== */}
          <Section>
            <SectionTitle className={metalMania.className}>Previous Events</SectionTitle>
            <EventsGrid>
              {fetchError ? (
                <p style={{ color: '#f31212' }}>Error al cargar los eventos.</p>
              ) : previous.length === 0 ? (
                <p>No hay eventos anteriores.</p>
              ) : (
                previous.map((gig: Event) => (
                  <GigCard key={gig._id}>
                    <GigPoster>
                      <Image
                        src={gig.posterUrl}
                        alt={`Poster of ${gig.title}`}
                        fill
                        style={{ objectFit: 'contain' }}
                        priority={false}
                      />
                    </GigPoster>
                    <GigInfo>
                      <GigName className={metalMania.className}>{gig.title}</GigName>
                      <GigDetail>
                        {new Date(gig.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </GigDetail>
                      <GigDetail>{gig.location}</GigDetail>
                    </GigInfo>
                  </GigCard>
                ))
              )}
            </EventsGrid>
          </Section>
        </ContentContainer>
      </Wrapper>
    </>
  );
}

// ==== NAV_LINKS ====
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Band', href: '/band' },
  { label: 'Gigs', href: '/gigs' },
  { label: 'Merch', href: '/merch' },
  { label: 'Media', href: '/media' },
  { label: 'Contact', href: '/contact' },
];

// ==== Animaciones ====
const bgPulse = keyframes`
  0% { transform: scale(1) }
  50% { transform: scale(1.015) }
  100% { transform: scale(1) }
`;

// ==== NAVBAR & LAYOUT ====
const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: #181818;
  color: #eee;
  overflow-x: hidden;
`;

const HeroBg = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

const AnimatedBackground = styled(Image)`
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  object-position: center;
  filter: blur(4px);
  z-index: -1;

  & > img {
    animation: ${bgPulse} 40s ease-in-out infinite;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
    object-position: center;
    filter: blur(4px);
  }
`;

const DarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.19) 0%,
    rgb(0, 0, 0) 65%,
    #181818 92%,
    #181818 100%
  );
  z-index: 1;
`;

const Header = styled.header`
  width: 100%;
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(30, 30, 30, 0.77);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  border-bottom: 1px solid rgba(60, 60, 60, 0.12);

  @media (max-width: 500px) {
    height: 50px;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  height: 82px;
  margin-left: 1rem;

  img {
    width: 82px;
    height: 82px;
    object-fit: contain;
  }

  @media (max-width: 500px) {
    img {
      width: 60px;
      height: 60px;
    }
    height: 50px;
    margin-left: 0.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  position: absolute;
  right: 2rem;

  @media (max-width: 500px) {
    right: 1rem;
  }
`;

const NavToggle = styled.button`
  display: inline-block;
  background: none;
  border: none;
  color: #eee;
  font-size: 2rem;
  cursor: pointer;

  @media (min-width: 900px) {
    display: none;
  }
`;

const NavList = styled.ul`
  display: none;
  flex-direction: column;
  position: absolute;
  top: 60px;
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

  @media (max-width: 500px) {
    top: 50px;
  }

  @media (min-width: 900px) {
    position: static;
    display: flex;
    flex-direction: row;
    background: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    gap: 3rem;
    padding: 0;
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
    padding: 0.7rem 1rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    font-size: 1.05rem;
    border: none;
    background: transparent;
    transition: background 0.25s, transform 0.2s;

    &:hover {
      background: rgba(189, 0, 0, 0.9);
      transform: translateX(8px);
    }
  }
`;

// ==== CONTENT ====
const ContentContainer = styled.main`
  position: relative;
  z-index: 2;
  padding-top: 120px;
  max-width: 1000px;
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 4rem;
  text-align: center;

  @media (max-width: 600px) {
    padding-top: 110px;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  @media (max-width: 400px) {
    padding-top: 100px;
  }
`;

const Section = styled.section`
  margin-bottom: 4rem;

  @media (max-width: 500px) {
    margin-bottom: 3rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 400;
  margin-bottom: 1.2rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f31212;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);

  @media (max-width: 600px) {
    font-size: clamp(1.6rem, 5vw, 2.2rem);
    margin-bottom: 1rem;
  }

  @media (max-width: 400px) {
    font-size: clamp(1.8rem, 6vw, 2.2rem);
    margin-bottom: 1rem;
  }
`;

/* ---- Upcoming Event Card ---- */
const EventCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1f1f1f;
  border: 2px solid #f31212;
  border-radius: 6px;
  padding: 1.5rem 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  margin-bottom: 2rem;

  @media (min-width: 480px) and (max-width: 600px) {
    padding: 1rem;
    gap: 1rem;
  }

  @media (min-width: 600px) {
    flex-direction: row;
    gap: 1.5rem;
    justify-content: center;
  }

  @media (max-width: 400px) {
    padding: 1rem 0.5rem;
  }
`;

const PosterWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  aspect-ratio: 2 / 3;
  border: 2px solid #f31212;
  border-radius: 4px;
  background: #000;
  margin-bottom: 1rem;

  @media (max-width: 600px) {
    max-width: 60%;
  }

  @media (max-width: 400px) {
    max-width: 70%;
  }

  @media (max-width: 320px) {
    max-width: 80%;
  }

  overflow: hidden;
`;

const EventInfo = styled.div`
  margin-top: 2rem;
  text-align: center;

  @media (min-width: 600px) {
    margin-top: 0;
    margin-left: 2rem;
    text-align: left;
  }

  @media (max-width: 400px) {
    margin-left: 0;
  }
`;

const EventName = styled.h3`
  font-size: clamp(1.6rem, 5vw, 2.2rem);
  margin-bottom: 0.8rem;
  color: #eee;

  @media (max-width: 400px) {
    font-size: clamp(2rem, 6vw, 2.4rem);
    margin-bottom: 0.8rem;
  }
`;

const EventDetail = styled.p`
  font-size: 1.1rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  color: #ddd;

  @media (max-width: 400px) {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
`;

const CalendarButton = styled.a`
  display: inline-block;
  margin-top: 1rem;
  background: #f31212;
  color: #111;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  text-decoration: none;
  transition: background 0.2s, transform 0.1s;

  &:hover {
    background: #d10b0b;
    transform: translateY(-2px);
  }

  @media (max-width: 600px) {
    width: 100%;
    text-align: center;
    padding: 0.7rem 1rem;
    font-size: 1rem;
  }
`;

/* ---- Previous Events Grid ---- */
const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
  padding-bottom: 2rem;

  @media (max-width: 800px) {
    gap: 1.5rem;
  }

  @media (max-width: 500px) {
    gap: 1rem;
  }
`;

const GigCard = styled.div`
  background: #1f1f1f;
  border: 2px solid #f31212;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  text-align: center;

  @media (max-width: 500px) {
    width: 100%;
  }
`;

const GigPoster = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: #000;
`;

const GigInfo = styled.div`
  padding: 0.8rem 1rem 1.2rem;

  @media (max-width: 400px) {
    padding: 0.6rem 0.8rem 1rem;
  }
`;

const GigName = styled.h4`
  font-size: clamp(1.3rem, 4vw, 1.7rem);
  margin-bottom: 0.5rem;
  color: #eee;

  @media (max-width: 400px) {
    font-size: clamp(1.8rem, 5vw, 2rem);
    margin-bottom: 0.6rem;
  }
`;

const GigDetail = styled.p`
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 0.4rem;

  @media (max-width: 400px) {
    font-size: 0.9rem;
  }
`;