import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { CookieSettingsModal } from '@/components/CookieSettingsModal';

export function CookieConsentBanner() {
    const { showBanner, acceptAll, hideBanner } = useCookieConsent();
    const [showSettings, setShowSettings] = useState(false);

    if (!showBanner) return null;

    return (
        <>
            <AnimatePresence>
                {showBanner && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-lg">
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                                <div className="relative p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Cookie className="w-7 h-7 text-primary" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-lg md:text-xl font-semibold text-foreground">
                                                We value your privacy
                                            </h3>
                                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                                AyuDost AI uses cookies and similar technologies to enhance your experience,
                                                provide personalized recommendations, and improve our Ayurvedic AI services.
                                                By clicking "Accept All", you consent to our use of cookies.{' '}
                                                <a
                                                    href="/privacy-policy"
                                                    className="text-primary hover:underline font-medium"
                                                >
                                                    Learn more
                                                </a>
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                onClick={() => setShowSettings(true)}
                                                className="w-full sm:w-auto gap-2"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Customize
                                            </Button>
                                            <Button
                                                size="lg"
                                                onClick={acceptAll}
                                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                                            >
                                                Accept All
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cookie Settings Modal */}
            <CookieSettingsModal
                open={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </>
    );
}
