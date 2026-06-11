interface Metrics {
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
}

interface ResultsSectionProps {
  metrics: Metrics | null;
}

export function ResultsSection({ metrics }: ResultsSectionProps) {
  if (!metrics) return null;

  const failureModes = [
    { key: "chain_break", label: "Chain break" },
    { key: "distractor_confusion", label: "Distractor confusion" },
    { key: "entity_drift", label: "Entity drift" },
  ] as const;

  return (
    <section className="py-16">
      <h2 className="mb-2 text-3xl font-bold md:text-4xl">Performance Results</h2>
      <p className="text-muted-foreground mb-8">HotpotQA Bridge Failures (n={metrics.n_test_records})</p>

      <div className="space-y-12">
        {/* BLOCK A: Full metrics grid */}
        <div>
          <h3 className="font-bold text-lg mb-4">Key Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-2xl font-bold text-google-blue">
                {(metrics.reranker_hits_at_1 * 100).toFixed(2)}%
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                Hits@1
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-2xl font-bold text-google-blue">
                {(metrics.reranker_hits_at_2 * 100).toFixed(2)}%
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                Hits@2
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-2xl font-bold text-google-blue">
                {(metrics.reranker_recall_at_2 * 100).toFixed(2)}%
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                Recall@2
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-2xl font-bold text-mongo-green">
                {metrics.reranker_mrr.toFixed(4)}
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                MRR
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-2xl font-bold text-mongo-green">
                {metrics.reranker_ndcg_at_2.toFixed(4)}
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                nDCG@2
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-2xl font-bold text-mongo-green">
                {metrics.reranker_ndcg_at_5.toFixed(4)}
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                nDCG@5
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-2xl font-bold text-google-yellow">
                {(metrics.ground_rate * 100).toFixed(1)}%
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                Ground Rate
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-2xl font-bold text-google-yellow">
                {(metrics.lucky_rate * 100).toFixed(1)}%
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                Lucky Rate
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-2xl font-bold text-google-red">
                {(metrics.hint_invoked_rate * 100).toFixed(1)}%
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                Adaptive Atlas
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK B: Failure mode recovery breakdown */}
        <div>
          <h3 className="font-bold text-lg mb-4">Failure Mode Recovery</h3>
          <div className="space-y-4">
            {failureModes.map(({ key, label }) => {
              const mode = metrics.failure_mode_recovery[key];
              const percentage = (mode.rate * 100).toFixed(1);
              return (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-48 text-sm font-medium">{label}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-mongo-green transition-all"
                        style={{ width: `${mode.rate * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold">
                    {percentage}%
                  </div>
                  <div className="w-24 text-right text-xs text-muted-foreground">
                    ({mode.recovered}/{mode.total})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BLOCK C: Comparison table */}
        <div>
          <h3 className="font-bold text-lg mb-4">System Comparison</h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">Metric</th>
                  <th className="px-4 py-3 text-left font-semibold">BM25 Baseline</th>
                  <th className="px-4 py-3 text-left font-semibold">LLM Re-ranking</th>
                  <th className="px-4 py-3 text-left font-semibold bg-green-50">
                    GREM (Distilled)
                  </th>
                  <th className="px-4 py-3 text-left font-semibold bg-green-50">
                    GREM (Adaptive Atlas)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">Hits@1</td>
                  <td className="px-4 py-3">0.000</td>
                  <td className="px-4 py-3">~0.85</td>
                  <td className="px-4 py-3 bg-green-50">
                    {metrics.reranker_hits_at_1.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 bg-green-50">
                    {metrics.reranker_hits_at_1.toFixed(4)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">Hits@2</td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3">~0.93</td>
                  <td className="px-4 py-3 bg-green-50">
                    {metrics.reranker_hits_at_2.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 bg-green-50">
                    {metrics.reranker_hits_at_2.toFixed(4)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">Recall@2</td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3">~0.72</td>
                  <td className="px-4 py-3 bg-green-50">
                    {metrics.reranker_recall_at_2.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 bg-green-50">
                    {metrics.reranker_recall_at_2.toFixed(4)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">MRR</td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3">~0.88</td>
                  <td className="px-4 py-3 bg-green-50">
                    {metrics.reranker_mrr.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 bg-green-50">
                    {metrics.reranker_mrr.toFixed(4)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">Latency</td>
                  <td className="px-4 py-3">5 ms</td>
                  <td className="px-4 py-3">~2 s</td>
                  <td className="px-4 py-3 bg-green-50">2 ms</td>
                  <td className="px-4 py-3 bg-green-50">2-50 ms</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">Cost per query</td>
                  <td className="px-4 py-3">$0</td>
                  <td className="px-4 py-3">$0.003</td>
                  <td className="px-4 py-3 bg-green-50">$0.000003</td>
                  <td className="px-4 py-3 bg-green-50">$0.000003</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">API calls</td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3">1 LLM</td>
                  <td className="px-4 py-3 bg-green-50">0</td>
                  <td className="px-4 py-3 bg-green-50">0-1 vector</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* BLOCK D: Adaptive Atlas callout */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
          <p className="text-lg font-semibold leading-relaxed">
            MongoDB Atlas Vector Search invoked on {(metrics.hint_invoked_rate * 100).toFixed(1)}% of queries
            ({metrics.hint_invoked_count} out of {metrics.n_test_records}) — exactly when the re-ranker is uncertain.
            {((1 - metrics.hint_invoked_rate) * 100).toFixed(1)}% of queries complete in 2ms with no database round-trip.
          </p>
        </div>
      </div>
    </section>
  );
}
