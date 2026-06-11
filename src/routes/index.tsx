import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { ResultsSection } from "@/components/ResultsSection";
import { DemoTracesSection } from "@/components/DemoTracesSection";
import { LiveAtlasFeed } from "@/components/LiveAtlasFeed";
import { useMetrics, type Metrics } from "@/hooks/useMetrics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GREM — Quality-Gated Multi-Hop Retrieval" },
      { name: "description", content: "Episodic Distillation for Verified RAG using Google Cloud + MongoDB Atlas." },
    ],
  }),
  component: Index,
});

function Index() {
  const { metrics, loading: loadingMetrics } = useMetrics();

  // Fallback metrics for error cases
  const fallbackMetrics: Metrics = {
    n_test_records: 228,
    bm25_hits_at_1: 0.0,
    reranker_hits_at_1: 0.8026,
    reranker_hits_at_2: 0.9254,
    reranker_recall_at_2: 0.7061,
    reranker_mrr: 0.8851,
    reranker_ndcg_at_2: 0.728,
    reranker_ndcg_at_5: 0.8475,
    delta_hits_at_1: 0.8026,
    ground_rate: 1.0,
    lucky_rate: 0.0,
    hint_invoked_count: 11,
    hint_invoked_rate: 0.048,
    failure_mode_recovery: {
      distractor_confusion: { recovered: 64, total: 79, rate: 0.81 },
      entity_drift: { recovered: 103, total: 130, rate: 0.792 },
      chain_break: { recovered: 16, total: 19, rate: 0.842 },
    },
  };

  const displayMetrics = metrics || fallbackMetrics;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-full border border-google-blue/30 bg-google-blue/5 px-3 py-1 text-google-blue">Google Cloud</span>
          <span className="rounded-full border border-mongo-green/30 bg-mongo-green/5 px-3 py-1 text-mongo-green">MongoDB Atlas</span>
          <span className="rounded-full border border-google-yellow/40 bg-google-yellow/10 px-3 py-1">HotpotQA</span>
        </div>
        <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Quality-Gated{" "}
          <span className="text-google-blue">Multi-Hop</span>{" "}
          <span className="text-google-red">Retrieval</span>{" "}
          with <span className="text-mongo-green">Episodic Memory</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          GREM recovers BM25 hard failures using multi-agent reasoning, verification-aware
          aggregation, and distilled cross-encoder reranking — backed by MongoDB Atlas vector memory.
        </p>

        {/* Hero metric cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HeroCard
            label="RECOVERY"
            value={(displayMetrics.reranker_hits_at_1 * 100).toFixed(1) + "%"}
            subtext="queries BM25 lost"
            color="blue"
            loading={loadingMetrics}
          />
          <HeroCard
            label="CHEAPER"
            value="1000×"
            subtext="than LLM re-ranking"
            color="green"
            loading={loadingMetrics}
          />
          <HeroCard
            label="LATENCY"
            value="2 ms"
            subtext="vs 2 s for LLM"
            color="yellow"
            loading={loadingMetrics}
          />
          <HeroCard
            label="PER QUERY"
            value="$0.000003"
            subtext="at production scale"
            color="red"
            loading={loadingMetrics}
          />
        </div>

        {/* Results section */}
        <ResultsSection metrics={displayMetrics} />

        {/* Demo traces section */}
        <DemoTracesSection />

        {/* Live feed section */}
        <LiveAtlasFeed />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link
            to="/training"
            className="group rounded-2xl border-2 border-google-blue/20 bg-google-blue/5 p-8 transition hover:border-google-blue hover:shadow-lg"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-google-blue">Pipeline 01</div>
            <h2 className="mt-2 text-2xl font-bold">Training</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Walk through BM25 mining, the 3-agent reasoning layer, verification gate, and how
              high-confidence traces become Atlas episodic memory.
            </p>
            <div className="mt-4 text-sm font-medium text-google-blue group-hover:underline">Explore training →</div>
          </Link>
          <Link
            to="/inference"
            className="group rounded-2xl border-2 border-mongo-green/20 bg-mongo-green/5 p-8 transition hover:border-mongo-green hover:shadow-lg"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-mongo-green">Pipeline 02</div>
            <h2 className="mt-2 text-2xl font-bold">Inference</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run a query through hybrid retrieval, Atlas memory fetch, and the distilled cross-encoder
              reranker. Watch metrics update live.
            </p>
            <div className="mt-4 text-sm font-medium text-mongo-green group-hover:underline">Try inference →</div>
          </Link>
        </div>

        <footer className="mt-20 border-t pt-6 text-xs text-muted-foreground">
          Hackathon demo · Frontend only · Designed to deploy on Vercel + Google Cloud.
        </footer>
      </main>
    </div>
  );
}

interface HeroCardProps {
  label: string;
  value: string;
  subtext: string;
  color: "blue" | "red" | "yellow" | "green";
  loading: boolean;
}

function HeroCard({ label, value, subtext, color, loading }: HeroCardProps) {
  const colorMap = {
    blue: "text-google-blue border-google-blue/20 bg-google-blue/5",
    red: "text-google-red border-google-red/20 bg-google-red/5",
    yellow: "text-google-yellow border-google-yellow/20 bg-google-yellow/5",
    green: "text-mongo-green border-mongo-green/20 bg-mongo-green/5",
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border-2 p-6 ${colorMap[color]}`}>
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border-2 p-6 ${colorMap[color]}`}>
      <div className={`text-4xl font-bold tabular-nums ${colorMap[color].split(" ")[0]}`}>
        {value}
      </div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{subtext}</div>
    </div>
  );
}
