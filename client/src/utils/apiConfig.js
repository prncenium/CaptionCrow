// Resolves API base URL at runtime (not build time).
// Priority: window.__VARTA_API__ (public/api-config.js) → VITE env var → hardcoded fallback
export function getApiBase() {
    if (typeof window !== 'undefined' && window.__VARTA_API__) {
        return window.__VARTA_API__;
    }
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl;
    }
    // Ultimate fallback — never breaks regardless of env var state
    return 'https://captioncrow-1.onrender.com/api';
}
