import { CheckCircle, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  AssistanceRequest,
  ProviderProfile,
  backendInterface,
} from "../backend";
import { StatusBadge } from "./Dashboard";

interface Props {
  actor: backendInterface;
}

export default function AdminDashboard({ actor }: Props) {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [tab, setTab] = useState<"providers" | "requests">("providers");
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<bigint | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ps, rs] = await Promise.all([
        actor.getAllProviders(),
        actor.getAllRequests(),
      ]);
      setProviders(ps);
      setRequests(rs);
    } catch {}
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const approveProvider = async (id: bigint) => {
    setApprovingId(id);
    try {
      await actor.approveProvider(id);
      toast.success("Provider approved!");
      await load();
    } catch {
      toast.error("Failed to approve provider");
    }
    setApprovingId(null);
  };

  const TABS = [
    { id: "providers" as const, label: `Providers (${providers.length})` },
    { id: "requests" as const, label: `Requests (${requests.length})` },
  ];

  return (
    <div className="p-6 pt-16 lg:pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-[#E0242A]" />
        <h1 className="text-2xl font-bold text-[#E9EEF5]">Admin Dashboard</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-[#E0242A] text-white"
                : "bg-[#1B1F26] border border-[#2B323C] text-[#A7B0BC] hover:border-[#A7B0BC]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#E0242A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "providers" ? (
        <div className="space-y-3">
          {providers.length === 0 ? (
            <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-8 text-center text-[#788392]">
              No providers registered
            </div>
          ) : (
            providers.map((p) => (
              <div
                key={p.id.toString()}
                className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-[#E9EEF5] capitalize">
                    {p.serviceType} Provider
                  </div>
                  <div className="text-xs text-[#A7B0BC] mt-0.5">
                    Rating: {p.rating.toFixed(1)} ⭐ ·{" "}
                    {p.isAvailable ? "Available" : "Unavailable"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.isApproved ? (
                    <span className="flex items-center gap-1 text-xs text-[#2FBF71]">
                      <CheckCircle className="w-4 h-4" />
                      Approved
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => approveProvider(p.id)}
                      disabled={approvingId === p.id}
                      className="bg-[#2FBF71]/10 border border-[#2FBF71]/30 hover:bg-[#2FBF71]/20 text-[#2FBF71] text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-60"
                    >
                      {approvingId === p.id ? "Approving..." : "Approve"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-8 text-center text-[#788392]">
              No requests yet
            </div>
          ) : (
            requests.map((r) => (
              <div
                key={r.id.toString()}
                className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-[#E9EEF5] capitalize">
                    {r.requestType}
                  </div>
                  <p className="text-xs text-[#A7B0BC] mt-0.5">
                    {r.description.slice(0, 60)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
