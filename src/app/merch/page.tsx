'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { Oswald, Metal_Mania } from 'next/font/google';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import Link from 'next/link';

const oswald = Oswald({ weight: ['400', '700'], subsets: ['latin'] });
const metalMania = Metal_Mania({ weight: '400', subsets: ['latin'] });

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
`;

interface MerchItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
}

export default function MerchPage() {
  const [items, setItems] = useState<MerchItem[]>([]);
  // talla seleccionada por item (key = _id)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const [init, setInit] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Band', href: '/band' },
    { label: 'Gigs', href: '/gigs' },
    { label: 'Merch', href: '/merch' },
    { label: 'Media', href: '/media' },
    { label: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    fetch('/api/merch')
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setInit(true));
  }, []);

  const buildWaLink = (title: string, size: string) =>
    `https://wa.me/50686482444?text=${encodeURIComponent(
      `Hola, quiero comprar la merch "${title}" en talla ${size}.`
    )}`;

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
          <AnimatedBackground src="/DS23.webp" alt="Background" fill sizes="100%" priority />
          <DarkOverlay />
        </HeroBg>

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

        <ContentContainer>
          <Section>
            <SectionTitle className={metalMania.className}>Merch</SectionTitle>
            <ItemsGrid>
              {items.map((item) => (
                <ItemCard key={item._id}>
                  <ImageWrapper>
                    <Image src={item.imageUrl} alt={item.title} fill style={{ objectFit: 'contain' }} />
                  </ImageWrapper>
                  <ItemInfo>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <strong>₡{item.price.toLocaleString('es-CR')}</strong>
                    <SizeList>
                      {item.sizes.map((size) => {
                        const active = selectedSizes[item._id] === size;
                        return (
                          <span
                            key={size}
                            className={active ? 'active' : ''}
                            onClick={() =>
                              setSelectedSizes((prev) => ({ ...prev, [item._id]: size }))
                            }
                          >
                            {size}
                          </span>
                        );
                      })}
                    </SizeList>
                    <BuyButton
                      href={buildWaLink(item.title, selectedSizes[item._id] || '')}
                      target="_blank"
                      disabled={!selectedSizes[item._id]}
                    >
                      BUY
                    </BuyButton>
                  </ItemInfo>
                </ItemCard>
              ))}
            </ItemsGrid>
          </Section>
        </ContentContainer>
      </Wrapper>
    </>
  );
}

const bgPulse = keyframes`
  0% { transform: scale(1) }
  50% { transform: scale(1.015) }
  100% { transform: scale(1) }
`;

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: #181818;
  color: #eee;
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
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.19), #181818 92%);
  z-index: 1;
`;

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
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 400;
  margin-bottom: 1.5rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f31212;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
`;

const ItemCard = styled.div`
  background: #1f1f1f;
  border: 2px solid #f31212;
  border-radius: 6px;
  padding: 0.8rem 0.6rem;   /* tighter padding vertically & horizontally */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  text-align: center;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 280px;        /* a bit wider for horizontal layout   */
  margin: 0 auto 1rem;
  aspect-ratio: 4 / 3;     /* wider aspect (horizontal)            */
  border: 2px solid #333;
  border-radius: 4px;
  background: #000;
  overflow: hidden;

  @media (max-width: 500px) {
    max-width: 200px;
  }
`;

const ItemInfo = styled.div`
  h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #eee;
  }
  p {
    font-size: 1rem;
    color: #ccc;
    margin-bottom: 0.5rem;
  }
  strong {
    font-size: 1.1rem;
    display: block;
    color: #fff;
    margin-bottom: 0.5rem;
  }
`;

const SizeList = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  span {
    padding: 0.3rem 0.6rem;
    background: #333;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #eee;
  }
  span.active {
    background: #f31212;
    color: #111;
  }
  span:hover {
    cursor: pointer;
    background: #555;
  }
`;

const BuyButton = styled.a<{ disabled?: boolean }>`
  display: inline-block;
  margin-top: 0.8rem;
  padding: 0.6rem 1.2rem;
  background: ${({ disabled }) => (disabled ? '#555' : '#f31212')};
  color: #111;
  font-weight: 700;
  border-radius: 6px;
  text-decoration: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.2s;

  &:hover {
    background: ${({ disabled }) => (disabled ? '#555' : '#d10b0b')};
  }
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