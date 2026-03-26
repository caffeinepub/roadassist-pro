import { Flame } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Role,
  ServiceType,
  type UserProfile,
  type backendInterface,
} from "../backend";

interface Props {
  onComplete: (profile: UserProfile) => void;
  actor: backendInterface;
}

export default function Onboarding({ onComplete, actor }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>(Role.user);
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.fuel);
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
        toast.success("Location detected!");
      },
      () => {
        setLocating(false);
        setLat(3.139);
        setLng(101.6869);
      },
    );
  };

  const handleSubmit = async () => {
    if (!name || !email || !phone) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const profile: UserProfile = { name, email, phone, role };
      await actor.saveCallerUserProfile(profile);
      if (role === Role.provider) {
        await actor.createProviderProfile({
          lat: lat ?? 3.139,
          lng: lng ?? 101.6869,
          serviceType,
        });
        toast.success("Provider profile created! Awaiting admin approval.");
      }
      onComplete(profile);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Flame className="w-10 h-10 text-[#E0242A] mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-[#E9EEF5]">
            Set Up Your Profile
          </h2>
          <p className="text-[#A7B0BC] mt-1">Tell us a bit about yourself</p>
        </div>
        <div className="bg-[#1B1F26] border border-[#2B323C] rounded-2xl p-6 space-y-4">
          <div>
            <label
              htmlFor="ob-name"
              className="block text-sm text-[#A7B0BC] mb-1"
            >
              Full Name
            </label>
            <input
              id="ob-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#232A33] border border-[#2B323C] rounded-lg px-4 py-2.5 text-[#E9EEF5] placeholder-[#788392] focus:outline-none focus:border-[#E0242A] transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="ob-email"
              className="block text-sm text-[#A7B0BC] mb-1"
            >
              Email
            </label>
            <input
              id="ob-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full bg-[#232A33] border border-[#2B323C] rounded-lg px-4 py-2.5 text-[#E9EEF5] placeholder-[#788392] focus:outline-none focus:border-[#E0242A] transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="ob-phone"
              className="block text-sm text-[#A7B0BC] mb-1"
            >
              Phone
            </label>
            <input
              id="ob-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+60 12-345 6789"
              className="w-full bg-[#232A33] border border-[#2B323C] rounded-lg px-4 py-2.5 text-[#E9EEF5] placeholder-[#788392] focus:outline-none focus:border-[#E0242A] transition-colors"
            />
          </div>
          <div>
            <p className="block text-sm text-[#A7B0BC] mb-2">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              {[Role.user, Role.provider].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    role === r
                      ? "bg-[#E0242A]/10 border-[#E0242A] text-[#E0242A]"
                      : "bg-[#232A33] border-[#2B323C] text-[#A7B0BC] hover:border-[#A7B0BC]"
                  }`}
                >
                  {r === Role.user ? "Vehicle Owner" : "Service Provider"}
                </button>
              ))}
            </div>
          </div>
          {role === Role.provider && (
            <>
              <div>
                <p className="block text-sm text-[#A7B0BC] mb-2">
                  Service Type
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ServiceType.fuel,
                    ServiceType.mechanic,
                    ServiceType.towing,
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setServiceType(s)}
                      className={`py-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                        serviceType === s
                          ? "bg-[#E0242A]/10 border-[#E0242A] text-[#E0242A]"
                          : "bg-[#232A33] border-[#2B323C] text-[#A7B0BC] hover:border-[#A7B0BC]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="block text-sm text-[#A7B0BC] mb-2">
                  Your Location
                </p>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className="w-full bg-[#232A33] border border-[#2B323C] hover:border-[#A7B0BC] rounded-lg px-4 py-2.5 text-sm text-[#A7B0BC] transition-colors disabled:opacity-50"
                >
                  {locating
                    ? "Detecting..."
                    : lat
                      ? `Location set (${lat.toFixed(3)}, ${lng?.toFixed(3)})`
                      : "Detect My Location"}
                </button>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#E0242A] hover:bg-[#c41f24] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 mt-2"
          >
            {submitting ? "Saving..." : "Get Started"}
          </button>
        </div>
      </div>
    </div>
  );
}
