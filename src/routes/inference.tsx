import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyboardEvent, useEffect, useMemo, useState, useRef } from "react";
import { Nav } from "@/components/Nav";

export const Route = createFileRoute("/inference")({
  head: () => ({
    meta: [
      { title: "See GREM Recover A Failure" },
      { name: "description", content: "Replay cached GREM demo traces with verified reasoning chains from MongoDB Atlas." },
    ],
  }),
  component: InferencePage,
});

type Doc = {
  title: string;
  is_gold?: boolean;
  score?: number;
};

type DemoTrace = {
  demo_id: string | number;
  query: string;
  failure_mode: string;
  aggregator_chain: string;
  q_final: number;
  bm25_first_gold: number;
  grem_first_gold: number;
  bm25_ranking: Doc[];
  grem_ranking: Doc[];
};

function useDemoTraces() {
  const [traces, setTraces] = useState<DemoTrace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/demo-traces")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (!data || !data.success) {
          setError("Demo traces temporarily unavailable");
          setTraces([]);
          return;
        }
        setTraces(data.data || data);
      })
      .catch((err) => {
        console.error(err);
        setError("Demo traces temporarily unavailable");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { traces, loading, error };
}

export default function InferencePage() {
  const { traces, loading, error } = useDemoTraces();
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [chainVisible, setChainVisible] = useState(false);
  const selectedTrace = useMemo(
    () => traces.find((t) => String(t.demo_id) === String(selectedId)) || null,
    [traces, selectedId]
  );
  const prevSelected = useRef<string | number | null>(null);

  useEffect(() => {
    if (!loading && traces.length > 0) {
      setSelectedId((id) => id ?? traces[0].demo_id);
    }
  }, [loading, traces]);

  useEffect(() => {
    setChainVisible(false);
    const timer = setTimeout(() => setChainVisible(true), 300);
    return () => clearTimeout(timer);
  }, [selectedId]);

  useEffect(() => {
    if (selectedId !== prevSelected.current) {
      prevSelected.current = selectedId;
    }
  }, [selectedId]);

  const onKeyNav = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!traces || traces.length === 0) return;
    const idx = traces.findIndex((t) => String(t.demo_id) === String(selectedId));
    if (idx === -1) return;
    if (e.key === "ArrowRight") {
      const next = traces[(idx + 1 + traces.length) % traces.length];
      setSelectedId(next.demo_id);
    } else if (e.key === "ArrowLeft") {
      const prev = traces[(idx - 1 + traces.length) % traces.length];
      setSelectedId(prev.demo_id);
    }
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">See GREM Recover A Failure</h1>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
            Five real HotpotQA bridge failures where BM25 buried the answer. Watch the verified reasoning chain
            from MongoDB Atlas elevate gold to rank 1.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
            <span className="font-medium">Production replay</span>
            <button title="These are cached inference traces from MongoDB. Live inference on the deployed re-ranker is available via the GitHub repo." className="underline">i</button>
          </div>
        </div>

        {/* Selector */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Demo queries</h2>
            <p className="text-sm text-muted-foreground">Select a cached trace to replay</p>
          </div>

          <div
            className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto"
            onKeyDown={onKeyNav}
            tabIndex={0}
            aria-label="Demo query selector"
          >
            {loading && new Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-gray-200 p-6 bg-gray-100 h-40" />
            ))}

            {!loading && error && (
              <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-6">Demo traces temporarily unavailable. See the <a href="https://github.com/" className="underline">GitHub repo</a> for direct inference examples.</div>
            )}

            {!loading && !error && traces.length === 0 && (
              <div className="col-span-full rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                No demo traces cached yet. Run <code className="rounded bg-gray-100 px-2 py-1">python precompute_demo.py</code> to populate.
              </div>
            )}

            {!loading && !error && traces.map((t) => {
              const active = t.demo_id === selectedId;
              const bm25Rank = t.bm25_first_gold ?? -1;
              const gremRank = t.grem_first_gold ?? -1;
              const badgeColor = t.failure_mode === "chain_break" ? "bg-red-500 text-white" : t.failure_mode === "entity_drift" ? "bg-yellow-500 text-white" : "bg-orange-500 text-white";
              return (
                <button
                  key={t.demo_id}
                  onClick={() => setSelectedId(t.demo_id)}
                  aria-pressed={active}
                  className={`rounded-lg p-4 text-left transition-transform ${active ? "border-2 border-blue-600 bg-blue-50 scale-105 transform" : "border border-gray-200 hover:border-blue-400"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColor}`}>{t.failure_mode}</span>
                    <div className="text-sm font-mono text-muted-foreground">ID {t.demo_id}</div>
                  </div>
                  <div className="mt-3 italic text-sm text-slate-700 line-clamp-3">{t.query}</div>
                  <div className="mt-4 flex items-baseline gap-4">
                    <div className="text-sm font-bold">BM25 rank: <span className="text-red-600">{bm25Rank}</span></div>
                    <div className="text-sm font-bold">→ GREM rank: <span className="text-green-600">{gremRank}</span></div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Flow */}
        <section className="mt-12">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="mb-6">
              <div className="bg-gray-900 text-white p-6 rounded-2xl font-mono text-lg">$
                {selectedTrace ? selectedTrace.query : <span className="opacity-60">Loading query…</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* BM25 */}
              <div>
                <h3 className="font-bold">BM25 Retrieval (baseline)</h3>
                <p className="text-sm text-muted-foreground">Top 5</p>
                <div className="mt-4 space-y-3">
                  {!selectedTrace && <div className="h-40 animate-pulse rounded bg-gray-100" />}
                  {selectedTrace && selectedTrace.bm25_ranking.slice(0, 5).map((d, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-md border p-3 ${d.is_gold ? "border-l-4 border-red-500 bg-red-50" : "bg-white"}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200">{i + 1}</div>
                        <div>
                          <div className="font-medium">{d.title}</div>
                          <div className="text-sm text-muted-foreground">{d.is_gold ? <span className="text-red-600">Gold</span> : ""}</div>
                        </div>
                      </div>
                      <div className="font-mono text-sm text-muted-foreground">{d.score?.toFixed(3) ?? ""}</div>
                    </div>
                  ))}
                </div>
                {selectedTrace && (
                  <div className="mt-4 rounded p-3 bg-red-50 border border-red-200 text-sm text-red-700">Gold answer found at rank {selectedTrace.bm25_first_gold} — too deep to surface to users</div>
                )}
              </div>

              {/* Chain */}
              <div>
                <h3 className="font-bold">Verified Reasoning Chain</h3>
                <p className="text-sm text-muted-foreground">Retrieved from MongoDB Atlas Vector Search</p>
                <div className={`mt-4 rounded-2xl p-6 border-l-4 ${selectedTrace ? "border-yellow-500 bg-yellow-50" : "bg-gray-100"} transition-opacity duration-600 ${chainVisible ? "opacity-100" : "opacity-0"}`}>
                  {selectedTrace ? (
                    <div className="font-serif italic text-base leading-relaxed">{selectedTrace.aggregator_chain}</div>
                  ) : (
                    <div className="h-56 animate-pulse rounded bg-gray-100" />
                  )}

                  {selectedTrace && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded bg-gray-100 px-2 py-1 text-sm">q_final: {selectedTrace.q_final.toFixed(2)}</span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-sm">Failure mode: {selectedTrace.failure_mode}</span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-sm">Bridge entity verified ✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* GREM */}
              <div>
                <h3 className="font-bold">GREM Re-ranking (output)</h3>
                <p className="text-sm text-muted-foreground">Top 5</p>
                <div className="mt-4 space-y-3">
                  {!selectedTrace && <div className="h-40 animate-pulse rounded bg-gray-100" />}
                  {selectedTrace && selectedTrace.grem_ranking.slice(0,5).map((d, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-md border p-3 ${d.is_gold ? "border-l-4 border-green-500 bg-green-50" : "bg-white"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 flex items-center justify-center rounded-full ${i===0 ? "bg-green-500 text-white" : "bg-blue-100 text-blue-700"}`}>{i + 1}</div>
                        <div>
                          <div className="font-medium">{d.title}</div>
                          <div className="text-sm text-muted-foreground">{d.is_gold ? <span className="text-green-600">Gold</span> : ""}</div>
                        </div>
                      </div>
                      <div className="font-mono text-sm text-muted-foreground">{d.score?.toFixed(3) ?? ""}</div>
                    </div>
                  ))}
                </div>
                {selectedTrace && (
                  <div className="mt-4 rounded p-3 bg-green-50 border border-green-200 text-sm text-green-700">Gold elevated to rank {selectedTrace.grem_first_gold} — surfaced to users in 2ms</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Recovery metrics */}
        <section className="mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-4 bg-red-50">
              <div className="text-xs text-muted-foreground">BM25 Rank</div>
              <div className="mt-1 font-bold text-red-700">{selectedTrace ? selectedTrace.bm25_first_gold : "—"}</div>
            </div>
            <div className="rounded-lg border p-4 bg-green-50">
              <div className="text-xs text-muted-foreground">GREM Rank</div>
              <div className="mt-1 font-bold text-green-700">{selectedTrace ? selectedTrace.grem_first_gold : "—"}</div>
            </div>
            <div className="rounded-lg border p-4 bg-blue-50">
              <div className="text-xs text-muted-foreground">Rank Improvement</div>
              <div className="mt-1 font-bold text-blue-700">
                {selectedTrace ? (() => {
                  const improvement = selectedTrace.bm25_first_gold - selectedTrace.grem_first_gold;
                  return improvement >= 0
                    ? `+${improvement} positions`
                    : `${improvement} positions`;
                })() : "—"}
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-yellow-50">
              <div className="text-xs text-muted-foreground">Failure Mode</div>
              <div className="mt-1 font-bold text-yellow-700">{selectedTrace ? selectedTrace.failure_mode : "—"}</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-10">
          <div className="rounded-lg border p-6 flex items-center justify-between">
            <div>
              <div className="font-bold">How does this work?</div>
              <div className="text-sm text-muted-foreground">Read about our multi-agent Gemini pipeline that generated the verified chain you just saw.</div>
            </div>
            <div>
              <Link to="/architecture" className="rounded-md bg-google-blue px-4 py-2 text-white">See the architecture →</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
