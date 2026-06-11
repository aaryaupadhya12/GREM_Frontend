import { createServerFn } from "@tanstack/react-start/server";
import { getDb } from "@/lib/mongo";

export const getRecentChains = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getDb();
    const chains = await db
      .collection("episodic_memory")
      .find({ q_final: { $gte: 0.7 } })
      .project({
        query: 1,
        failure_mode: 1,
        q_final: 1,
        _id: 0,
      })
      .sort({ _id: -1 })
      .limit(10)
      .toArray();

    return {
      success: true,
      data: chains || [],
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
});
