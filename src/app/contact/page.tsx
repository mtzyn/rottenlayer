// src/app/contact/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import Image from 'next/image';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import Link from 'next/link';
import { Oswald, Metal_Mania } from 'next/font/google';

const oswald = Oswald({ weight: ['400', '700'], subsets: ['latin'] });
const metalMania = Metal_Mania({ weight: '400', subsets: ['latin'] });

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Band', href: '/band' },
  { label: 'Gigs', href: '/gigs' },
  { label: 'Merch', href: '/merch' },
  { label: 'Media', href: '/media' },
  { label: 'Contact', href: '/contact' },
];

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin:0; padding:0; overflow-x:hidden; }
`;

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');

  return (
    <>
      <GlobalStyle />
      <Wrapper className={oswald.className}>
        <HeroBg>
          <Particles
            id="tsparticles"
            options={particlesOptions as any}
            style={{ position: 'absolute', inset: 0, zIndex: 0 }}
          />
          <AnimatedBackground src="/DC1.webp" alt="" fill sizes="100%" priority />
          <DarkOverlay />
        </HeroBg>

        {/* NAVBAR */}
        <Header>
          <LogoLink href="/">
            <Image src="/logo.png" alt="Rotten Layer Logo" width={64} height={64} priority />
          </LogoLink>
          <Nav>
            <NavToggle onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '✕' : '☰'}</NavToggle>
            <NavList className={menuOpen ? 'open' : ''}>
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <NavLink href={href}>{label}</NavLink>
                </li>
              ))}
            </NavList>
          </Nav>
        </Header>

        {/* CONTENT */}
        <ContentContainer>
          <Section>
            <SectionTitle className={metalMania.className}>Contact Us</SectionTitle>
            {sent ? (
              <ThankYou>Your message has been sent — we’ll get back to you soon! 🤘</ThankYou>
            ) : (
              <FormCard>
                <Form
                  onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    setError('');
                    setSending(true);
                    try {
                      const res = await fetch('https://formspree.io/f/xwpbvpzn', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                        body: JSON.stringify(formData),
                      });
                      if (res.ok) {
                        setSent(true);
                        setFormData({ name: '', email: '', message: '' });
                      } else {
                        setError('Something went wrong while sending. Please try again later.');
                      }
                    } catch {
                      setError('Network error. Please try again later.');
                    } finally {
                      setSending(false);
                    }
                  }}
                >
                  <Input
                    name="name"
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <TextArea
                    name="message"
                    placeholder="Message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                  {error && <ErrorMsg>{error}</ErrorMsg>}
                  <Submit type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send'}</Submit>
                </Form>
              </FormCard>
            )}
          </Section>
        </ContentContainer>
      </Wrapper>
    </>
  );
}

/* ===== particles ===== */
const init = true;

const particlesOptions = {
  particles: {
    number: { value: 90, density: { enable: true, area: 800 } },
    color: { value: '#666' },
    shape: { type: 'circle' },
    opacity: { value: 0.4 },
    size: { value: { min: 1, max: 3 } },
    move: { enable: true, speed: 0.6, direction: 'top', outModes: { default: 'out' } },
  },
  interactivity: { events: { resize: { enable: true } } },
  detectRetina: true,
};

/* ===== styled-components reutilizando estética ===== */
const bgPulse = keyframes`0%{transform:scale(1)}50%{transform:scale(1.02)}100%{transform:scale(1)}`;

const Wrapper = styled.div`width:100%;min-height:100vh;position:relative;background:#181818;color:#eee;`;
const HeroBg = styled.div`position:fixed;inset:0;pointer-events:none;z-index:0;`;
const AnimatedBackground = styled(Image)`width:100%!important;height:100%!important;object-fit:cover;filter:blur(4px);z-index:-1;&>img{animation:${bgPulse}40s ease-in-out infinite;}`;
const DarkOverlay = styled.div`position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.2),#181818 95%);`;

