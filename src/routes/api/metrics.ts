import { createServerFn } from "@tanstack/react-start/server";
import { getDb } from "@/lib/mongo";

export const getMetrics = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getDb();
    const metrics = await db.collection("final_metrics").findOne({});

    if (!metrics) {
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
    return {
      success: false,
      error: errorMessage,
    };
  }
});
