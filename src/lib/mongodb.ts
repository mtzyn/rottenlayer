// src/lib/mongodb.ts
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;

if (!MONGODB_URI) {
  throw new Error('Define la variable de entorno MONGODB_URI en .env.local');
}
if (!MONGODB_DB_NAME) {
  throw new Error('Define la variable de entorno MONGODB_DB_NAME en .env.local');
}

// Aquí guardamos el cliente en caché para no abrir múltiples conexiones
let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (cachedClient) {
    // Si ya existe un cliente, lo devolvemos directamente
    return cachedClient;
  }
  // Si no existe aún, creamos uno nuevo y lo conectamos
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export function getDatabaseName() {
  return MONGODB_DB_NAME;
}