import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Solo permitir webp, png, jpg, jpeg
  if (!['image/webp', 'image/png', 'image/jpeg'].includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const uint8arr = new Uint8Array(arrayBuffer);

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const savePath = path.join(process.cwd(), 'public', 'event-posters', fileName);

  await fs.writeFile(savePath, uint8arr);

  return NextResponse.json({ url: `/event-posters/${fileName}` });
}