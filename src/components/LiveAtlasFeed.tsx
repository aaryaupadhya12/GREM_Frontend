import { useState, useEffect } from "react";

interface Chain {
  query: string;
  failure_mode: string;
  q_final: number;
}

const failureModeColors: Record<string, { bg: string; text: string }> = {
  chain_break: { bg: "bg-red-100", text: "text-red-800" },
  distractor_confusion: { bg: "bg-yellow-100", text: "text-yellow-800" },
  entity_drift: { bg: "bg-blue-100", text: "text-blue-800" },
};

export function LiveAtlasFeed() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recent-chains")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          setChains(result.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <h2 className="text-3xl font-bold md:text-4xl">Live From MongoDB Atlas</h2>
        <div className="mt-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-muted-foreground">
            Live • Updated from Atlas
          </span>
        </div>
      </div>

      <h2 className="text-3xl font-bold md:text-4xl mb-8">Verified Reasoning Chains</h2>

      {chains.length === 0 ? (
        <p className="text-muted-foreground">No verified chains available</p>
      ) : (
        <div className="grid gap-4 auto-rows-max">
          {chains.map((chain, idx) => {
            const colors = failureModeColors[chain.failure_mode] || {
              bg: "bg-gray-100",
              text: "text-gray-800",
            };

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {chain.query.length > 120
                        ? chain.query.substring(0, 120) + "..."
                        : chain.query}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${colors.bg} ${colors.text}`}
                    >
                      {chain.failure_mode.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-semibold text-google-blue">
                      {(chain.q_final * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
