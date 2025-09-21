import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, FileText, LogOut, Shield, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "Thank you for using DropNote. See you tomorrow!",
    });
    navigate("/");
  };

  const myNotes = [
    {
      id: "1",
      content: "Today I realized that happiness isn't about having everything, but appreciating what you have...",
      timestamp: "Yesterday",
      replies: 3
    },
    {
      id: "2", 
      content: "Watched the rain today and felt grateful for small moments of peace.",
      timestamp: "2 days ago",
      replies: 1
    }
  ];

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
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your DropNote experience
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Notifications */}
        <div className="note-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Daily Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Gentle reminders to drop your daily note
                </p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </div>

        {/* My Notes History */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Your Notes (Past 7 Days)</h2>
          </div>
          
          <div className="space-y-3">
            {myNotes.map((note) => (
              <div key={note.id} className="note-card">
                <p className="text-sm text-foreground mb-2 line-clamp-2">
                  {note.content}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{note.timestamp}</span>
                  <span>{note.replies} replies received</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="note-card bg-gradient-secondary/30 border-none">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-secondary-foreground">DropNote v1.0</h3>
              <p className="text-xs text-secondary-foreground/80 mt-1">
                Connecting hearts through anonymous thoughts
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Safety */}
        <div className="note-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Privacy & Safety</h3>
              <p className="text-sm text-muted-foreground">
                Your identity is always protected
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full py-3 border-destructive/30 text-destructive hover:bg-destructive/5"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Thanks for being part of our mindful community 🙏
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;