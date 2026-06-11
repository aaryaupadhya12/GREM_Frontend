import { MongoClient } from "mongodb";

// Cached MongoDB client to avoid reconnection on every request
let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  cachedClient = await MongoClient.connect(mongoUri);
  return cachedClient;
}

export default defineEventHandler(async (event) => {
  try {
    const client = await getClient();
    const db = client.db("GREM");

    // Fetch 5 demo trace documents sorted by demo_id
    const traces = await db
      .collection("demo_traces")
      .find({})
      .sort({ demo_id: 1 })
      .limit(5)
      .toArray();

    return {
      success: true,
      data: traces || [],
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    setResponseStatus(event, 500);
    return {
      success: false,
      error: errorMessage,
    };
  }
});
