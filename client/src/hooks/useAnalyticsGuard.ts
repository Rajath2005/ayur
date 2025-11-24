import { useCookieConsent } from '@/contexts/CookieConsentContext';

/**
 * Analytics guard utility
 * Use this to conditionally execute analytics code based on user consent
 */
export function useAnalyticsGuard() {
    const { checkConsent } = useCookieConsent();

    const trackEvent = (eventName: string, properties?: Record<string, any>) => {
        if (!checkConsent('analytics')) {
            console.log('[Analytics] Blocked - No consent:', eventName);
            return;
        }

        // Add your analytics tracking code here
        console.log('[Analytics] Tracking:', eventName, properties);

        // Example: Google Analytics
        // if (window.gtag) {
        //   window.gtag('event', eventName, properties);
        // }
    };

    const trackPageView = (pagePath: string) => {
        if (!checkConsent('analytics')) {
            console.log('[Analytics] Blocked page view - No consent:', pagePath);
            return;
        }

        // Add your page view tracking code here
        console.log('[Analytics] Page view:', pagePath);

        // Example: Google Analytics
        // if (window.gtag) {
        //   window.gtag('config', 'GA_MEASUREMENT_ID', {
        //     page_path: pagePath
        //   });
        // }
    };

    return {
        trackEvent,
        trackPageView,
        canTrack: checkConsent('analytics'),
    };
}

/**
 * Check if AI logs can be stored
 */
export function useAILogsGuard() {
    const { checkConsent } = useCookieConsent();

    return {
        canStoreAILogs: checkConsent('ai_logs'),
    };
}

/**
 * Check if personalization is allowed
 */
export function usePersonalizationGuard() {
    const { checkConsent } = useCookieConsent();

    return {
        canPersonalize: checkConsent('personalization'),
    };
}