const Header = styled.header`
  width:100%;height:60px;position:fixed;top:0;left:0;background:rgba(30,30,30,.77);
  backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:space-between;
  z-index:10;border-bottom:1px solid rgba(60,60,60,.12);
  @media(max-width:500px){height:50px;}
`;
const LogoLink = styled(Link)`display:flex;align-items:center;height:82px;margin-left:1rem;
  img{width:82px;height:82px;}
  @media(max-width:500px){img{width:60px;height:60px;}height:50px;margin-left:.5rem;}
`;
const Nav = styled.nav`display:flex;align-items:center;position:absolute;right:2rem;
  @media(max-width:500px){right:1rem;}
`;
const NavToggle = styled.button`background:none;border:none;color:#eee;font-size:2rem;cursor:pointer;
  @media(min-width:900px){display:none;}
`;
const NavList = styled.ul`
  display:none;flex-direction:column;position:absolute;top:60px;right:0;min-width:140px;
  background:rgba(10,10,10,.95);border:1px solid rgba(255,255,255,.1);border-radius:6px;
  padding:.7rem 0;box-shadow:0 6px 30px rgba(0,0,0,.21);transition:.3s;
  &.open{display:flex;}
  @media(max-width:500px){top:50px;}
  @media(min-width:900px){
    position:static;display:flex;flex-direction:row;background:none;border:none;box-shadow:none;gap:3rem;padding:0;
  }
  li{list-style:none;}
`;
const NavLink = styled(Link)`
  color:#eee;font-weight:500;text-decoration:none;padding:.2em 0;font-size:1.08rem;
  border-bottom:2px solid transparent;transition:.2s;
  &:hover{border-bottom:2px solid #f31212;color:#fff;}
  @media(max-width:900px){
    display:block;padding:.7rem 1rem;font-weight:600;
    &:hover{background:rgba(189,0,0,.9);transform:translateX(8px);}
  }
`;

const ContentContainer = styled.main`
  position:relative;z-index:2;max-width:650px;margin:0 auto;padding:120px 1rem 4rem;text-align:center;
  @media(max-width:600px){padding-top:110px;}
  @media(max-width:400px){padding-top:100px;}
`;
const Section = styled.section`margin-bottom:3rem;`;
const SectionTitle = styled.h2`
  font-size:clamp(1.8rem,5vw,2.4rem);color:#f31212;margin-bottom:1.2rem;
  text-transform:uppercase;font-weight:400;text-shadow:1px 1px 3px rgba(0,0,0,.7);
`;
const FormCard = styled.div`
  margin: 0 auto;
  position: relative;
  width: 100%;
  max-width: 560px;
  padding: 3rem 2.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;

  /* glass‑blur panel */
  background: rgba(25, 25, 25, 0.35);
  backdrop-filter: blur(14px);

  /* neon frame created with a pseudo‑element so we can add a subtle glow */
  border-radius: 14px;
  overflow: hidden; /* keeps glow inside rounded corners */

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 2px;                 /* “thickness” of border */
    background: conic-gradient(
      from 180deg at 50% 50%,
      #f31212 0deg,
      #6f0505 120deg,
      #f31212 240deg,
      #6f0505 360deg
    );
    -webkit-mask: 
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);  /* makes only the ring visible */
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
    filter: drop-shadow(0 0 6px #f3121299);
  }
`;

const Form = styled.form`display:flex;flex-direction:column;gap:1.2rem;align-items:center;`;
const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1.1rem;
  font-size: 1rem;
  background: rgba(0, 0, 0, 0.55);
  color: #eee;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: border-color 0.25s, box-shadow 0.25s;

  &::placeholder { color: #aaa; }

  &:focus {
    outline: none;
    border-color: #f31212;
    box-shadow: 0 0 8px #f3121280;
    background: rgba(0, 0, 0, 0.65);
  }
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 0.9rem 1.1rem;
  font-size: 1rem;
  background: rgba(0, 0, 0, 0.55);
  color: #eee;
  border: 1px solid transparent;
  border-radius: 8px;
  resize: vertical;
  transition: border-color 0.25s, box-shadow 0.25s;

  &::placeholder { color: #aaa; }

  &:focus {
    outline: none;
    border-color: #f31212;
    box-shadow: 0 0 8px #f3121280;
    background: rgba(0, 0, 0, 0.65);
  }
`;
const Submit = styled.button`
  padding: 0.95rem 2.8rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #f31212 0%, #a10c0c 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.25s ease, opacity 0.25s;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(243, 18, 18, 0.45);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(243, 18, 18, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
const ThankYou = styled.p`font-size:1.15rem;color:#f31212;margin-top:2rem;`;

const ErrorMsg = styled.p`
  color: #f31212;
  font-size: 0.95rem;
  margin-top: 0.5rem;
`;