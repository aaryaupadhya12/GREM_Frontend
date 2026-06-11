import { getDb } from "@/lib/mongo";

export default defineEventHandler(async (event) => {
  try {
    const db = await getDb();
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
