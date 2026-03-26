import { useEffect, useState } from "react";
import { Role, type UserProfile } from "./backend";
import Sidebar from "./components/Sidebar";
import { Toaster } from "./components/ui/sonner";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import MapView from "./pages/MapView";
import MyRequests from "./pages/MyRequests";
import Onboarding from "./pages/Onboarding";
import ProfilePage from "./pages/ProfilePage";
import ProviderDashboard from "./pages/ProviderDashboard";

export type Page =
  | "dashboard"
  | "map"
  | "requests"
  | "provider"
  | "profile"
  | "admin";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [profile, setProfile] = useState<UserProfile | null | undefined>(
    undefined,
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!identity || !actor) {
      setProfile(undefined);
      return;
    }
    setLoadingProfile(true);
    Promise.all([actor.getCallerUserProfile(), actor.isCallerAdmin()])
      .then(([p, admin]) => {
        setProfile(p);
        setIsAdmin(admin);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [identity, actor]);

  if (isInitializing || isFetching || loadingProfile) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E0242A] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#A7B0BC] text-sm">Loading RoadAssist Pro...</p>
        </div>
      </div>
    );
  }

  if (!identity) return <LoginPage />;
  if (profile === null)
    return <Onboarding onComplete={(p) => setProfile(p)} actor={actor!} />;
  if (profile === undefined) return null;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            profile={profile}
            actor={actor!}
            onNavigate={setCurrentPage}
          />
        );
      case "map":
        return <MapView actor={actor!} />;
      case "requests":
        return <MyRequests actor={actor!} profile={profile} />;
      case "provider":
        return <ProviderDashboard actor={actor!} profile={profile} />;
      case "profile":
        return (
          <ProfilePage profile={profile} actor={actor!} onUpdate={setProfile} />
        );
      case "admin":
        return <AdminDashboard actor={actor!} />;
      default:
        return (
          <Dashboard
            profile={profile}
            actor={actor!}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#E9EEF5] flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        profile={profile}
        isAdmin={isAdmin}
      />
      <main className="flex-1 overflow-auto">{renderPage()}</main>
      <Toaster theme="dark" />
    </div>
  );
}
