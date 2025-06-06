// src/app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoClient, getDatabaseName } from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const photos = await db.collection('media').find().sort({ _id: -1 }).toArray();
    return NextResponse.json(photos);
  } catch (err) {
    console.error('[GET /api/media] Error:', err);
    return NextResponse.json({ message: 'Error fetching photos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, alt } = await req.json();
    if (!url) {
      return NextResponse.json({ message: 'Missing url' }, { status: 400 });
    }
    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const result = await db.collection('media').insertOne({ url, alt });
    return NextResponse.json({ _id: result.insertedId, url, alt }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/media] Error:', err);
    return NextResponse.json({ message: 'Error adding photo' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 });

    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const result = await db.collection('media').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Photo not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Photo deleted' });
  } catch (err) {
    console.error('[DELETE /api/media] Error:', err);
    return NextResponse.json({ message: 'Error deleting photo' }, { status: 500 });
  }
}