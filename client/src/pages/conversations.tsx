import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MessageSquare, Search, Trash2, Edit3, Check, X, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";

export default function ConversationsPage() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
        queryKey: ["conversations"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/conversations");
            if (!response.ok) throw new Error("Failed to fetch conversations");
            return response.json();
        },
        enabled: !!user?.id,
    });

    const updateConversationMutation = useMutation({
        mutationFn: async ({ id, title }: { id: string; title: string }) => {
            const res = await apiRequest("PUT", `/api/conversations/${id}`, { title });
            if (!res.ok) throw new Error("Rename failed");
            return { id, title };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            setEditingId(null);
            setEditTitle("");
            toast({
                title: "Conversation renamed",
                description: "The conversation title has been updated",
                variant: "success",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Could not rename conversation",
                variant: "destructive",
            });
        },
    });

    const deleteConversationMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/conversations/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast({
                title: "Conversation deleted",
                description: "The conversation has been removed",
                variant: "destructive",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Could not delete conversation",
                variant: "destructive",
            });
        },
    });

    const filteredConversations = conversations.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRename = (conversation: Conversation) => {
        setEditingId(conversation.id);
        setEditTitle(conversation.title);
    };

    const handleSaveRename = () => {
        if (!editingId) return;
        const newTitle = editTitle.trim();
        if (!newTitle) {
            setEditingId(null);
            setEditTitle("");
            return;
        }
        updateConversationMutation.mutate({ id: editingId, title: newTitle });
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
                        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                            {/* Header */}
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                    My Conversations
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage and continue your wellness conversations
                                </p>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12 rounded-xl"
                                />
                            </div>

                            {/* Conversations List */}
                            <div className="space-y-3">
                                {isLoading ? (
                                    <Card className="p-12 text-center">
                                        <div className="inline-flex flex-col items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
                                            <span className="text-sm text-muted-foreground">Loading conversations...</span>
                                        </div>
                                    </Card>
                                ) : filteredConversations.length === 0 ? (
                                    <Card className="p-12 text-center">
                                        <div className="inline-flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                                                <MessageSquare className="h-8 w-8 text-primary/60" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground/70">
                                                    {searchQuery ? "No conversations found" : "No conversations yet"}
                                                </p>
                                                <p className="mt-1.5 text-xs text-muted-foreground/70">
                                                    {searchQuery ? "Try a different search term" : "Start a new chat to begin"}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ) : (
                                    filteredConversations.map((conversation, index) => (
                                        <Card
                                            key={conversation.id}
                                            className="group hover:shadow-md transition-all duration-200 hover:scale-[1.01] animate-slide-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                                                        <MessageSquare className="h-5 w-5 text-primary" />
                                                    </div>

                                                    {editingId === conversation.id ? (
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <Input
                                                                value={editTitle}
                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") handleSaveRename();
                                                                    if (e.key === "Escape") {
                                                                        setEditingId(null);
                                                                        setEditTitle("");
                                                                    }
                                                                }}
                                                                className="h-9"
                                                                autoFocus
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9"
                                                                onClick={handleSaveRename}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9"
                                                                onClick={() => {
                                                                    setEditingId(null);
                                                                    setEditTitle("");
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold truncate">{conversation.title}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(conversation.updatedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9"
                                                                    onClick={() => handleRename(conversation)}
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 hover:text-destructive"
                                                                    onClick={() => deleteConversationMutation.mutate(conversation.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    className="gap-2"
                                                                    onClick={() => setLocation(`/chat/${conversation.id}`)}
                                                                >
                                                                    Continue
                                                                    <ArrowRight className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
