import { MapPin, Star, Wrench } from "lucide-react";
import { useState } from "react";
import {
  type ProviderProfile,
  ServiceType,
  type backendInterface,
} from "../backend";
import EmergencyRequestModal from "./EmergencyRequestModal";

interface Props {
  provider: ProviderProfile;
  userLat: number;
  userLng: number;
  actor: backendInterface;
  onRequest?: () => void;
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ProviderCard({
  provider,
  userLat,
  userLng,
  actor,
  onRequest,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const distance = haversineDistance(
    userLat,
    userLng,
    provider.location.lat,
    provider.location.lng,
  );
  const colorClass =
    provider.serviceType === ServiceType.fuel
      ? "text-[#E0242A]"
      : provider.serviceType === ServiceType.mechanic
        ? "text-blue-400"
        : "text-[#2FBF71]";
  const icon =
    provider.serviceType === ServiceType.fuel
      ? "⛽"
      : provider.serviceType === ServiceType.mechanic
        ? "🔧"
        : "🚗";

  return (
    <>
      <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-4 flex flex-col gap-3 hover:border-[#E0242A]/30 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#232A33] rounded-lg flex items-center justify-center text-lg">
              {icon}
            </div>
            <div>
              <div className={`text-sm font-semibold capitalize ${colorClass}`}>
                {provider.serviceType}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-[#A7B0BC]">
                  {provider.rating.toFixed(1)} (
                  {provider.ratingCount.toString()})
                </span>
              </div>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2FBF71]/10 text-[#2FBF71] border border-[#2FBF71]/20">
            Available
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#788392]">
          <MapPin className="w-3 h-3" />
          {distance.toFixed(1)} km away
        </div>
        <div className="flex items-center gap-2 text-xs text-[#788392]">
          <Wrench className="w-3 h-3" />
          <span className="capitalize">{provider.serviceType} services</span>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full bg-[#E0242A] hover:bg-[#c41f24] text-white text-sm font-semibold py-2 rounded-lg transition-all active:scale-95"
        >
          Request {provider.serviceType}
        </button>
      </div>
      {showModal && (
        <EmergencyRequestModal
          actor={actor}
          defaultType={provider.serviceType}
          onClose={() => setShowModal(false)}
          onSubmit={() => {
            setShowModal(false);
            onRequest?.();
          }}
        />
      )}
    </>
  );
}
