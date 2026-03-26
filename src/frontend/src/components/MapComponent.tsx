import { useEffect, useRef } from "react";
import type { ProviderProfile } from "../backend";

interface Props {
  providers: ProviderProfile[];
  userLat: number;
  userLng: number;
  height?: string;
}

type LeafletLib = {
  // biome-ignore lint/suspicious/noExplicitAny: leaflet CDN global
  map: (...args: any[]) => any;
  // biome-ignore lint/suspicious/noExplicitAny: leaflet CDN global
  tileLayer: (...args: any[]) => any;
  // biome-ignore lint/suspicious/noExplicitAny: leaflet CDN global
  divIcon: (...args: any[]) => any;
  // biome-ignore lint/suspicious/noExplicitAny: leaflet CDN global
  marker: (...args: any[]) => any;
};

function getLeaflet(): LeafletLib | null {
  return (window as unknown as { L?: LeafletLib }).L ?? null;
}

export default function MapComponent({
  providers,
  userLat,
  userLng,
  height = "h-96",
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/suspicious/noExplicitAny: leaflet instance
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const L = getLeaflet();
    if (!L) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current).setView([userLat, userLng], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "\u00a9 OpenStreetMap contributors",
    }).addTo(map);

    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
      className: "",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup("Your Location");

    const colors: Record<string, string> = {
      fuel: "#E0242A",
      mechanic: "#3B82F6",
      towing: "#2FBF71",
    };
    const icons: Record<string, string> = {
      fuel: "\u26fd",
      mechanic: "\ud83d\udd27",
      towing: "\ud83d\ude97",
    };
    for (const p of providers) {
      const color = colors[p.serviceType] || "#888";
      const icon = icons[p.serviceType] || "\ud83d\udccd";
      const pIcon = L.divIcon({
        html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${icon}</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([p.location.lat, p.location.lng], { icon: pIcon })
        .addTo(map)
        .bindPopup(
          `<strong>${p.serviceType}</strong><br>Rating: ${p.rating.toFixed(1)} \u2b50`,
        );
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [providers, userLat, userLng]);

  return (
    <div
      ref={mapRef}
      className={`w-full ${height}`}
      style={{ minHeight: "200px" }}
    />
  );
}
