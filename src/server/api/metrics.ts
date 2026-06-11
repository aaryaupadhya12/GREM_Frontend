import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI environment variable is not set");
  cachedClient = await MongoClient.connect(mongoUri);
  return cachedClient;
}

export default defineEventHandler(async (event) => {
  try {
    const client = await getClient();
    const db = client.db("GREM");
    const metrics = await db.collection("final_metrics").findOne({});
    if (!metrics) {
      setResponseStatus(event, 404);
      return { success: false, error: "No metrics found" };
    }
    const { _id, ...payload } = metrics as any;
    return { success: true, data: payload };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    setResponseStatus(event, 500);
    return { success: false, error: errorMessage };
  }
});
