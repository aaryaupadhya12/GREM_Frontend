import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DemoTrace {
  demo_id: string;
  query: string;
  failure_mode: string;
  gold_titles: string[];
  aggregator_chain: string;
  q_final: number;
  bm25_first_gold: number;
  grem_first_gold: number;
  bm25_ranking: Array<{
    rank: number;
    title: string;
    snippet: string;
    is_gold: boolean;
  }>;
  grem_ranking: Array<{
    rank: number;
    title: string;
    snippet: string;
    is_gold: boolean;
    score: number;
  }>;
}

export function DemoTracesSection() {
  const [traces, setTraces] = useState<DemoTrace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/demo-traces")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          setTraces(result.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold md:text-4xl">See It In Action</h2>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!traces.length) {
    return (
      <div className="text-center text-muted-foreground">
        No demo traces available
      </div>
    );
  }

  return (
    <section className="py-16">
      <h2 className="mb-8 text-3xl font-bold md:text-4xl">See It In Action</h2>

      <Tabs defaultValue={traces[0]?.demo_id} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${traces.length}, 1fr)` }}>
          {traces.map((trace) => (
            <TabsTrigger key={trace.demo_id} value={trace.demo_id}>
              {trace.demo_id}
            </TabsTrigger>
          ))}
        </TabsList>

        {traces.map((trace) => (
          <TabsContent key={trace.demo_id} value={trace.demo_id} className="mt-6">
            <div className="space-y-6">
              {/* Query */}
              <div>
                <p className="text-xl font-semibold mb-2">Query</p>
                <p className="text-base text-muted-foreground">{trace.query}</p>
              </div>

              {/* Side-by-side ranking comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BM25 Ranking */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-lg mb-4">BM25 Ranking</h3>
                  <div className="space-y-3">
                    {trace.bm25_ranking.slice(0, 5).map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded border-l-4 ${
                          item.is_gold
                            ? "border-l-red-500 bg-red-50"
                            : "border-l-gray-300 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-muted-foreground">
                            #{item.rank}
                          </span>
                          <p className="font-semibold text-sm">{item.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                  {trace.bm25_first_gold > 0 && (
                    <div className="mt-4 text-sm">
                      <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Gold found at rank {trace.bm25_first_gold}
                      </span>
                    </div>
                  )}
                </div>

                {/* GREM Ranking */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-lg mb-4">GREM Re-ranking</h3>
                  <div className="space-y-3">
                    {trace.grem_ranking.slice(0, 5).map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded border-l-4 ${
                          item.is_gold
                            ? "border-l-green-500 bg-green-50"
                            : "border-l-gray-300 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground">
                              #{item.rank}
                            </span>
                            <p className="font-semibold text-sm">{item.title}</p>
                          </div>
                          <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {(item.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                  {trace.grem_first_gold > 0 && (
                    <div className="mt-4 text-sm">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Gold found at rank {trace.grem_first_gold}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Aggregator chain */}
              <div className="bg-yellow-50 border-l-4 border-l-yellow-400 rounded-lg p-4">
                <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-2">
                  Verified Reasoning Chain
                </p>
                <p className="text-sm text-yellow-900">{trace.aggregator_chain}</p>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
