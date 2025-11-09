import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut, User, Mail, Settings, Bell, Shield, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDashboard({ open, onOpenChange }: UserDashboardProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setLocation("/");
      onOpenChange(false);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not log out",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 gap-0 !flex !flex-col overflow-hidden">
        <DialogHeader className="px-4 pt-6 pb-4 sm:px-6 sm:pt-6 sm:pb-4 flex-shrink-0 border-b bg-background">
          <DialogTitle className="text-lg sm:text-xl">User Profile</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 sm:space-y-6 px-4 py-4 sm:px-6 sm:py-6">
            {/* User Info Section */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={user.name || user.email} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl">
                  {user.name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold truncate">
                  {user.name || "User"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <Separator />

            {/* Account Details */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Account
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium">Name</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {user.name || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium">Email</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Settings Options */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Settings
              </h4>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm"
                  onClick={() => {
                    toast({
                      title: "Settings",
                      description: "Settings panel coming soon",
                    });
                  }}
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Preferences</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm"
                  onClick={() => {
                    toast({
                      title: "Notifications",
                      description: "Notification settings coming soon",
                    });
                  }}
                >
                  <Bell className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Notifications</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm"
                  onClick={() => {
                    toast({
                      title: "Privacy",
                      description: "Privacy settings coming soon",
                    });
                  }}
                >
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Privacy & Security</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm"
                  onClick={() => {
                    toast({
                      title: "Help & Support",
                      description: "Help center coming soon",
                    });
                  }}
                >
                  <HelpCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Help & Support</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Logout Button */}
            <Button
              variant="destructive"
              className="w-full gap-2 h-10 sm:h-11 text-sm sm:text-base"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </Button>
          </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

