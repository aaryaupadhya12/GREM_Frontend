import { useEffect, useState } from "react";

export type Metrics = {
  n_test_records: number;
  bm25_hits_at_1: number;
  reranker_hits_at_1: number;
  reranker_hits_at_2: number;
  reranker_recall_at_2: number;
  reranker_mrr: number;
  reranker_ndcg_at_2: number;
  reranker_ndcg_at_5: number;
  delta_hits_at_1: number;
  ground_rate: number;
  lucky_rate: number;
  hint_invoked_count: number;
  hint_invoked_rate: number;
  failure_mode_recovery: {
    distractor_confusion: { recovered: number; total: number; rate: number };
    entity_drift: { recovered: number; total: number; rate: number };
    chain_break: { recovered: number; total: number; rate: number };
  };
};

let cachedMetrics: Metrics | null = null;
let cachePromise: Promise<Metrics> | null = null;

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(cachedMetrics);
  const [loading, setLoading] = useState<boolean>(!cachedMetrics);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedMetrics || cachePromise) {
      if (cachedMetrics) {
        setMetrics(cachedMetrics);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    cachePromise = fetch("/api/metrics")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((response) => {
        if (!response || response.error) {
          throw new Error(response?.error || "Invalid metrics response");
        }
        // Handle both wrapped { success, data } and direct metric responses
        const payload = response.data || response;
        if (!payload || typeof payload !== 'object') {
          throw new Error("Invalid metrics data");
        }
        cachedMetrics = payload as Metrics;
        setMetrics(cachedMetrics);
        return cachedMetrics;
      })
      .catch((err) => {
        console.error("useMetrics error:", err);
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      // no teardown needed
    };
  }, []);

  return { metrics, loading, error };
}
