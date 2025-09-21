// src/pages/HomeScreen.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Settings, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { InboxResponse, ApiError } from "@/lib/api";

const MAX_CHAR = 250;

const HomeScreen: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [note, setNote] = useState("");
  const [isDropping, setIsDropping] = useState(false);
  const [canDropLocal, setCanDropLocal] = useState<boolean | null>(null);

  // typed query: InboxResponse or ApiError
    const { data: inboxData } = useQuery<InboxResponse, ApiError>({
      queryKey: ["inbox"],
      queryFn: async () => {
        if (!token) return { note: null };
        return await api.getInboxApi(token);
      },
      enabled: !!token,
      staleTime: 30 * 1000,
    });

  const hasInbox = Boolean(inboxData?.note);

  // mutation types: DropResponse, ApiError, variables = string (content)
  const dropMutation = useMutation<{ message: string; noteId?: string }, ApiError, string>({
  mutationFn: async (content: string) => {
    if (!token) throw { status: 401, message: "Not authenticated" } as ApiError;
    return await api.dropNoteApi(token, content);
  },
  onMutate: async () => {
    setIsDropping(true);
    setCanDropLocal(false);
  },
  onSuccess: () => {
    toast({
      title: "Note dropped! 💧",
      description: "Your anonymous thought has been sent — someone will see it today.",
    });
    qc.invalidateQueries({ queryKey: ["inbox"] }); // <--- v5 style
  },
  onError: (err: ApiError) => {
    const status = err?.status ?? 500;
    if (status === 429) {
      toast({
        title: "Already dropped today",
        description: "You can only drop one note per day. Come back tomorrow.",
        variant: "destructive",
      });
      setCanDropLocal(false);
    } else if (status === 409) {
      toast({
        title: "No receivers available",
        description: "There aren't any eligible receivers right now. Try again later.",
        variant: "destructive",
      });
      setCanDropLocal(true);
    } else if (status === 400) {
      toast({
        title: "Content rejected",
        description: err.message || "Your note was rejected by moderation or it's invalid.",
        variant: "destructive",
      });
      setCanDropLocal(true);
    } else {
      toast({
        title: "Drop failed",
        description: "Server error. Please try again shortly.",
        variant: "destructive",
      });
      setCanDropLocal(true);
    }
  },
  onSettled: () => {
    setIsDropping(false);
  },
});


  const handleDropNote = async () => {
    const content = note.trim();
    if (!content) {
      toast({
        title: "Empty note",
        description: "Please write something before dropping.",
        variant: "destructive",
      });
      return;
    }
    if (content.length > MAX_CHAR) {
      toast({
        title: "Too long",
        description: `Note must be at most ${MAX_CHAR} characters.`,
        variant: "destructive",
      });
      return;
    }
    try {
      await dropMutation.mutateAsync(content);
      setNote("");
    } catch {
      // handled in onError
    }
  };

  const canDrop = canDropLocal === null ? true : canDropLocal;
  const characterCount = note.length;

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold text-gradient">DropNote</h1>
          <p className="text-sm text-muted-foreground">Share your thoughts</p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/inbox")}
            className="relative"
          >
            <Mail className="w-5 h-5" />
            {hasInbox && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Drop Counter */}
        <div className="note-card text-center">
          <div className="text-3xl mb-2">💧</div>
          <p className="text-sm text-muted-foreground">
            {canDrop ? "You can drop 1 note today" : "Come back tomorrow to drop another note"}
          </p>
        </div>

        {/* Note Input */}
        <div className="space-y-4">
          <div className="note-card space-y-4">
            <label className="text-sm font-medium text-foreground">Drop Your Note</label>

            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind today? Share your anonymous thoughts..."
              className="input-calm min-h-32 resize-none"
              maxLength={MAX_CHAR}
              disabled={!canDrop || isDropping}
            />

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Anonymous • Disappears in 24h</span>
              <span className={`${characterCount > MAX_CHAR * 0.9 ? "text-warning" : "text-muted-foreground"}`}>
                {characterCount}/{MAX_CHAR}
              </span>
            </div>
          </div>

          {/* Drop Button */}
          <Button
            onClick={handleDropNote}
            disabled={!note.trim() || !canDrop || characterCount > MAX_CHAR || isDropping}
            className="btn-gradient w-full py-4 text-lg font-medium"
          >
            <Send className="w-5 h-5 mr-2" />
            {isDropping ? "Dropping..." : "Drop Now"}
          </Button>
        </div>

        {/* Daily Inspiration */}
        <div className="note-card bg-gradient-secondary border-none">
          <div className="text-center">
            <div className="text-2xl mb-2">🌟</div>
            <p className="text-sm text-secondary-foreground/80 italic">
              "Every thought shared is a bridge between souls."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
