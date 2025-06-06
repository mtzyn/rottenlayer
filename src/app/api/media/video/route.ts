// src/app/api/media/video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient, getDatabaseName } from '@/lib/mongodb';

/**
 * Colección: 1 solo documento { _id, youtubeUrl }
 * Si no existe, GET devolverá { youtubeUrl: '' }
 */

// GET /api/media/video
export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const doc = await db.collection('video').findOne({});
    return NextResponse.json(doc ?? { youtubeUrl: '' });
  } catch (err) {
    console.error('[GET /api/media/video] Error:', err);
    return NextResponse.json({ message: 'Error fetching video' }, { status: 500 });
  }
}

// PUT /api/media/video   body: { youtubeUrl }
export async function PUT(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();
    if (!youtubeUrl) {
      return NextResponse.json({ message: 'youtubeUrl requerido' }, { status: 400 });
    }
    const client = await getMongoClient();
    const db = client.db(getDatabaseName());

    await db.collection('video').updateOne(
      {},
      { $set: { youtubeUrl } },
      { upsert: true }
    );

    return NextResponse.json({ youtubeUrl }, { status: 200 });
  } catch (err) {
    console.error('[PUT /api/media/video] Error:', err);
    return NextResponse.json({ message: 'Error updating video' }, { status: 500 });
  }
}