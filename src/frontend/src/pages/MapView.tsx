import { useEffect, useState } from "react";
import type { ProviderProfile, backendInterface } from "../backend";
import MapComponent from "../components/MapComponent";

interface Props {
  actor: backendInterface;
}

export default function MapView({ actor }: Props) {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [userLat, setUserLat] = useState(3.139);
  const [userLng, setUserLng] = useState(101.6869);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setUserLat(pos.coords.latitude);
      setUserLng(pos.coords.longitude);
    });
    actor
      .getAllProviders()
      .then((ps) =>
        setProviders(ps.filter((p) => p.isApproved && p.isAvailable)),
      )
      .catch(() => {});
  }, [actor]);

  return (
    <div className="h-screen flex flex-col pt-14 lg:pt-0">
      <div className="px-6 py-5 border-b border-[#2B323C]">
        <h1 className="text-2xl font-bold text-[#E9EEF5]">Map View</h1>
        <p className="text-sm text-[#A7B0BC] mt-0.5">
          {providers.length} providers available nearby
        </p>
      </div>
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapComponent
            providers={providers}
            userLat={userLat}
            userLng={userLng}
            height="h-full"
          />
        </div>
      </div>
      <div className="px-6 py-3 bg-[#1B1F26] border-t border-[#2B323C] flex gap-4 text-xs text-[#A7B0BC]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> You
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#E0242A] inline-block" />{" "}
          Fuel
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />{" "}
          Mechanic
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#2FBF71] inline-block" />{" "}
          Towing
        </span>
      </div>
    </div>
  );
}
