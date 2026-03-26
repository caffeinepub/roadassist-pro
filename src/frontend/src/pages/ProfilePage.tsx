import { User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile, backendInterface } from "../backend";

interface Props {
  profile: UserProfile;
  actor: backendInterface;
  onUpdate: (p: UserProfile) => void;
}

export default function ProfilePage({ profile, actor, onUpdate }: Props) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    try {
      const updated: UserProfile = { ...profile, name, email, phone };
      await actor.saveCallerUserProfile(updated);
      onUpdate(updated);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 pt-16 lg:pt-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#E0242A]/10 border border-[#E0242A]/20 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-[#E0242A]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#E9EEF5]">Profile</h1>
          <p className="text-sm text-[#A7B0BC] capitalize">{profile.role}</p>
        </div>
      </div>
      <div className="bg-[#1B1F26] border border-[#2B323C] rounded-xl p-5 space-y-4">
        <div>
          <label
            htmlFor="pf-name"
            className="block text-sm text-[#A7B0BC] mb-1"
          >
            Full Name
          </label>
          <input
            id="pf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-[#232A33] border border-[#2B323C] rounded-lg px-4 py-2.5 text-[#E9EEF5] placeholder-[#788392] focus:outline-none focus:border-[#E0242A] transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="pf-email"
            className="block text-sm text-[#A7B0BC] mb-1"
          >
            Email
          </label>
          <input
            id="pf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-[#232A33] border border-[#2B323C] rounded-lg px-4 py-2.5 text-[#E9EEF5] placeholder-[#788392] focus:outline-none focus:border-[#E0242A] transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="pf-phone"
            className="block text-sm text-[#A7B0BC] mb-1"
          >
            Phone
          </label>
          <input
            id="pf-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+60 12-345 6789"
            className="w-full bg-[#232A33] border border-[#2B323C] rounded-lg px-4 py-2.5 text-[#E9EEF5] placeholder-[#788392] focus:outline-none focus:border-[#E0242A] transition-colors"
          />
        </div>
        <div>
          <p className="block text-sm text-[#A7B0BC] mb-1">Account Type</p>
          <div className="bg-[#232A33] border border-[#2B323C] rounded-lg px-4 py-2.5 text-[#788392] capitalize">
            {profile.role}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#E0242A] hover:bg-[#c41f24] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
