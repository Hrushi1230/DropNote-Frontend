import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { sendReplyApi } from "@/lib/api";

const ReplyScreen = () => {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const [reply, setReply] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [replyType, setReplyType] = useState<"text" | "voice">("text");
  const { toast } = useToast();
  const { token } = useAuth();

  const maxCharacters = 200;
  const characterCount = reply.length;

  // backend mutation
  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!token || !noteId) throw new Error("Not authenticated");
      return await sendReplyApi(token, noteId, reply);
    },
    onSuccess: () => {
      toast({
        title: "Reply Sent! 💌",
        description: "Your anonymous reply has been delivered.",
      });
      navigate("/inbox");
    },
    onError: (err: any) => {
      if (err?.status === 409) {
        toast({ title: "Already replied", description: err.message, variant: "destructive" });
      } else {
        toast({ title: "Reply failed", description: err.message || "Something went wrong", variant: "destructive" });
      }
    },
  });

  const handleSendReply = () => {
    if (!reply.trim()) return;
    replyMutation.mutate();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({ title: "Recording started", description: "Speak your reply..." });
    } else {
      setReply("Voice message recorded (30s)");
      toast({ title: "Recording stopped", description: "Voice reply ready to send." });
    }
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/note/${noteId}`)}
          className="mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Reply</h1>
          <p className="text-sm text-muted-foreground">One-time reply only</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Reply Type Selector */}
        <div className="flex space-x-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setReplyType("text")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              replyType === "text"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Text Reply
          </button>
          <button
            onClick={() => setReplyType("voice")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              replyType === "voice"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Voice Reply
          </button>
        </div>

        {/* Reply Input */}
        <div className="space-y-4">
          {replyType === "text" ? (
            <div className="note-card space-y-4">
              <label className="text-sm font-medium text-foreground">
                Your Anonymous Reply
              </label>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Share your thoughts…"
                className="input-calm min-h-32 resize-none"
                maxLength={maxCharacters}
                disabled={replyMutation.isPending}
              />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">One-time reply • Be kind & respectful</span>
                <span className={characterCount > maxCharacters * 0.9 ? "text-warning" : "text-muted-foreground"}>
                  {characterCount}/{maxCharacters}
                </span>
              </div>
            </div>
          ) : (
            <div className="note-card space-y-4 text-center">
              <label className="text-sm font-medium text-foreground">Voice Reply</label>
              <Button
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full ${
                  isRecording ? "bg-destructive hover:bg-destructive/90" : "btn-gradient"
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                {isRecording ? "Recording... Tap to stop" : "Tap to record your voice reply (max 60s)"}
              </p>
              {isRecording && (
                <div className="mt-2">
                  <div className="w-3 h-3 bg-destructive rounded-full mx-auto pulse-animation"></div>
                </div>
              )}
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSendReply}
            disabled={!reply.trim() || characterCount > maxCharacters || replyMutation.isPending}
            className="btn-gradient w-full py-4 text-lg font-medium"
          >
            <Send className="w-5 h-5 mr-2" />
            {replyMutation.isPending ? "Sending…" : "Send One-Time Reply"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReplyScreen;
