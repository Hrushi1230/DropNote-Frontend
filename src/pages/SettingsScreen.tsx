// src/pages/SettingsScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, LogOut, Shield, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getProfileApi, ApiError, UserProfile } from "@/lib/api";

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState<boolean>(() => {
    try {
      return (localStorage.getItem("dropnote_notifications") ?? "true") === "true";
    } catch {
      return true;
    }
  });

  // fetch just the profile (email, joined)
  const { data: profile, isLoading, error, refetch } = useQuery<UserProfile, ApiError>({
    queryKey: ["profile"],
    queryFn: () => getProfileApi(token!),
    enabled: !!token,
    staleTime: 60 * 1000,
  });

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "Thank you for using DropNote. See you tomorrow!" });
    navigate("/");
  };

  const toggleNotifications = (v: boolean) => {
    try {
      localStorage.setItem("dropnote_notifications", String(v));
    } catch { return ;}
    setNotifications(v);
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-border/50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/home")} className="mr-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your DropNote experience</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Profile */}
        <div className="note-card">
          <h3 className="font-medium text-foreground">Account</h3>

          {isLoading && <p className="text-sm text-muted-foreground">Loading profile…</p>}

          {error && (
            <div className="text-sm text-destructive">
              Failed to load profile
              <div className="mt-2">
                <Button size="sm" onClick={() => refetch()}>Retry</Button>
              </div>
            </div>
          )}

          {profile && (
            <div className="mt-3 space-y-1">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-foreground font-medium">{profile.email}</div>

              <div className="mt-3 text-sm text-muted-foreground">Member since</div>
              <div className="text-foreground">{new Date(profile.createdAt).toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="note-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Daily Reminder</h3>
                <p className="text-sm text-muted-foreground">
                  Gentle reminder to drop your one daily note (local setting).
                </p>
              </div>
            </div>

            <Switch checked={notifications} onCheckedChange={(v) => toggleNotifications(Boolean(v))} />
          </div>
        </div>

        {/* About (static app info) */}
        <div className="note-card bg-gradient-secondary/30 border-none text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-secondary-foreground">DropNote</h3>
            <p className="text-xs text-secondary-foreground/80 mt-1">v1.0 — Connecting hearts through anonymous thoughts</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Every note disappears after 24h • Be kind and respectful
          </p>
        </div>

        {/* Privacy */}
        <div className="note-card flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Privacy & Safety</h3>
            <p className="text-sm text-muted-foreground">
              Your identity is never revealed. Messages auto-delete after 24 hours.
            </p>
          </div>
        </div>

        {/* Logout */}
        <Button onClick={handleLogout} variant="outline" className="w-full py-3 border-destructive/30 text-destructive hover:bg-destructive/5">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Thanks for being part of our mindful community 🙏</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
