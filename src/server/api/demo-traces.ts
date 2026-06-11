import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient() {
  if (cachedClient?.topology?.isConnected()) {
    return cachedClient;
  }
  
  if (!clientPromise) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI environment variable is not set");
    
    clientPromise = MongoClient.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }).catch(err => {
      clientPromise = null;
      throw err;
    });
  }
  
  cachedClient = await clientPromise;
  return cachedClient;
}

export default defineEventHandler(async (event) => {
  try {
    const client = await getClient();
    const db = client.db("GREM");
    const traces = await db
      .collection("demo_traces")
      .find({})
      .sort({ demo_id: 1 })
      .limit(5)
      .toArray();
    return { success: true, data: traces || [] };
  } catch (err) {
    cachedClient = null;
    clientPromise = null;
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[demo-traces] Error:", errorMessage);
    setResponseStatus(event, 500);
    return { success: false, error: "Demo traces temporarily unavailable" };
  }
});
