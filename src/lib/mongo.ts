import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  if (!cachedClient) {
    cachedClient = await MongoClient.connect(mongoUri);
  }

  cachedDb = cachedClient.db("GREM");
  return cachedDb;
}
