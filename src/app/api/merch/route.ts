// src/app/api/merch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient, getDatabaseName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const merch = await db.collection('merch').find().toArray();
    return NextResponse.json(merch);
  } catch (error) {
    console.error('[GET /api/merch] Error:', error);
    return NextResponse.json({ message: 'Error fetching merch items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, price, imageUrl, category, sizes } = body;

    if (!title || !description || !price || !imageUrl || !category || !Array.isArray(sizes)) {
      return NextResponse.json({ message: 'Missing or invalid fields' }, { status: 400 });
    }

    const item = { title, description, price, imageUrl, category, sizes };

    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const result = await db.collection('merch').insertOne(item);

    return NextResponse.json({ _id: result.insertedId, ...item }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/merch] Error:', error);
    return NextResponse.json({ message: 'Error adding merch item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  /**
   * DELETE /api/merch?id=<objectId>
   */
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Missing id parameter' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const collection = db.collection('merch');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/merch] Error:', error);
    return NextResponse.json({ message: 'Error deleting merch item' }, { status: 500 });
  }
}