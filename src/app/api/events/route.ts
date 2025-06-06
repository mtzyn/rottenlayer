// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoClient, getDatabaseName } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  /**
   * GET /api/events?status=upcoming
   * GET /api/events?status=previous
   * GET /api/events          → devuelve todos
   */
  try {
    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const collection = db.collection('events');

    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status'); // "upcoming" | "previous" | null
    const now = new Date().toISOString();
    let filter: Record<string, any> = {};

    if (statusParam === 'upcoming') {
      filter = { date: { $gt: now } };
    } else if (statusParam === 'previous') {
      filter = { date: { $lte: now } };
    }

    const events = await collection.find(filter).sort({ date: 1 }).toArray();
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('[GET /api/events] Error:', error);
    return NextResponse.json({ message: 'Error fetching events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  /**
   * POST /api/events
   * Body JSON: { title, date, location, posterUrl, status? }
   */
  try {
    const body = await request.json();
    if (!body.title || !body.date || !body.location || !body.posterUrl) {
      return NextResponse.json({ message: 'Campos faltantes' }, { status: 400 });
    }

    const eventDate = new Date(body.date).toISOString();
    const now = new Date().toISOString();
    const status: 'upcoming' | 'previous' = eventDate > now ? 'upcoming' : 'previous';

    const newEvent = {
      title: body.title,
      date: eventDate,
      location: body.location,
      posterUrl: body.posterUrl,
      status,
    };

    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const collection = db.collection('events');

    const result = await collection.insertOne(newEvent);
    return NextResponse.json({ _id: result.insertedId, ...newEvent }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/events] Error:', error);
    return NextResponse.json({ message: 'Error creating event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  /**
   * PUT /api/events?id=<objectId>
   * Body JSON: { title?, date?, location?, posterUrl?, status? }
   */
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Falta parámetro id' }, { status: 400 });
    }

    const body = await request.json();
    const updates: Record<string, any> = {};

    if (body.title) updates.title = body.title;
    if (body.date) updates.date = new Date(body.date).toISOString();
    if (body.location) updates.location = body.location;
    if (body.posterUrl) updates.posterUrl = body.posterUrl;
    if (body.status === 'upcoming' || body.status === 'previous') {
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'Nada para actualizar' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const collection = db.collection('events');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    // Ahora comprobamos también que 'result' no sea null
    if (!result || !result.value) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
    }
    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/events] Error:', error);
    return NextResponse.json({ message: 'Error updating event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  /**
   * DELETE /api/events?id=<objectId>
   */
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Falta parámetro id' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db(getDatabaseName());
    const collection = db.collection('events');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Evento eliminado' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/events] Error:', error);
    return NextResponse.json({ message: 'Error deleting event' }, { status: 500 });
  }
}