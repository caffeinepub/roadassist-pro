import { MapPin, Phone, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ServiceType, type backendInterface } from "../backend";

interface Props {
  actor: backendInterface;
  onClose: () => void;
  onSubmit: () => void;
  defaultType?: ServiceType;
}

export default function EmergencyRequestModal({
  actor,
  onClose,
  onSubmit,
  defaultType,
}: Props) {
  const [requestType, setRequestType] = useState<ServiceType>(
    defaultType || ServiceType.fuel,
  );
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setLat(3.139);
        setLng(101.6869);
        setLocating(false);
      },
    );
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please describe your situation");
      return;
    }
    const reqLat = lat ?? 3.139;
    const reqLng = lng ?? 101.6869;
    setSubmitting(true);
    try {
      await actor.createAssistanceRequest({
        lat: reqLat,
        lng: reqLng,
        description,
        requestType,
      });
      toast.success("Emergency request submitted! Help is on the way.");
      onSubmit();
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#1B1F26] border border-[#2B323C] rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-[#2B323C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E0242A]/10 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-[#E0242A]" />
            </div>
            <h2 className="text-lg font-bold text-[#E9EEF5]">
              Emergency Request
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#788392] hover:text-[#E9EEF5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="block text-sm text-[#A7B0BC] mb-2">
              Type of Assistance
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[ServiceType.fuel, ServiceType.mechanic, ServiceType.towing].map(
                (t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setRequestType(t)}
                    className={`py-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                      requestType === t
                        ? "bg-[#E0242A]/10 border-[#E0242A] text-[#E0242A]"
                        : "bg-[#232A33] border-[#2B323C] text-[#A7B0BC] hover:border-[#A7B0BC]"
                    }`}
                  >
                    {t === ServiceType.fuel
                      ? "⛽ Fuel"
                      : t === ServiceType.mechanic
                        ? "🔧 Mechanic"
                        : "🚗 Towing"}
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="em-desc"
              className="block text-sm text-[#A7B0BC] mb-1"
            >
              Describe your situation
            </label>
            <textarea
              id="em-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Car won't start, ran out of petrol on highway..."
              rows={3}
              className="w-full bg-[#232A33] border border-[#2B323C] rounded-lg px-4 py-2.5 text-[#E9EEF5] placeholder-[#788392] focus:outline-none focus:border-[#E0242A] transition-colors resize-none text-sm"
            />
          </div>

          <div>
            <p className="block text-sm text-[#A7B0BC] mb-1">Location</p>
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="w-full flex items-center gap-2 bg-[#232A33] border border-[#2B323C] hover:border-[#A7B0BC] rounded-lg px-4 py-2.5 text-sm text-[#A7B0BC] transition-colors disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              {locating
                ? "Detecting..."
                : lat
                  ? `Location set (${lat.toFixed(3)}, ${lng?.toFixed(3)})`
                  : "Detect My Location"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#E0242A] hover:bg-[#c41f24] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#E0242A]/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                Send SOS Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
