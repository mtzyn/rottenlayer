// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const ALLOWED_TYPES = ['image/webp', 'image/png', 'image/jpeg'];

/** Si corres en Vercel Edge, indica explícitamente runtime node */
export const runtime = 'nodejs'; // o quita esta línea si usas default

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

  /* ──────────── 1) PRODUCCIÓN (Vercel) -> Blob Storage ─────────── */
  if (process.env.VERCEL) {
    // import dinámico compatible con Edge/ESM:
    const { put } = await import('@vercel/blob');

    // ArrayBuffer es tipo válido para put():
    const arrayBuffer = await file.arrayBuffer();

    const blob = await put(`event-posters/${fileName}`, arrayBuffer, {
      access: 'public',
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  }

  /* ────────────── 2) LOCAL -> escribe en public/event-posters ───── */
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const savePath = path.join(process.cwd(), 'public', 'event-posters', fileName);
  await fs.mkdir(path.dirname(savePath), { recursive: true });
  await fs.writeFile(savePath, uint8);

  return NextResponse.json({ url: `/event-posters/${fileName}` });
}