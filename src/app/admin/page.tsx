'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Oswald, Metal_Mania } from 'next/font/google';
import { useRouter } from 'next/navigation';

/** Convierte cualquier JSON en un array seguro */
const toArray = <T,>(data: unknown): T[] =>
  Array.isArray(data) ? (data as T[]) : [];

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  posterUrl: string;
  status: 'upcoming' | 'previous';
}

interface MerchItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
}

interface PhotoItem {
  _id: string;
  url: string;
  alt?: string;
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
  const [merch, setMerch] = useState<MerchItem[]>([]);
  const [merchForm, setMerchForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    sizes: [] as string[],
  });
  const [merchPosterFile, setMerchPosterFile] = useState<File | null>(null);
  const [merchPreviewUrl, setMerchPreviewUrl] = useState<string>('');
  const [isUploadingMerch, setIsUploadingMerch] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoAlt, setPhotoAlt] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [videoUrl, setVideoUrl] = useState('');
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);

  const [section, setSection] = useState<'events' | 'merch' | 'media'>('events');

  const router = useRouter();

  useEffect(() => {
    if (authenticated) {
      fetchEvents();
      fetchMerch();
      fetchPhotos();
      fetchVideo();
    }
  }, [authenticated]);

  async function fetchEvents() {
    try {
      const res = await fetch('/api/events', { cache: 'no-store' });
      const data = await res.json();
      setEvents(toArray<Event>(data));   // siempre array, aun si backend falla
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);                     // evita objeto inesperado
    }
  }

  async function fetchMerch() {
    try {
      const res = await fetch('/api/merch', { cache: 'no-store' });
      const data = await res.json();
      setMerch(toArray<MerchItem>(data));
    } catch (err) {
      console.error('Error fetching merch:', err);
      setMerch([]);
    }
  }

  async function fetchPhotos() {
    try {
      const res = await fetch('/api/media', { cache: 'no-store' });
      const data = await res.json();
      setPhotos(toArray<PhotoItem>(data));
    } catch {
      setPhotos([]);
    }
  }

  async function fetchVideo() {
    try {
      const res = await fetch('/api/media/video', { cache: 'no-store' });
      const data = await res.json();
      setVideoUrl(data?.youtubeUrl || '');
    } catch {
      setVideoUrl('');
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

  function handleMerchFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setMerchPosterFile(file);
    setMerchPreviewUrl(file ? URL.createObjectURL(file) : '');
  }
  async function handleAddMerch(e: FormEvent) {
    e.preventDefault();
    const { title, description, price, category, sizes } = merchForm;
    if (!title || !description || !price || !category || !merchPosterFile) {
      setErrorMessage('Completa todos los campos de MERCH');
      return;
    }
    setIsUploadingMerch(true);

    // upload image
    const fd = new FormData();
    fd.append('file', merchPosterFile);
    const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!upRes.ok) {
      setErrorMessage('Error al subir imagen de merch');
      setIsUploadingMerch(false);
      return;
    }
    const { url } = await upRes.json();

    const body = { title, description, price: Number(price), category, sizes, imageUrl: url };
    try {
      const res = await fetch('/api/merch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setMerchForm({ title: '', description: '', price: '', category: '', sizes: [] });
        setMerchPosterFile(null);
        setMerchPreviewUrl('');
        fetchMerch();
        setErrorMessage('');
      } else {
        const errJson = await res.json();
        setErrorMessage(errJson.message || 'Error al agregar producto');
      }
    } catch {
      setErrorMessage('Error de red al agregar producto');
    }
    setIsUploadingMerch(false);
  }

  async function handleDeleteMerch(id: string) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/merch?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchMerch();
      else alert('Error al eliminar producto');
    } catch {
      alert('Error de red al eliminar producto');
    }
  }

  function handlePhotoFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
  }

  async function handleAddPhoto(e: FormEvent) {
    e.preventDefault();
    if (!photoFile) {
      setErrorMessage('Selecciona una imagen de la galería');
      return;
    }
    setIsUploadingPhoto(true);
    const fd = new FormData();
    fd.append('file', photoFile);
    const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!upRes.ok) {
      setErrorMessage('Error al subir imagen de galería');
      setIsUploadingPhoto(false);
      return;
    }
    const { url } = await upRes.json();
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, alt: photoAlt }),
      });
      if (res.ok) {
        setPhotoFile(null);
        setPhotoAlt('');
        setPhotoPreview('');
        fetchPhotos();
        setErrorMessage('');
      } else {
        setErrorMessage('Error al guardar en BD');
      }
    } catch {
      setErrorMessage('Error de red al guardar imagen');
    }
    setIsUploadingPhoto(false);
  }

  async function handleDeletePhoto(id: string) {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchPhotos();
      else alert('Error al eliminar foto');
    } catch {
      alert('Error de red al eliminar');
    }
  }

  async function handleUpdateVideo(e: FormEvent) {
    e.preventDefault();
    if (!videoUrl) return;
    setIsUpdatingVideo(true);
    try {
      await fetch('/api/media/video', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: videoUrl }),
      });
      setErrorMessage('');
    } catch {
      setErrorMessage('Error al actualizar video');
    }
    setIsUpdatingVideo(false);
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
    setMerch([]);
    setMerchForm({ title: '', description: '', price: '', category: '', sizes: [] });
    setMerchPosterFile(null);
    setMerchPreviewUrl('');
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

        {/* === TAB BAR === */}
        <TabBar>
          <TabButton $active={section === 'events'} onClick={() => setSection('events')}>
            Eventos
          </TabButton>
          <TabButton $active={section === 'merch'} onClick={() => setSection('merch')}>
            Merch
          </TabButton>
          <TabButton $active={section === 'media'} onClick={() => setSection('media')}>
            Media
          </TabButton>
        </TabBar>

        {section === 'events' && (
          <>
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
              {!Array.isArray(events) || events.length === 0 ? (
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
          </>
        )}

        {section === 'merch' && (
          <>
            <SectionAdmin>
              <SectionTitleAdmin className={metalMania.className}>Agregar Producto Merch</SectionTitleAdmin>
              <EventForm onSubmit={handleAddMerch} encType="multipart/form-data">
                <FormField>
                  <FormLabel>Título:</FormLabel>
                  <FormInput value={merchForm.title} onChange={e => setMerchForm({ ...merchForm, title: e.target.value })} />
                </FormField>
                <FormField>
                  <FormLabel>Descripción:</FormLabel>
                  <FormInput value={merchForm.description} onChange={e => setMerchForm({ ...merchForm, description: e.target.value })} />
                </FormField>
                <FormField>
                  <FormLabel>Precio:</FormLabel>
                  <FormInput type="number" value={merchForm.price} onChange={e => setMerchForm({ ...merchForm, price: e.target.value })} />
                </FormField>
                <FormField>
                  <FormLabel>Categoría:</FormLabel>
                  <FormInput value={merchForm.category} onChange={e => setMerchForm({ ...merchForm, category: e.target.value })} />
                </FormField>
                <FormField>
                  <FormLabel>Tallas disponibles:</FormLabel>
                  <RadioGroup>
                    {['S','M','L','XL'].map(sz => (
                      <label key={sz}>
                        <input
                          type="checkbox"
                          checked={merchForm.sizes.includes(sz)}
                          onChange={e => {
                            const next = e.target.checked
                              ? [...merchForm.sizes, sz]
                              : merchForm.sizes.filter(s => s !== sz);
                            setMerchForm({ ...merchForm, sizes: next });
                          }}
                        />
                        {sz}
                      </label>
                    ))}
                  </RadioGroup>
                </FormField>
                <FormField>
                  <FormLabel>Imagen (.webp/.jpg/.png):</FormLabel>
                  <FormInput type="file" accept=".webp,.png,.jpg,.jpeg" onChange={handleMerchFileChange} />
                  {merchPreviewUrl && (<PosterPreview><img src={merchPreviewUrl} alt="preview" width={110} height={140}/></PosterPreview>)}
                </FormField>
                <SubmitButton type="submit" disabled={isUploadingMerch}>
                  {isUploadingMerch ? 'Subiendo...' : 'Añadir Producto'}
                </SubmitButton>
              </EventForm>

              <SectionTitleAdmin className={metalMania.className}>Productos Merch Existentes</SectionTitleAdmin>
              {!Array.isArray(merch) || merch.length === 0 ? (
                <p>No hay productos.</p>
              ) : (
                <EventsList>
                  {merch.map((p) => (
                    <EventItem key={p._id}>
                      <EventInfoAdmin>
                        <strong>{p.title}</strong> — {p.category} — ${p.price.toFixed(2)} — [ {p.sizes.join(', ')} ]
                      </EventInfoAdmin>
                      <DeleteButton onClick={() => handleDeleteMerch(p._id)}>Eliminar</DeleteButton>
                    </EventItem>
                  ))}
                </EventsList>
              )}
            </SectionAdmin>
          </>
        )}
        {/* ======================= MEDIA ======================= */}
        {section === 'media' && (
          <>
            <SectionAdmin>
              <SectionTitleAdmin className={metalMania.className}>Video Destacado (YouTube)</SectionTitleAdmin>
              <EventForm onSubmit={handleUpdateVideo}>
                <FormField>
                  <FormLabel>URL de YouTube (embed o normal):</FormLabel>
                  <FormInput value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                </FormField>
                <SubmitButton type="submit" disabled={isUpdatingVideo}>
                  {isUpdatingVideo ? 'Guardando...' : 'Guardar Video'}
                </SubmitButton>
              </EventForm>
            </SectionAdmin>

            <SectionAdmin>
              <SectionTitleAdmin className={metalMania.className}>Agregar Foto a Galería</SectionTitleAdmin>
              <EventForm onSubmit={handleAddPhoto} encType="multipart/form-data">
                <FormField>
                  <FormLabel>Imagen (.webp/.jpg/.png):</FormLabel>
                  <FormInput type="file" accept=".webp,.png,.jpg,.jpeg" onChange={handlePhotoFileChange} />
                  {photoPreview && (
                    <PosterPreview>
                      <img src={photoPreview} alt="preview" width={110} height={110} />
                    </PosterPreview>
                  )}
                </FormField>
                <FormField>
                  <FormLabel>Alt / Descripción corta (opcional):</FormLabel>
                  <FormInput value={photoAlt} onChange={(e) => setPhotoAlt(e.target.value)} />
                </FormField>
                <SubmitButton type="submit" disabled={isUploadingPhoto}>
                  {isUploadingPhoto ? 'Subiendo...' : 'Añadir Foto'}
                </SubmitButton>
              </EventForm>

              <SectionTitleAdmin className={metalMania.className}>Galería Existente</SectionTitleAdmin>
              {!Array.isArray(photos) || photos.length === 0 ? (
                <p>No hay fotos.</p>
              ) : (
                <EventsList>
                  {photos.map((ph) => (
                    <EventItem key={ph._id}>
                      <EventInfoAdmin>
                        <img src={ph.url} alt="thumb" width={50} style={{ marginRight: '0.5rem' }} />
                        {ph.alt || 'Sin descripción'}
                      </EventInfoAdmin>
                      <DeleteButton onClick={() => handleDeletePhoto(ph._id)}>Eliminar</DeleteButton>
                    </EventItem>
                  ))}
                </EventsList>
              )}
            </SectionAdmin>
          </>
        )}
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
  padding: 2rem;
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
  display: flex;
  align-items: center;
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
const TabBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 1.4rem;
  background: ${({ $active }) => ($active ? '#f31212' : '#1f1f1f')};
  color: ${({ $active }) => ($active ? '#111' : '#eee')};
  border: 2px solid #f31212;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.25s, color 0.25s;

  &:hover {
    background: #f31212;
    color: #111;
  }
`;