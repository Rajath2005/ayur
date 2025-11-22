import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Camera, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserProfile {
    id: string;
    userId: string;
    name?: string;
    email: string;
    avatar?: string;
    bio?: string;
    phone?: string;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const { data: profile, isLoading } = useQuery<UserProfile>({
        queryKey: ["user-profile"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/users/me/profile");
            if (!response.ok) throw new Error("Failed to fetch profile");
            return response.json();
        },
        enabled: !!user?.id,
    });

    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        phone: "",
    });

    // Update form when profile loads
    useState(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                bio: profile.bio || "",
                phone: profile.phone || "",
            });
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await apiRequest("PUT", "/api/users/me/profile", data);
            if (!response.ok) throw new Error("Failed to update profile");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated",
                variant: "success",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Could not update profile",
                variant: "destructive",
            });
        },
    });

    const uploadAvatarMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("avatar", file);
            const response = await apiRequest("POST", "/api/users/me/avatar", formData);
            if (!response.ok) throw new Error("Failed to upload avatar");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            setAvatarFile(null);
            setAvatarPreview(null);
            toast({
                title: "Avatar updated",
                description: "Your avatar has been successfully updated",
                variant: "success",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Could not upload avatar",
                variant: "destructive",
            });
        },
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        updateProfileMutation.mutate(formData);
    };

    const handleUploadAvatar = () => {
        if (avatarFile) {
            uploadAvatarMutation.mutate(avatarFile);
        }
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
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Profile</h1>
                                <p className="text-muted-foreground">
                                    Manage your personal information and preferences
                                </p>
                            </div>

                            {isLoading ? (
                                <Card className="p-12 text-center">
                                    <div className="inline-flex flex-col items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
                                        <span className="text-sm text-muted-foreground">Loading profile...</span>
                                    </div>
                                </Card>
                            ) : (
                                <>
                                    {/* Avatar Section */}
                                    <Card className="card-premium animate-slide-up">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Camera className="h-5 w-5 text-primary" />
                                                Profile Picture
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center gap-6">
                                                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                                                    <AvatarImage
                                                        src={avatarPreview || profile?.avatar || ""}
                                                        alt={profile?.name || profile?.email}
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/20 text-primary font-bold text-2xl">
                                                        {getInitials(profile?.name, profile?.email)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleAvatarChange}
                                                        className="cursor-pointer"
                                                    />
                                                    {avatarFile && (
                                                        <Button
                                                            onClick={handleUploadAvatar}
                                                            disabled={uploadAvatarMutation.isPending}
                                                            className="w-full"
                                                        >
                                                            {uploadAvatarMutation.isPending ? "Uploading..." : "Upload Avatar"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Personal Information */}
                                    <Card className="card-premium animate-slide-up animate-delay-100">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-5 w-5 text-primary" />
                                                Personal Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profile?.email || ""}
                                                    disabled
                                                    className="bg-muted/50"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Email cannot be changed
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Enter your full name"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="bio">Bio</Label>
                                                <Textarea
                                                    id="bio"
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    placeholder="Tell us about yourself..."
                                                    rows={4}
                                                />
                                            </div>

                                            <Button
                                                onClick={handleSaveProfile}
                                                disabled={updateProfileMutation.isPending}
                                                className="w-full gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
