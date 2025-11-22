import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings as SettingsIcon, Bell, Shield, Palette, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserSettings {
    userId: string;
    theme: "light" | "dark" | "system";
    emailNotifications: boolean;
    pushNotifications: boolean;
    profileVisibility: "public" | "private";
}

export default function SettingsPage() {
    const { user } = useAuth();
    const { theme: currentTheme, setTheme } = useTheme();
    const { toast } = useToast();

    const { data: settings, isLoading } = useQuery<UserSettings>({
        queryKey: ["user-settings"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/users/me/settings");
            if (!response.ok) throw new Error("Failed to fetch settings");
            return response.json();
        },
        enabled: !!user?.id,
    });

    const [formData, setFormData] = useState({
        theme: "light" as "light" | "dark" | "system",
        emailNotifications: true,
        pushNotifications: false,
        profileVisibility: "public" as "public" | "private",
    });

    // Update form when settings load
    useEffect(() => {
        if (settings) {
            setFormData({
                theme: settings.theme,
                emailNotifications: settings.emailNotifications,
                pushNotifications: settings.pushNotifications,
                profileVisibility: settings.profileVisibility,
            });
        }
    }, [settings]);

    const updateSettingsMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await apiRequest("PUT", "/api/users/me/settings", data);
            if (!response.ok) throw new Error("Failed to update settings");
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user-settings"] });
            // Apply theme change immediately
            setTheme(data.theme);
            toast({
                title: "Settings updated",
                description: "Your preferences have been successfully saved",
                variant: "success",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Could not update settings",
                variant: "destructive",
            });
        },
    });

    const handleSaveSettings = () => {
        updateSettingsMutation.mutate(formData);
    };

    const sidebarStyle = {
        "--sidebar-width": "20rem",
        "--sidebar-width-icon": "4rem",
    } as React.CSSProperties;

    return (
        <SidebarProvider style={sidebarStyle}>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
                        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                            {/* Header */}
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Settings</h1>
                                <p className="text-muted-foreground">
                                    Customize your AyurChat experience
                                </p>
                            </div>

                            {isLoading ? (
                                <Card className="p-12 text-center">
                                    <div className="inline-flex flex-col items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
                                        <span className="text-sm text-muted-foreground">Loading settings...</span>
                                    </div>
                                </Card>
                            ) : (
                                <>
                                    {/* Theme Settings */}
                                    <Card className="card-premium animate-slide-up">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Palette className="h-5 w-5 text-primary" />
                                                Appearance
                                            </CardTitle>
                                            <CardDescription>
                                                Customize how AyurChat looks on your device
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <Label>Theme</Label>
                                                <RadioGroup
                                                    value={formData.theme}
                                                    onValueChange={(value) =>
                                                        setFormData({ ...formData, theme: value as typeof formData.theme })
                                                    }
                                                >
                                                    <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <RadioGroupItem value="light" id="light" />
                                                        <Label htmlFor="light" className="flex-1 cursor-pointer">
                                                            Light
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <RadioGroupItem value="dark" id="dark" />
                                                        <Label htmlFor="dark" className="flex-1 cursor-pointer">
                                                            Dark
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <RadioGroupItem value="system" id="system" />
                                                        <Label htmlFor="system" className="flex-1 cursor-pointer">
                                                            System
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Notification Settings */}
                                    <Card className="card-premium animate-slide-up animate-delay-100">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Bell className="h-5 w-5 text-primary" />
                                                Notifications
                                            </CardTitle>
                                            <CardDescription>
                                                Manage how you receive updates
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="email-notifications">Email Notifications</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Receive updates via email
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="email-notifications"
                                                    checked={formData.emailNotifications}
                                                    onCheckedChange={(checked) =>
                                                        setFormData({ ...formData, emailNotifications: checked })
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="push-notifications">Push Notifications</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Receive push notifications
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="push-notifications"
                                                    checked={formData.pushNotifications}
                                                    onCheckedChange={(checked) =>
                                                        setFormData({ ...formData, pushNotifications: checked })
                                                    }
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Privacy Settings */}
                                    <Card className="card-premium animate-slide-up animate-delay-200">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-primary" />
                                                Privacy
                                            </CardTitle>
                                            <CardDescription>
                                                Control your privacy preferences
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <Label>Profile Visibility</Label>
                                                <RadioGroup
                                                    value={formData.profileVisibility}
                                                    onValueChange={(value) =>
                                                        setFormData({
                                                            ...formData,
                                                            profileVisibility: value as typeof formData.profileVisibility,
                                                        })
                                                    }
                                                >
                                                    <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <RadioGroupItem value="public" id="public" />
                                                        <Label htmlFor="public" className="flex-1 cursor-pointer">
                                                            Public
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <RadioGroupItem value="private" id="private" />
                                                        <Label htmlFor="private" className="flex-1 cursor-pointer">
                                                            Private
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Save Button */}
                                    <Button
                                        onClick={handleSaveSettings}
                                        disabled={updateSettingsMutation.isPending}
                                        className="w-full gap-2 h-12 text-base shadow-md hover:shadow-lg"
                                    >
                                        <Save className="h-5 w-5" />
                                        {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
