// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// `@vercel/blob` solo se necesita en producción (cuando Vercel define la env var VERCEL)
let put: typeof import('@vercel/blob').put | undefined;
if (process.env.VERCEL) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  put = require('@vercel/blob').put;
}

const ALLOWED_TYPES = ['image/webp', 'image/png', 'image/jpeg'];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
  }

  // Genera nombre único
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

  /* ────────────────────────────────
     1. PRODUCCIÓN (Vercel) -> Blob  */
  if (process.env.VERCEL && put) {
    const blob = await put(`event-posters/${fileName}`, file, {
      access: 'public',
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url }); // ← URL pública de Blob Storage
  }

  /* ────────────────────────────────
     2. LOCAL -> carpeta public/      */
  const arrayBuffer = await file.arrayBuffer();
  const uint8arr = new Uint8Array(arrayBuffer);

  const savePath = path.join(process.cwd(), 'public', 'event-posters', fileName);
  await fs.mkdir(path.dirname(savePath), { recursive: true });
  await fs.writeFile(savePath, uint8arr);

  return NextResponse.json({ url: `/event-posters/${fileName}` });
}