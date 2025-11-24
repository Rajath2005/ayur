import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, BarChart3, Sparkles, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { CookiePreferences, DEFAULT_PREFERENCES } from '@/lib/cookieUtils';

interface CookieSettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export function CookieSettingsModal({ open, onClose }: CookieSettingsModalProps) {
    const { preferences, savePreferences, acceptAll } = useCookieConsent();
    const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(
        preferences || DEFAULT_PREFERENCES
    );
    const [saving, setSaving] = useState(false);

    // Detect mobile
    const isMobile = window.innerWidth < 768;

    const handleToggle = (category: keyof CookiePreferences) => {
        if (category === 'essential') return; // Essential cannot be toggled
        setLocalPreferences(prev => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        await savePreferences(localPreferences);
        setSaving(false);
        onClose();
    };

    const handleAcceptAll = async () => {
        setSaving(true);
        await acceptAll();
        setSaving(false);
        onClose();
    };

    const categories = [
        {
            key: 'essential' as const,
            icon: Cookie,
            title: 'Essential Cookies',
            description: 'Required for the app to function. These cannot be disabled.',
            required: true,
        },
        {
            key: 'analytics' as const,
            icon: BarChart3,
            title: 'Analytics Cookies',
            description: 'Help us understand how you use AyuDost AI to improve our services.',
            required: false,
        },
        {
            key: 'personalization' as const,
            icon: Sparkles,
            title: 'Personalization Cookies',
            description: 'Remember your preferences like theme, mode selection, and settings.',
            required: false,
        },
        {
            key: 'ai_logs' as const,
            icon: MessageSquare,
            title: 'AI Session Logs',
            description: 'Store your chat conversations to improve Ayurvedic recommendations and AI quality.',
            required: false,
        },
    ];

    const content = (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                    Customize your cookie preferences below. You can change these settings at any time from your account settings.
                </p>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                {categories.map((category) => {
                    const Icon = category.icon;
                    const isEnabled = localPreferences[category.key];

                    return (
                        <div
                            key={category.key}
                            className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-4">
                                    <h4 className="font-semibold text-foreground">{category.title}</h4>
                                    <Switch
                                        checked={isEnabled}
                                        onCheckedChange={() => handleToggle(category.key)}
                                        disabled={category.required}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                                {category.required && (
                                    <p className="text-xs text-primary font-medium">Always Enabled</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                    disabled={saving}
                >
                    Cancel
                </Button>
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleAcceptAll}
                        className="w-full"
                        disabled={saving}
                    >
                        Accept All
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </div>
            </div>
        </div>
    );

    // Mobile: Use Drawer
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onClose}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader>
                        <DrawerTitle>Cookie Settings</DrawerTitle>
                        <DrawerDescription>
                            Manage your cookie preferences
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-8 overflow-y-auto">
                        {content}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    // Desktop: Use Dialog
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cookie Settings</DialogTitle>
                    <DialogDescription>
                        Manage your cookie preferences
                    </DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}
