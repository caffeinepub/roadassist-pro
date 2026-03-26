import {
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  MapIcon,
  Menu,
  Shield,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";
import { Role, type UserProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  profile: UserProfile;
  isAdmin: boolean;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  profile,
  isAdmin,
}: Props) {
  const { clear } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: {
    id: Page;
    label: string;
    icon: React.ReactNode;
    show?: boolean;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    { id: "map", label: "Map View", icon: <MapIcon className="w-5 h-5" /> },
    {
      id: "requests",
      label: "My Requests",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "provider",
      label: "Provider Panel",
      icon: <Wrench className="w-5 h-5" />,
      show: profile.role === Role.provider,
    },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    {
      id: "admin",
      label: "Admin",
      icon: <Shield className="w-5 h-5" />,
      show: isAdmin,
    },
  ];

  const handleNavClick = (id: Page) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-[#2B323C]">
        <Flame className="text-[#E0242A] w-7 h-7 flex-shrink-0" />
        <span className="text-lg font-bold text-[#E9EEF5]">RoadAssist Pro</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems
          .filter((item) => item.show !== false)
          .map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === item.id
                  ? "bg-[#E0242A]/10 text-[#E0242A] border border-[#E0242A]/20"
                  : "text-[#A7B0BC] hover:bg-[#232A33] hover:text-[#E9EEF5]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
      </nav>
      <div className="px-3 py-4 border-t border-[#2B323C]">
        <div className="px-4 py-2 mb-2">
          <div className="text-sm font-medium text-[#E9EEF5] truncate">
            {profile.name}
          </div>
          <div className="text-xs text-[#788392] capitalize">
            {profile.role}
          </div>
        </div>
        <button
          type="button"
          onClick={clear}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#788392] hover:bg-[#232A33] hover:text-[#E9EEF5] transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 bg-[#1B1F26] border-r border-[#2B323C] flex-shrink-0 h-screen sticky top-0">
        <SidebarInner />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1B1F26] border-b border-[#2B323C] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="text-[#E0242A] w-6 h-6" />
          <span className="text-base font-bold text-[#E9EEF5]">
            RoadAssist Pro
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#A7B0BC]"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <button
            type="button"
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="w-60 h-full bg-[#1B1F26] border-r border-[#2B323C] absolute left-0 top-0">
            <SidebarInner />
          </aside>
        </div>
      )}
    </>
  );
}
