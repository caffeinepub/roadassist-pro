import { Flame, MapPin, Shield, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D10] to-[#14171C] flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 flex items-center gap-3">
        <Flame className="text-[#E0242A] w-8 h-8" />
        <span className="text-xl font-bold text-[#E9EEF5]">RoadAssist Pro</span>
      </header>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E0242A]/10 border border-[#E0242A]/30 mb-6">
              <Flame className="w-10 h-10 text-[#E0242A]" />
            </div>
            <h1 className="text-4xl font-bold text-[#E9EEF5] mb-3">
              RoadAssist Pro
            </h1>
            <p className="text-[#A7B0BC] text-lg">
              Real-time fuel & breakdown assistance when you need it most
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: <Zap className="w-5 h-5" />, label: "Fast Response" },
              { icon: <MapPin className="w-5 h-5" />, label: "Live Tracking" },
              {
                icon: <Shield className="w-5 h-5" />,
                label: "Trusted Providers",
              },
            ].map((f) => (
              <div
                key={f.label}
                className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-4 flex flex-col items-center gap-2 text-center"
              >
                <div className="text-[#E0242A]">{f.icon}</div>
                <span className="text-xs text-[#A7B0BC]">{f.label}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-[#E0242A] hover:bg-[#c41f24] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-[#E0242A]/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>Sign In with Internet Identity</>
            )}
          </button>
          <p className="text-center text-xs text-[#788392] mt-4">
            Secure, decentralized authentication on the Internet Computer
          </p>
        </div>
      </div>
    </div>
  );
}
