import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  type AssistanceRequest,
  RequestStatus,
  type UserProfile,
  type backendInterface,
} from "../backend";
import EmergencyRequestModal from "../components/EmergencyRequestModal";
import RatingModal from "../components/RatingModal";
import RequestStatusStepper from "../components/RequestStatusStepper";
import { StatusBadge } from "./Dashboard";

interface Props {
  actor: backendInterface;
  profile: UserProfile;
}

export default function MyRequests({ actor }: Props) {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFor, setRatingFor] = useState<AssistanceRequest | null>(null);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRequests(await actor.getAllRequests());
    } catch {}
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-6 pt-16 lg:pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E9EEF5]">My Requests</h1>
          <p className="text-sm text-[#A7B0BC] mt-0.5">
            {requests.length} total requests
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[#E0242A] hover:bg-[#c41f24] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#E0242A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-12 text-center">
          <p className="text-[#788392] mb-4">No requests yet</p>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="bg-[#E0242A] hover:bg-[#c41f24] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Submit First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id.toString()}
              className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm font-semibold text-[#E9EEF5] capitalize">
                    {r.requestType}
                  </span>
                  <p className="text-xs text-[#A7B0BC] mt-1">{r.description}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.status !== RequestStatus.completed &&
                r.status !== RequestStatus.cancelled && (
                  <RequestStatusStepper status={r.status} />
                )}
              {r.status === RequestStatus.completed &&
                r.assignedProviderId !== undefined && (
                  <button
                    type="button"
                    onClick={() => setRatingFor(r)}
                    className="mt-3 text-xs text-[#E0242A] hover:underline"
                  >
                    ⭐ Rate this service
                  </button>
                )}
            </div>
          ))}
        </div>
      )}

      {ratingFor && ratingFor.assignedProviderId !== undefined && (
        <RatingModal
          actor={actor}
          requestId={ratingFor.id}
          providerId={ratingFor.assignedProviderId!}
          onClose={() => setRatingFor(null)}
          onSubmit={() => {
            setRatingFor(null);
            load();
          }}
        />
      )}
      {showNew && (
        <EmergencyRequestModal
          actor={actor}
          onClose={() => setShowNew(false)}
          onSubmit={() => {
            setShowNew(false);
            load();
          }}
        />
      )}
    </div>
  );
}
