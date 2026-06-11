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
    const chains = await db
      .collection("episodic_memory")
      .find({ q_final: { $gte: 0.7 } })
      .project({ query: 1, failure_mode: 1, q_final: 1, _id: 0 })
      .sort({ _id: -1 })
      .limit(10)
      .toArray();
    return { success: true, data: chains || [] };
  } catch (err) {
    cachedClient = null;
    clientPromise = null;
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[recent-chains] Error:", errorMessage);
    setResponseStatus(event, 500);
    return { success: false, error: "Unable to fetch verified chains" };
  }
});
