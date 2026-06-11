import { getDb } from "@/lib/mongo";

export default defineEventHandler(async (event) => {
  try {
    const db = await getDb();
    const metrics = await db.collection("final_metrics").findOne({});

    if (!metrics) {
      setResponseStatus(event, 404);
      return {
        success: false,
        error: "No metrics found",
      };
    }

    const { _id, ...payload } = metrics;
    return {
      success: true,
      data: payload,
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
