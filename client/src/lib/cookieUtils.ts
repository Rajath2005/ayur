// Device fingerprinting utility
export function getDeviceFingerprint(): string {
    // Check if fingerprint exists in localStorage
    const stored = localStorage.getItem('ayudost_device_id');
    if (stored) return stored;

    // Generate a simple fingerprint based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let fingerprint = '';

    // Screen resolution
    fingerprint += `${window.screen.width}x${window.screen.height}`;

    // Timezone
    fingerprint += `_${new Date().getTimezoneOffset()}`;

    // Language
    fingerprint += `_${navigator.language}`;

    // Platform
    fingerprint += `_${navigator.platform}`;

    // Canvas fingerprint
    if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('AyuDost', 2, 2);
        fingerprint += `_${canvas.toDataURL().slice(-50)}`;
    }

    // Create hash from fingerprint
    const hash = Array.from(fingerprint)
        .reduce((hash, char) => {
            const chr = char.charCodeAt(0);
            hash = ((hash << 5) - hash) + chr;
            return hash & hash;
        }, 0);

    const deviceId = `device_${Math.abs(hash)}_${Date.now()}`;

    // Store for future use
    localStorage.setItem('ayudost_device_id', deviceId);

    return deviceId;
}

// Cookie consent preferences type
export interface CookiePreferences {
    essential: boolean;
    analytics: boolean;
    personalization: boolean;
    ai_logs: boolean;
}

// Default preferences
export const DEFAULT_PREFERENCES: CookiePreferences = {
    essential: true,
    analytics: false,
    personalization: false,
    ai_logs: false,
};

// Accept all preferences
export const ACCEPT_ALL_PREFERENCES: CookiePreferences = {
    essential: true,
    analytics: true,
    personalization: true,
    ai_logs: true,
};
