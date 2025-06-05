'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { Oswald, Metal_Mania } from 'next/font/google';
import { loadFull } from 'tsparticles';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

// Tipografía firme y geométrica para el sitio entero
const oswald = Oswald({ weight: ['400', '700'], subsets: ['latin'] });
// Tipografía "metal" para el texto hero principal y títulos
const metalMania = Metal_Mania({ weight: '400', subsets: ['latin'] });

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Band', href: '/band' },
  { label: 'Gigs', href: '/gigs' },
  { label: 'Merch', href: '/merch' },
  { label: 'Media', href: '/media' },
  { label: 'Contact', href: '/contact' },
];

export default function BandPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesOptions: any = {
    particles: {
      number: { value: 100, density: { enable: true, area: 800 } },
      color: { value: "#777777" },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.1, max: 0.4 },
        anim: { enable: true, speed: 0.5, min: 0.1, sync: false }
      },
      size: { value: { min: 1, max: 4 } },
      move: { direction: "top", enable: true, speed: 0.8, outModes: { default: "out" } }
    },
    interactivity: {
      detectsOn: "canvas",
      events: { onHover: { enable: false }, onClick: { enable: false } },
      resize: { enable: true }
    },
    detectRetina: true,
    background: { color: "" }
  };

  // Función para compartir el evento usando Web Share API o copiar al portapapeles
  const handleShare = () => {
    const shareData = {
      title: 'Rötten Layer – Upcoming Event',
      text: 'Join us on July 5, 2025 at Puntarenas · Copas Bar y Cevichera!',
      url: window.location.href
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((err) => console.error('Error sharing:', err));
    } else {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => alert('Link copied to clipboard!'))
        .catch((err) => console.error('Error copying link:', err));
    }
  };

  return (
    <Wrapper className={oswald.className}>
      <HeroBg>
        {init && (
          <Particles
            id="tsparticles"
            options={particlesOptions}
            style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}
          />
        )}
        <AnimatedBackground
          src="/DSC_1151.jpg"
          alt="Background"
          fill
          sizes="100vw"
          priority
        />
        <DarkOverlay />
      </HeroBg>

      {/* ===== Navbar sin cambios ===== */}
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

      {/* ===== Contenido principal ===== */}
      <ContentContainer>
        <HeroSection>
          <HeroTitle className={metalMania.className}>Rötten Layer</HeroTitle>
          <HeroSubtitle>Death Thrash Metal Band from Costa Rica</HeroSubtitle>
        </HeroSection>

        {/* About the Band */}
        <Section>
          <SectionTitle className={metalMania.className}>About the Band</SectionTitle>
          <SectionBox>
            <Paragraph>
              Rötten Layer is an emerging metal band from Costa Rica. Their musical style fuses elements of heavy and thrash metal, delivering a raw and visceral aesthetic that has captured the attention of the national underground scene. The band describes itself as <strong>“the layer that blooms after rotting, what lives after death.”</strong> Since their formation, Rötten Layer has shared the stage with prominent Costa Rican metal acts such as Mantra and Carnosity, establishing themselves as one of the most promising new forces in the local genre.
            </Paragraph>
          </SectionBox>
        </Section>

        {/* Band Members */}
        <Section>
          <SectionTitle className={metalMania.className}>Band Members</SectionTitle>
          <SectionBox>
            <MembersGrid>
              <MemberCard>
                <CardImageWrapper>
                  <Image
                    src="/jau.webp"
                    alt="Joshua – Rhythm Guitar"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </CardImageWrapper>
                <MemberName>Joshua</MemberName>
                <MemberRole>Rhythm Guitar</MemberRole>
              </MemberCard>

              <MemberCard>
                <CardImageWrapper>
                  <Image
                    src="/jack.webp"
                    alt="Jack – Lead Guitar & Vocals"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </CardImageWrapper>
                <MemberName>Jack</MemberName>
                <MemberRole>Lead Guitar &amp; Vocals</MemberRole>
              </MemberCard>

              <MemberCard>
                <CardImageWrapper>
                  <Image
                    src="/nath.webp"
                    alt="Nathan – Bass Guitar"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </CardImageWrapper>
                <MemberName>Nathan</MemberName>
                <MemberRole>Bass Guitar</MemberRole>
              </MemberCard>

              <MemberCard>
                <CardImageWrapper>
                  <Image
                    src="/ed.webp"
                    alt="Ed Calderon – Drums"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </CardImageWrapper>
                <MemberName>Ed Calderon</MemberName>
                <MemberRole>Drums</MemberRole>
              </MemberCard>
            </MembersGrid>
          </SectionBox>
        </Section>

        {/* Upcoming Event */}
        <Section>
          <SectionTitle className={metalMania.className}>Upcoming Event</SectionTitle>
          <SectionBox>
            <EventCard>
              <PosterFrame>
                <Image
                  src="/EventoMantra.jpeg"
                  alt="Poster Evento junto a Mantra"
                  width={300}
                  height={450}
                  style={{ objectFit: 'contain', borderRadius: '4px' }}
                  priority
                />
              </PosterFrame>

              <EventInfo>
                <DetailItem>
                  <strong>Date:</strong> July 5, 2025
                </DetailItem>
                <DetailItem>
                  <strong>Location:</strong> Puntarenas · Copas Bar y Cevichera
                </DetailItem>
                <ShareButton onClick={handleShare}>Share Event</ShareButton>
              </EventInfo>
            </EventCard>
          </SectionBox>
        </Section>

        {/* Social Links */}
        <Section>
          <SectionTitle className={metalMania.className}>Social Links</SectionTitle>
          <SectionBox>
            <SocialList>
              <SocialItem>
                <SocialIconLink
                  href="https://www.instagram.com/rottenlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={32} color="#eee" />
                </SocialIconLink>
              </SocialItem>
              <SocialItem>
                <SocialIconLink
                  href="https://www.facebook.com/rottenlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook size={32} color="#eee" />
                </SocialIconLink>
              </SocialItem>
              <SocialItem>
                <SocialIconLink
                  href="https://www.tiktok.com/@rottenlayer_"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiTiktok size={32} color="#eee" />
                </SocialIconLink>
              </SocialItem>
              <SocialItem>
                <SocialIconLink
                  href="https://www.youtube.com/@rottenlayer_"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaYoutube size={32} color="#eee" />
                </SocialIconLink>
              </SocialItem>
            </SocialList>
          </SectionBox>
        </Section>
      </ContentContainer>
    </Wrapper>
  );
}

