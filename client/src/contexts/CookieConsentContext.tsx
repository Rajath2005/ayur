import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getDeviceFingerprint, CookiePreferences, DEFAULT_PREFERENCES, ACCEPT_ALL_PREFERENCES } from '@/lib/cookieUtils';

interface CookieConsentContextType {
    hasConsent: boolean;
    preferences: CookiePreferences | null;
    acceptedAll: boolean;
    loading: boolean;
    showBanner: boolean;
    acceptAll: () => Promise<void>;
    savePreferences: (prefs: CookiePreferences) => Promise<void>;
    checkConsent: (category?: keyof CookiePreferences) => boolean;
    hideBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [hasConsent, setHasConsent] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
    const [acceptedAll, setAcceptedAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showBanner, setShowBanner] = useState(false);
    const [deviceId] = useState(() => getDeviceFingerprint());

    // Fetch consent status on mount and when user changes
    useEffect(() => {
        fetchConsentStatus();
    }, [user?.id]);

    const fetchConsentStatus = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                deviceId,
                ...(user?.id && { userId: user.id }),
            });

            const response = await fetch(`/api/cookies/status?${params}`);
            const data = await response.json();

            if (data.success && data.hasConsent && data.consent) {
                setHasConsent(true);
                setPreferences(data.consent.preferences);
                setAcceptedAll(data.consent.acceptedAll);
                setShowBanner(false);

                // Store in localStorage as backup
                localStorage.setItem('ayudost_cookie_consent', JSON.stringify(data.consent));
            } else {
                // Check localStorage as fallback
                const stored = localStorage.getItem('ayudost_cookie_consent');
                if (stored) {
                    const storedConsent = JSON.parse(stored);
                    setHasConsent(true);
                    setPreferences(storedConsent.preferences);
                    setAcceptedAll(storedConsent.acceptedAll);
                    setShowBanner(false);
                } else {
                    setShowBanner(true);
                }
            }
        } catch (error) {
            console.error('Failed to fetch cookie consent status:', error);

            // Fallback to localStorage
            const stored = localStorage.getItem('ayudost_cookie_consent');
            if (stored) {
                const storedConsent = JSON.parse(stored);
                setHasConsent(true);
                setPreferences(storedConsent.preferences);
                setAcceptedAll(storedConsent.acceptedAll);
                setShowBanner(false);
            } else {
                setShowBanner(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const acceptAll = async () => {
        try {
            const consentData = {
                userId: user?.id || null,
                deviceId,
                preferences: ACCEPT_ALL_PREFERENCES,
                acceptedAll: true,
            };

            const response = await fetch('/api/cookies/save-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(consentData),
            });

            const data = await response.json();

            if (data.success) {
                setHasConsent(true);
                setPreferences(ACCEPT_ALL_PREFERENCES);
                setAcceptedAll(true);
                setShowBanner(false);

                // Store in localStorage
                localStorage.setItem('ayudost_cookie_consent', JSON.stringify(data.consent));
            }
        } catch (error) {
            console.error('Failed to save cookie consent:', error);
        }
    };

    const savePreferences = async (prefs: CookiePreferences) => {
        try {
            const consentData = {
                userId: user?.id || null,
                deviceId,
                preferences: { ...prefs, essential: true }, // Essential always true
                acceptedAll: false,
            };

            const response = await fetch('/api/cookies/save-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(consentData),
            });

            const data = await response.json();

            if (data.success) {
                setHasConsent(true);
                setPreferences(consentData.preferences);
                setAcceptedAll(false);
                setShowBanner(false);

                // Store in localStorage
                localStorage.setItem('ayudost_cookie_consent', JSON.stringify(data.consent));
            }
        } catch (error) {
            console.error('Failed to save cookie preferences:', error);
        }
    };

    const checkConsent = (category?: keyof CookiePreferences): boolean => {
        if (!hasConsent || !preferences) return false;
        if (!category) return true; // User has made a choice
        return preferences[category] === true;
    };

    const hideBanner = () => {
        setShowBanner(false);
    };

    return (
        <CookieConsentContext.Provider
            value={{
                hasConsent,
                preferences,
                acceptedAll,
                loading,
                showBanner,
                acceptAll,
                savePreferences,
                checkConsent,
                hideBanner,
            }}
        >
            {children}
        </CookieConsentContext.Provider>
    );
}

export function useCookieConsent() {
    const context = useContext(CookieConsentContext);
    if (context === undefined) {
        throw new Error('useCookieConsent must be used within a CookieConsentProvider');
    }
    return context;
}
