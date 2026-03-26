import { ToggleLeft, ToggleRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type AssistanceRequest,
  type ProviderProfile,
  RequestStatus,
  type UserProfile,
  type backendInterface,
} from "../backend";
import { StatusBadge } from "./Dashboard";

interface Props {
  actor: backendInterface;
  profile: UserProfile;
}

export default function ProviderDashboard({ actor }: Props) {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [myProvider, setMyProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<bigint | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reqs, providers] = await Promise.all([
        actor.getAllRequests(),
        actor.getAllProviders(),
      ]);
      setRequests(
        reqs.filter(
          (r) =>
            r.status === RequestStatus.pending ||
            r.status === RequestStatus.accepted ||
            r.status === RequestStatus.inProgress,
        ),
      );
      if (providers.length > 0) setMyProvider(providers[0]);
    } catch {}
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (
    req: AssistanceRequest,
    newStatus: RequestStatus,
  ) => {
    setUpdatingId(req.id);
    try {
      await actor.updateRequestStatus(req.id, newStatus);
      toast.success(`Request marked as ${newStatus}`);
      await load();
    } catch {
      toast.error("Failed to update status");
    }
    setUpdatingId(null);
  };

  const toggleAvailability = async () => {
    if (!myProvider) return;
    try {
      await actor.updateProviderProfile(myProvider.id, {
        isAvailable: !myProvider.isAvailable,
      });
      setMyProvider({ ...myProvider, isAvailable: !myProvider.isAvailable });
      toast.success(
        myProvider.isAvailable ? "You are now offline" : "You are now online",
      );
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const nextStatus: Record<string, RequestStatus> = {
    [RequestStatus.pending]: RequestStatus.accepted,
    [RequestStatus.accepted]: RequestStatus.inProgress,
    [RequestStatus.inProgress]: RequestStatus.completed,
  };

  return (
    <div className="p-6 pt-16 lg:pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E9EEF5]">
            Provider Dashboard
          </h1>
          <p className="text-sm text-[#A7B0BC] mt-0.5">
            {requests.length} open requests
          </p>
        </div>
        {myProvider && (
          <button
            type="button"
            onClick={toggleAvailability}
            className="flex items-center gap-2 bg-[#1B1F26] border border-[#2B323C] hover:border-[#A7B0BC] px-4 py-2 rounded-xl text-sm text-[#A7B0BC] transition-all"
          >
            {myProvider.isAvailable ? (
              <>
                <ToggleRight className="w-5 h-5 text-[#2FBF71]" />
                <span className="text-[#2FBF71]">Online</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                Offline
              </>
            )}
          </button>
        )}
      </div>

      {myProvider && !myProvider.isApproved && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            ⏳ Your provider account is pending admin approval.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#E0242A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-12 text-center text-[#788392]">
          No open requests at this time
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id.toString()}
              className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-sm font-semibold text-[#E9EEF5] capitalize">
                    {r.requestType}
                  </span>
                  <p className="text-xs text-[#A7B0BC] mt-1">{r.description}</p>
                  <p className="text-xs text-[#788392] mt-1">
                    📍 {r.userLocation.lat.toFixed(4)},{" "}
                    {r.userLocation.lng.toFixed(4)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.status !== RequestStatus.completed && nextStatus[r.status] && (
                <button
                  type="button"
                  onClick={() => updateStatus(r, nextStatus[r.status])}
                  disabled={updatingId === r.id}
                  className="bg-[#E0242A] hover:bg-[#c41f24] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-60"
                >
                  {updatingId === r.id
                    ? "Updating..."
                    : `Mark as ${nextStatus[r.status]}`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