/* ==== ANIMACIONES ==== */

const bgPulse = keyframes`
  0% { transform: scale(1) }
  50% { transform: scale(1.015) }
  100% { transform: scale(1) }
`;

/* ==== STYLED COMPONENTS ==== */

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #181818;
  color: #eee;
`;

const HeroBg = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
`;

const AnimatedBackground = styled(Image)`
  width: 100vw !important;
  height: 100vh !important;
  object-fit: cover;
  object-position: center;
  filter: blur(4px);
  z-index: -1;

  & > img {
    animation: ${bgPulse} 40s ease-in-out infinite;
    width: 100vw !important;
    height: 100vh !important;
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

/* ==== NAVBAR ==== */

const Header = styled.header`
  width: 100%;
  height: 70px;
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

  @media (min-width: 900px) {
    display: none;
  }
`;

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
    padding: 0.7rem 1.8rem;
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

/* ==== CONTENIDO ==== */

const ContentContainer = styled.main`
  position: relative;
  z-index: 2;
  padding-top: 120px;     /* Espacio para navbar */
  max-width: 900px;       /* Un poco más ancho para cards */
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 4rem;   /* Más espacio abajo */
  text-align: center;
`;

const HeroSection = styled.section`
  margin-bottom: 4rem;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  color: #f31212;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
`;

const HeroSubtitle = styled.p`
  font-size: 2rem;
  font-weight: 400;
  opacity: 0.8;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f31212;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
`;

const SectionBox = styled.div`
  background: rgba(0, 0, 0, 0.65);  /* Semitransparente para destacar sobre fondo */
  border: 2px solid #f31212;
  border-radius: 8px;
  padding: 2rem;
  margin: 0 auto;
  max-width: 100%;
`;

const Paragraph = styled.p`
  font-size: 1.3rem;
  line-height: 1.6;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
`;

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
  justify-items: center;
`;

const MemberCard = styled.div`
  background: #1f1f1f;
  border: 2px solid #f31212;
  border-radius: 6px;
  padding: 1rem;
  width: 180px;            /* Ajustado para contener la imagen + texto */
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
`;

const CardImageWrapper = styled.div`
  position: relative;
  width: 160px;            /* Especificado por el usuario */
  height: 180px;           /* Especificado por el usuario */
  margin: 0 auto 0.8rem;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #333;
`;

const MemberName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
  color: #eee;
`;

const MemberRole = styled.p`
  font-size: 0.95rem;
  color: #ccc;
`;

const EventCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1f1f1f;
  border: 2px solid #f31212;
  border-radius: 6px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);

  @media (min-width: 600px) {
    flex-direction: row;
    gap: 2.5rem;
    justify-content: center;
  }
`;

const PosterFrame = styled.div`
  /* Permitir que la imagen use objectFit: 'contain' sin recortarse */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;          /* Fondo negro puro para que resalte el póster */
  border: 2px solid #333;
  border-radius: 4px;
  width: 300px;              /* Ancho fijo del póster */
  height: 200px;             /* Alto fijo del póster */
  overflow: hidden;
`;

const EventInfo = styled.div`
  margin-top: 2rem;           /* Separación en pantallas pequeñas */
  text-align: center;
  max-width: 300px;           /* Limita ancho en desktop para mantener proporciones */

  @media (min-width: 600px) {
    margin-top: 0;
    margin-left: 2rem;       /* Espacio a la izquierda del póster */
    text-align: left;
  }
`;

const DetailItem = styled.p`
  font-size: 1.3rem;
  line-height: 1.6;
  color: #ddd;
  margin-bottom: 0.8rem;
`;

const ShareButton = styled.button`
  margin-top: 1.2rem;
  background: #f31212;
  color: #181818;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
  transition: transform 0.2s, background 0.25s;

  &:hover {
    background: #e10f0f;
    transform: scale(1.05);
  }
`;

const SocialList = styled.ul`
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  list-style: none;
  padding: 0;
`;

const SocialItem = styled.li``;

const SocialIconLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;             /* Padding ajustado para los iconos */
  border: 1px solid #333;
  border-radius: 4px;
  transition: transform 0.2s, background 0.25s;

  &:hover {
    background: rgba(243, 18, 18, 0.2);
    transform: scale(1.1);
  }
`;