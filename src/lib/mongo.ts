import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getDb(): Promise<Db> {
  // Check if we have a healthy cached client
  if (cachedClient?.topology?.isConnected()) {
    return cachedDb!;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  // Use promise-based client creation to avoid race conditions
  if (!clientPromise) {
    clientPromise = MongoClient.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
    }).catch(err => {
      clientPromise = null;
      cachedClient = null;
      cachedDb = null;
      throw err;
    });
  }

  try {
    cachedClient = await clientPromise;
    cachedDb = cachedClient.db("GREM");
    return cachedDb;
  } catch (err) {
    clientPromise = null;
    cachedClient = null;
    cachedDb = null;
    throw err;
  }
}
