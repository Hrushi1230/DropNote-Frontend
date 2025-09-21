// src/pages/ReadNoteScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock, MessageCircle, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getInboxApi, InboxResponse, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/** helper to format time left */
function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** helper to get session key for local appreciation flag */
const appreciatedKey = (noteId: string) => `dropnote:appreciated:${noteId}`;

const ReadNoteScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { toast } = useToast();

  const { data, isPending, error, refetch } = useQuery<InboxResponse, ApiError>({
    queryKey: ["inbox"],
    queryFn: async () => {
      if (!token) return { note: null };
      return await getInboxApi(token);
    },
    enabled: !!token,
    staleTime: 15 * 1000,
  });

  // select the note only if it matches route id
  const note = useMemo(() => {
    if (!data?.note) return null;
    const nid = (data.note).id ?? (data.note).id ?? null;
    return nid === id ? data.note : null;
  }, [data, id]);

  // live countdown text
  const [timeLeft, setTimeLeft] = useState<string>("");
  useEffect(() => {
    if (!note) return;
    const update = () => {
      const ms = new Date(note.expiresAt).getTime() - Date.now();
      setTimeLeft(formatTimeLeft(ms));
    };
    update();
    const timer = setInterval(update, 60 * 1000);
    return () => clearInterval(timer);
  }, [note]);

  // ---------- Appreciation (frontend-only) ----------
  // stored in sessionStorage so it persists while the tab is open
  const [appreciatedLocal, setAppreciatedLocal] = useState<boolean>(() => {
    if (!id) return false;
    try {
      return sessionStorage.getItem(appreciatedKey(id)) === "1";
    } catch {
      return false;
    }
  });

  const handleAppreciate = () => {
    if (!note || appreciatedLocal) return;
    try {
      sessionStorage.setItem(appreciatedKey(note.id), "1");
    } catch {
      /* ignore storage errors */
    }
    setAppreciatedLocal(true);
    toast({
      title: "Appreciated ❤️",
      description: "Thanks for spreading kindness!",
    });

    // small visual "pulse" animation (optional CSS class). You can add more elaborate effects.
    const el = document.getElementById(`appreciate-btn-${note.id}`);
    if (el) {
      el.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.08)" },
          { transform: "scale(1)" }
        ],
        { duration: 300, easing: "ease-out" }
      );
    }
  };

  // ---------- Reply handler ----------
  const handleReply = () => {
    if (!note) {
      toast({ title: "No note", description: "Note not available.", variant: "destructive" });
      return;
    }
    if (note.replied) {
      toast({ title: "Already replied", description: "You have already sent a reply." });
      return;
    }
    navigate(`/reply/${note.id}`);
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <Button variant="ghost" size="sm" onClick={() => navigate("/inbox")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{timeLeft ? `${timeLeft} left` : "—"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6">
        {isPending && <div className="text-center py-16 text-muted-foreground">Loading…</div>}
        {error && (
          <div className="text-center py-16 text-red-500">
            Failed to load note: {error.message}
            <div className="mt-4">
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </div>
        )}

        {!isPending && !error && !note && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-foreground mb-2">Note not found</h3>
            <p className="text-muted-foreground text-sm">This note may have expired or already been replied to.</p>
          </div>
        )}

        {!isPending && !error && note && (
          <>
            {/* Sender Info */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Someone anonymous</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Note Content */}
            <div className="note-card mb-8">
              <p className="text-foreground leading-relaxed text-lg">{note.content}</p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {!note.replied ? (
                <Button onClick={handleReply} className="btn-gradient w-full py-4 text-lg font-medium">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send One-Time Reply
                </Button>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-muted-foreground">You've already replied to this note</p>
                </div>
              )}

              {/* Appreciate Button (frontend-only) */}
              <Button
                id={note.id ? `appreciate-btn-${note.id}` : undefined}
                variant={appreciatedLocal ? "secondary" : "outline"}
                className="w-full py-3 border-primary/30 hover:bg-primary/5"
                onClick={handleAppreciate}
                disabled={appreciatedLocal}
              >
                <Heart className="w-4 h-4 mr-2" />
                {appreciatedLocal ? "Appreciated" : "Show Appreciation"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-gradient-secondary/30">
        <div className="text-center">
          <p className="text-xs text-secondary-foreground/80">
            This note will disappear in {timeLeft || "24h"} • One reply only
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadNoteScreen;
