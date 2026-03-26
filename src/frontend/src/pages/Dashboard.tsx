import { CheckCircle, Clock, Phone, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { Page } from "../App";
import {
  type AssistanceRequest,
  type ProviderProfile,
  RequestStatus,
  ServiceType,
  type UserProfile,
  type backendInterface,
} from "../backend";
import EmergencyRequestModal from "../components/EmergencyRequestModal";
import MapComponent from "../components/MapComponent";
import ProviderCard from "../components/ProviderCard";
import RequestStatusStepper from "../components/RequestStatusStepper";

interface Props {
  profile: UserProfile;
  actor: backendInterface;
  onNavigate: (p: Page) => void;
}

export default function Dashboard({ profile, actor, onNavigate }: Props) {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [showSOS, setShowSOS] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState(3.139);
  const [userLng, setUserLng] = useState(101.6869);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setUserLat(pos.coords.latitude);
      setUserLng(pos.coords.longitude);
    });
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReqs, allProviders] = await Promise.all([
        actor.getAllRequests(),
        actor.getAllProviders(),
      ]);
      setRequests(allReqs);
      setProviders(allProviders.filter((p) => p.isApproved && p.isAvailable));
    } catch {}
    setLoading(false);
  };

  const activeRequest = requests.find(
    (r) =>
      r.status === RequestStatus.pending ||
      r.status === RequestStatus.accepted ||
      r.status === RequestStatus.inProgress,
  );

  const stats = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-blue-400",
    },
    {
      label: "Active",
      value: requests.filter(
        (r) =>
          r.status !== RequestStatus.completed &&
          r.status !== RequestStatus.cancelled,
      ).length,
      icon: <Clock className="w-5 h-5" />,
      color: "text-yellow-400",
    },
    {
      label: "Completed",
      value: requests.filter((r) => r.status === RequestStatus.completed)
        .length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-[#2FBF71]",
    },
    {
      label: "Providers",
      value: providers.length,
      icon: <Phone className="w-5 h-5" />,
      color: "text-[#E0242A]",
    },
  ];

  return (
    <div className="p-6 pt-16 lg:pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E9EEF5]">Dashboard</h1>
          <p className="text-[#A7B0BC] text-sm mt-0.5">
            Welcome back, {profile.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSOS(true)}
          className="flex items-center gap-2 bg-[#E0242A] hover:bg-[#c41f24] text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#E0242A]/30 transition-all active:scale-95"
        >
          <Phone className="w-5 h-5" />
          SOS ASSIST
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-4"
          >
            <div className={`mb-2 ${s.color}`}>{s.icon}</div>
            <div className="text-2xl font-bold text-[#E9EEF5]">
              {loading ? "-" : s.value}
            </div>
            <div className="text-xs text-[#788392]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active Request */}
      {activeRequest && (
        <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-5">
          <h2 className="text-base font-semibold text-[#E9EEF5] mb-4">
            Active Request
          </h2>
          <RequestStatusStepper status={activeRequest.status} />
          <p className="text-sm text-[#A7B0BC] mt-3 capitalize">
            <span className="text-[#E9EEF5]">{activeRequest.requestType}</span>{" "}
            — {activeRequest.description}
          </p>
        </div>
      )}

      {/* Map */}
      <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#E9EEF5]">Live Map</h2>
          <button
            type="button"
            onClick={() => onNavigate("map")}
            className="text-xs text-[#E0242A] hover:underline"
          >
            Full Map →
          </button>
        </div>
        <MapComponent
          providers={providers}
          userLat={userLat}
          userLng={userLng}
          height="h-64"
        />
      </div>

      {/* Nearby Providers */}
      <div>
        <h2 className="text-base font-semibold text-[#E9EEF5] mb-4">
          Nearby Providers ({providers.length})
        </h2>
        {loading ? (
          <div className="text-[#788392] text-sm">Loading providers...</div>
        ) : providers.length === 0 ? (
          <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-8 text-center text-[#788392]">
            No available providers at this time
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {providers.slice(0, 6).map((p) => (
              <ProviderCard
                key={p.id.toString()}
                provider={p}
                userLat={userLat}
                userLng={userLng}
                actor={actor}
                onRequest={loadData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Requests */}
      {requests.length > 0 && (
        <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#E9EEF5]">
              Recent Requests
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("requests")}
              className="text-xs text-[#E0242A] hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {requests.slice(0, 4).map((r) => (
              <div
                key={r.id.toString()}
                className="flex items-center justify-between py-2 border-b border-[#2B323C] last:border-0"
              >
                <div>
                  <span className="text-sm text-[#E9EEF5] capitalize">
                    {r.requestType}
                  </span>
                  <span className="text-xs text-[#788392] ml-2">
                    {r.description.slice(0, 40)}
                  </span>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {showSOS && (
        <EmergencyRequestModal
          actor={actor}
          onClose={() => setShowSOS(false)}
          onSubmit={() => {
            setShowSOS(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const styles: Record<RequestStatus, string> = {
    [RequestStatus.pending]:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    [RequestStatus.accepted]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    [RequestStatus.inProgress]:
      "bg-purple-500/10 text-purple-400 border-purple-500/20",
    [RequestStatus.completed]:
      "bg-[#2FBF71]/10 text-[#2FBF71] border-[#2FBF71]/20",
    [RequestStatus.cancelled]: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border capitalize ${styles[status]}`}
    >
      {status === RequestStatus.inProgress ? "In Progress" : status}
    </span>
  );
}
