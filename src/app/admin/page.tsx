'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Oswald, Metal_Mania } from 'next/font/google';
import { useRouter } from 'next/navigation';

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  posterUrl: string;
  status: 'upcoming' | 'previous';
}

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123';
const POSTER_CHOICES = [
  'EventoMantra.jpeg', 'MetalSouls.webp', 'AZKABAN.webp', 'SemanaU.webp',
  'MantraAmonSolar.webp', 'metalfest.webp', 'palenque.webp'
];

const oswald = Oswald({ weight: ['400', '700'], subsets: ['latin'] });
const metalMania = Metal_Mania({ weight: '400', subsets: ['latin'] });

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    font-family: ${oswald.style.fontFamily};
  }
`;

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({ title: '', date: '', location: '' });
  const [customStatus, setCustomStatus] = useState<'auto' | 'upcoming' | 'previous'>('auto');
  const [errorMessage, setErrorMessage] = useState('');
  const [posterType, setPosterType] = useState<'upload' | 'choose'>('upload');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<string>(POSTER_CHOICES[0]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authenticated) fetchEvents();
  }, [authenticated]);

  async function fetchEvents() {
    try {
      const res = await fetch('/api/events', { cache: 'no-store' });
      const data: Event[] = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (passwordInput === ADMIN_KEY) {
      setAuthenticated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Clave incorrecta');
    }
    setPasswordInput('');
  }

  function handlePosterFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setPosterFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  }

  function handlePosterSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    setSelectedPoster(e.target.value);
    setPreviewUrl(`/event-posters/${e.target.value}`);
  }

  async function handleAddEvent(e: FormEvent) {
    e.preventDefault();
    const { title, date, location } = formData;
    let posterUrl = '';

    if (!title || !date || !location) {
      setErrorMessage('Completa todos los campos del formulario');
      return;
    }
    setIsUploading(true);

    if (posterType === 'upload') {
      if (!posterFile) {
        setErrorMessage('Selecciona una imagen para subir');
        setIsUploading(false);
        return;
      }
      const formDataImg = new FormData();
      formDataImg.append('file', posterFile);
      const res = await fetch('/api/upload', { method: 'POST', body: formDataImg });
      if (!res.ok) {
        setErrorMessage('Error al subir imagen');
        setIsUploading(false);
        return;
      }
      const data = await res.json();
      posterUrl = data.url;
    } else {
      posterUrl = `/event-posters/${selectedPoster}`;
    }

    const body: any = { title, date, location, posterUrl };
    if (customStatus !== 'auto') {
      body.status = customStatus;
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setFormData({ title: '', date: '', location: '' });
        setPosterFile(null);
        setPreviewUrl('');
        setCustomStatus('auto');
        setErrorMessage('');
        fetchEvents();
      } else {
        const errJson = await res.json();
        setErrorMessage(errJson.message || 'Error al agregar evento');
      }
    } catch (err) {
      setErrorMessage('Error de red al agregar evento');
    }
    setIsUploading(false);
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm('¿Eliminar este evento?')) return;
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchEvents();
      else {
        const errJson = await res.json();
        alert(errJson.message || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de red al eliminar evento');
    }
  }

  function handleLogout() {
    setAuthenticated(false);
    setPasswordInput('');
    setFormData({ title: '', date: '', location: '' });
    setCustomStatus('auto');
    setErrorMessage('');
    setPosterType('upload');
    setPosterFile(null);
    setSelectedPoster(POSTER_CHOICES[0]);
    setPreviewUrl('');
    setIsUploading(false);
    setEvents([]);
  }

  if (!authenticated) {
    return (
      <>
        <GlobalStyle />
        <AuthContainer>
          <AuthTitle className={metalMania.className}>Panel de Administración</AuthTitle>
          <AuthForm onSubmit={handlePasswordSubmit}>
            <AuthInput
              type="password"
              placeholder="Clave de acceso"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <AuthButton type="submit">Entrar</AuthButton>
          </AuthForm>
          {errorMessage && <AuthError>{errorMessage}</AuthError>}
        </AuthContainer>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <AdminWrapper className={oswald.className}>
        <HeaderAdmin>
          <TitleAdmin className={metalMania.className}>Administrar Eventos</TitleAdmin>
          <LogoutButton onClick={handleLogout}>Salir</LogoutButton>
        </HeaderAdmin>

        <SectionAdmin>
          <SectionTitleAdmin className={metalMania.className}>Agregar Nuevo Evento</SectionTitleAdmin>
          <EventForm onSubmit={handleAddEvent} encType="multipart/form-data">
            <FormField>
              <FormLabel>Título:</FormLabel>
              <FormInput
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </FormField>
            <FormField>
              <FormLabel>Fecha y hora:</FormLabel>
              <FormInput
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </FormField>
            <FormField>
              <FormLabel>Ubicación:</FormLabel>
              <FormInput
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </FormField>
            <FormField>
              <FormLabel>Póster del evento:</FormLabel>
              <RadioGroup>
                <label>
                  <input
                    type="radio"
                    checked={posterType === 'upload'}
                    onChange={() => {
                      setPosterType('upload');
                      setPreviewUrl('');
                    }}
                  />
                  Subir nueva imagen (.webp, .jpg, .png)
                </label>
                <label>
                  <input
                    type="radio"
                    checked={posterType === 'choose'}
                    onChange={() => {
                      setPosterType('choose');
                      setPreviewUrl(`/event-posters/${selectedPoster}`);
                    }}
                  />
                  Elegir existente
                </label>
              </RadioGroup>
              {posterType === 'upload' && (
                <FormInput
                  type="file"
                  accept=".webp,.png,.jpg,.jpeg"
                  onChange={handlePosterFileChange}
                />
              )}
              {posterType === 'choose' && (
                <Select value={selectedPoster} onChange={handlePosterSelectChange}>
                  {POSTER_CHOICES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Select>
              )}
              {previewUrl && (
                <PosterPreview>
                  <img src={previewUrl} alt="preview" width={110} height={140} />
                </PosterPreview>
              )}
            </FormField>
            <FormField>
              <FormLabel>Tipo de evento:</FormLabel>
              <Select
                value={customStatus}
                onChange={e => setCustomStatus(e.target.value as any)}
              >
                <option value="auto">Automático según fecha</option>
                <option value="upcoming">Forzar como Próximo (upcoming)</option>
                <option value="previous">Forzar como Anterior (previous)</option>
              </Select>
            </FormField>
            <SubmitButton type="submit" disabled={isUploading}>
              {isUploading ? 'Subiendo...' : 'Añadir Evento'}
            </SubmitButton>
          </EventForm>
          {errorMessage && <FormError>{errorMessage}</FormError>}
        </SectionAdmin>

        <SectionAdmin>
          <SectionTitleAdmin className={metalMania.className}>Eventos Existentes</SectionTitleAdmin>
          {events.length === 0 ? (
            <p>No hay eventos.</p>
          ) : (
            <EventsList>
              {events.map((evt) => (
                <EventItem key={evt._id}>
                  <EventInfoAdmin>
                    <strong>{evt.title}</strong> —{' '}
                    {new Date(evt.date).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    — {evt.location} — <em>{evt.status}</em>
                  </EventInfoAdmin>
                  <DeleteButton onClick={() => handleDeleteEvent(evt._id)}>Eliminar</DeleteButton>
                </EventItem>
              ))}
            </EventsList>
          )}
        </SectionAdmin>
      </AdminWrapper>
    </>
  );
}

// ----- ESTILOS -----
const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #181818;
  color: #eee;
`;

const AuthTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  margin-bottom: 1.5rem;
  color: #f31212;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const AuthInput = styled.input`
  padding: 0.8rem 1rem;
  font-size: 1.1rem;
  border-radius: 6px;
  border: 2px solid #f31212;
  background: #1f1f1f;
  color: #eee;
  width: 250px;
`;

const AuthButton = styled.button`
  padding: 0.8rem 1.6rem;
  font-size: 1.1rem;
  background: #f31212;
  color: #111;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #d10b0b; }
`;

const AuthError = styled.p`
  margin-top: 1rem;
  color: #f31212;
`;

const AdminWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #181818;
  color: #eee;
`;

const HeaderAdmin = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const TitleAdmin = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  color: #f31212;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
`;

const LogoutButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: #f31212;
  color: #111;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  &:hover { background: #d10b0b; }
`;

const SectionAdmin = styled.section`
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionTitleAdmin = styled.h2`
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  margin-bottom: 1rem;
  color: #f31212;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
`;

const EventForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  margin-bottom: 1rem;
  width: 100%;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-size: 1rem;
  margin-bottom: 0.3rem;
  color: #ddd;
`;

const FormInput = styled.input`
  padding: 0.6rem 1rem;
  font-size: 1rem;
  background: #1f1f1f;
  border: 2px solid #f31212;
  color: #eee;
  border-radius: 4px;
`;

const Select = styled.select`
  margin-top: 0.5rem;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border-radius: 4px;
  background: #181818;
  color: #eee;
  border: 2px solid #f31212;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
`;

const PosterPreview = styled.div`
  margin-top: 0.7rem;
  img {
    border-radius: 6px;
    border: 1.5px solid #333;
    box-shadow: 0 3px 10px #000a;
    object-fit: contain;
    width: 110px;
    height: 140px;
    background: #000;
  }
`;

const SubmitButton = styled.button`
  padding: 0.8rem 1.6rem;
  background: #f31212;
  color: #111;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  width: fit-content;
  &:hover { background: #d10b0b; }
`;

const FormError = styled.p`
  color: #f31212;
  margin-top: 0.5rem;
`;

const EventsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 600px;
`;

const EventItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1f1f1f;
  padding: 0.8rem 1rem;
  border: 2px solid #f31212;
  border-radius: 6px;
  margin-bottom: 0.8rem;
`;

const EventInfoAdmin = styled.div`
  color: #ddd;
  font-size: 0.95rem;
  strong { color: #eee; }
`;

const DeleteButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: #d10b0b;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #b00909; }
`;