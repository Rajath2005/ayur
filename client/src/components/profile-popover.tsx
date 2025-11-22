import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { useCredits } from "@/hooks/useCredits";
import {
    User,
    Settings,
    CreditCard,
    MessageSquare,
    LogOut,
    Moon,
    Sun,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function ProfilePopover() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { credits, maxCredits } = useCredits();
    const { toast } = useToast();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Determine if we're on mobile (simplified approach)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    const handleLogout = async () => {
        try {
            await logout();
            setIsOpen(false);
            toast({
                title: "Logged out",
                description: "You have been successfully logged out",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not log out",
                variant: "destructive",
            });
        }
    };

    const handleThemeToggle = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const getInitials = (name?: string, email?: string) => {
        if (name) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        if (email) {
            return email.slice(0, 2).toUpperCase();
        }
        return "U";
    };

    // Profile Content (shared between Popover and Drawer)
    const ProfileContent = ({ onClose }: { onClose?: () => void }) => (
        <div className="flex flex-col">
            {/* Header Section */}
            <div className="p-4 lg:p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 lg:h-12 lg:w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                        <AvatarImage src={user?.avatar} alt={user?.name || user?.email} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/20 text-primary font-bold">
                            {getInitials(user?.name, user?.email)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-base lg:text-sm text-foreground truncate">
                            {user?.name || "User"}
                        </p>
                        <p className="text-sm lg:text-xs text-muted-foreground truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* Credits Badge */}
                <div className="mt-3 p-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            Credits
                        </span>
                        <span className="text-sm font-bold text-primary">
                            {credits} / {maxCredits}
                        </span>
                    </div>
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Menu Items */}
            <div className="p-2 space-y-1">
                <Link href="/profile" onClick={onClose}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 lg:h-10 rounded-xl hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40 transition-all duration-200 group"
                    >
                        <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                            <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="flex-1 text-left font-medium">View Profile</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </Link>

                <Link href="/settings" onClick={onClose}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 lg:h-10 rounded-xl hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40 transition-all duration-200 group"
                    >
                        <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                            <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="flex-1 text-left font-medium">
                            Account Settings
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </Link>

                <Link href="/dashboard" onClick={onClose}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 lg:h-10 rounded-xl hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40 transition-all duration-200 group"
                    >
                        <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                            <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="flex-1 text-left font-medium">
                            My Conversations
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </Link>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 lg:h-10 rounded-xl hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40 transition-all duration-200 group"
                    onClick={() => {
                        // TODO: Open Credits Modal when available
                        toast({
                            title: "Credits",
                            description: `You have ${credits} out of ${maxCredits} credits remaining`,
                        });
                    }}
                >
                    <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                        <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="flex-1 text-left font-medium">
                        Manage Subscription
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </div>

            <Separator className="opacity-50" />

            {/* Theme Toggle */}
            <div className="p-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-background">
                            {theme === "light" ? (
                                <Sun className="h-4 w-4 text-amber-500" />
                            ) : (
                                <Moon className="h-4 w-4 text-blue-500" />
                            )}
                        </div>
                        <span className="font-medium text-sm">
                            {theme === "light" ? "Light Mode" : "Dark Mode"}
                        </span>
                    </div>
                    <Switch checked={theme === "dark"} onCheckedChange={handleThemeToggle} />
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Logout Section */}
            <div className="p-2">
                {!showLogoutConfirm ? (
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 lg:h-10 rounded-xl 
              bg-gradient-to-r from-red-50 to-red-50/80 text-red-700 
              border border-red-200/80 
              hover:from-red-100 hover:to-red-100/90 hover:text-red-800 hover:border-red-300
              dark:from-red-950/80 dark:to-red-950/60 dark:text-red-300 
              dark:border-red-800/50 
              dark:hover:from-red-900/90 dark:hover:to-red-900/70 dark:hover:text-red-200 dark:hover:border-red-700
              transition-all duration-200"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="font-semibold">Logout</span>
                    </Button>
                ) : (
                    <div className="space-y-2 p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                        <p className="text-sm font-medium text-center text-foreground">
                            Are you sure you want to logout?
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={handleLogout}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Desktop: Popover
    if (!isMobile) {
        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-11 gap-2 px-3 rounded-xl hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40 transition-all duration-200 group"
                    >
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                            <AvatarImage src={user?.avatar} alt={user?.name || user?.email} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/20 text-primary font-bold text-xs">
                                {getInitials(user?.name, user?.email)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm hidden sm:inline">
                            {user?.name || "Profile"}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-80 p-0 rounded-2xl shadow-2xl border-border/50 bg-popover/95 backdrop-blur-xl overflow-hidden"
                    align="end"
                    sideOffset={8}
                >
                    <ProfileContent onClose={() => setIsOpen(false)} />
                </PopoverContent>
            </Popover>
        );
    }

    // Mobile: Drawer
    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-11 gap-2 px-3 rounded-xl hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40 transition-all duration-200"
                >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                        <AvatarImage src={user?.avatar} alt={user?.name || user?.email} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/20 text-primary font-bold text-xs">
                            {getInitials(user?.name, user?.email)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DrawerTrigger>
            <DrawerContent className="rounded-t-3xl bg-background/95 backdrop-blur-xl border-border/50">
                <DrawerHeader className="sr-only">
                    <DrawerTitle>Profile Menu</DrawerTitle>
                </DrawerHeader>
                <ProfileContent onClose={() => setIsOpen(false)} />
                <DrawerFooter className="pt-2 pb-6">
                    <DrawerClose asChild>
                        <Button variant="outline" className="rounded-xl">
                            Close
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
