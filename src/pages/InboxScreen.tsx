// src/pages/InboxScreen.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getInboxApi, InboxResponse, ApiError } from "@/lib/api";

const InboxScreen: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // v5 useQuery
  const {
    data,
    isPending,   // ✅ in v5: "isLoading" → "isPending"
    error,
  } = useQuery<InboxResponse, ApiError>({
    queryKey: ["inbox"],
    queryFn: async () => {
      if (!token) return { note: null };
      return await getInboxApi(token);
    },
    enabled: !!token,
    staleTime: 30 * 1000,
  });

  const note = data?.note;

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/home")}
          className="mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div>
          <h1 className="text-xl font-bold text-foreground">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            {note ? "1 anonymous note" : "No notes"}
          </p>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 p-4 space-y-4">
        {isPending && (
          <div className="text-center py-16 text-muted-foreground">Loading…</div>
        )}
        {error && (
          <div className="text-center py-16 text-red-500">
            Failed to load inbox: {error.message}
          </div>
        )}

        {!isPending && !error && note && (
          <div
            key={note.id}
            onClick={() => navigate(`/note/${note.id}`)}
            className="note-card cursor-pointer hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Someone anonymous
                </span>
              </div>

              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(note.expiresAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <p className="text-foreground leading-relaxed mb-4 line-clamp-3">
              {note.content}
            </p>

            {/* Footer */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(note.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {note.replied ? (
                  <span className="text-xs text-muted-foreground flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Replied
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs px-3 py-1 hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/reply/${note.id}`);
                    }}
                  >
                    Reply
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {!isPending && !error && !note && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No notes yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Your anonymous notes will appear here
            </p>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="p-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            All notes disappear after 24 hours • Stay kind & respectful
          </p>
        </div>
      </div>
    </div>
  );
};

export default InboxScreen;
