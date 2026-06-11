import { createServerFn } from "@tanstack/react-start/server";
import { getDb } from "@/lib/mongo";

export const getDemoTraces = createServerFn({ method: "GET" }).handler(async () => {
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
    return {
      success: false,
      error: errorMessage,
    };
  }
});
