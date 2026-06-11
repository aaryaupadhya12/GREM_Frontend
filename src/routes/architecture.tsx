import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "GREM Architecture" },
      { name: "description", content: "Architecture and Atlas workflow for Quality-Gated Multi-Hop Retrieval." },
    ],
  }),
  component: ArchitecturePage,
});

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">GREM Architecture</h1>
          <p className="text-muted-foreground max-w-3xl">
            This page explains the production-ready pipeline used by the demo: BM25 retrieval,
            multi-agent reasoning, verification gating, and MongoDB Atlas episodic memory.
          </p>
        </div>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">1. Retrieval + Failure Detection</h2>
            <p className="text-muted-foreground mb-4">
              BM25 retrieves candidate passages. If the gold answer is not surfaced early, the system
              marks the query as a failure mode and triggers the GREM reasoning workflow.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>BM25 top-k baseline</li>
              <li>Failure modes: chain_break, entity_drift, distractor_confusion</li>
              <li>Cached initial ranking state stored in <code>demo_traces</code></li>
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">2. Multi-Agent Reasoning</h2>
            <p className="text-muted-foreground mb-4">
              GREM runs multiple reasoning agents to produce a verified reasoning chain that
              re-ranks retrieval results with a distilled cross-encoder.</p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>Agents inspect BM25 candidate evidence</li>
              <li>Verified chain is built as an aggregate decision</li>
              <li>Gold elevation is measured by reranker rank improvement</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">3. Atlas Episodic Memory</h2>
            <p className="text-muted-foreground mb-4">
              High-confidence verification traces are persisted to MongoDB Atlas episodic_memory.
              The live feed on the home page renders those verified chains.</p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>Collection: <code>episodic_memory</code></li>
              <li>Fields: query, failure_mode, q_final, aggregator_chain, first_gold_rank</li>
              <li>Filtered for quality with <code>q_final &gt;= 0.7</code></li>
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">4. Metrics + Monitoring</h2>
            <p className="text-muted-foreground mb-4">
              Final evaluation metrics are stored in <code>final_metrics</code> and reused across
              homepage cards and the Results section.</p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>Single document collection: <code>final_metrics</code></li>
              <li>Metrics loaded once via a shared hook</li>
              <li>Performance displayed in both hero cards and results dashboard</li>
            </ul>
          </div>
        </section>

        <div className="mt-12 rounded-3xl border border-gray-200 bg-slate-50 p-8">
          <h2 className="text-2xl font-semibold mb-4">Production Notes</h2>
          <p className="text-sm text-slate-700 leading-7">
            Deploying to Vercel requires a working <code>MONGO_URI</code> environment variable.
            Atlas must allow the deployment IP range or 0.0.0.0/0 during development.
            The frontend consumes cache collections directly from Atlas for the live demo.
          </p>
        </div>
      </main>
    </div>
  );
}
