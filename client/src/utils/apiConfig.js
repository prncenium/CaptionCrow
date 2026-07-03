// In dev mode: relative /api goes through Vite proxy → localhost:5000 (local server)
// In production build: use window.__VARTA_API__ set by public/api-config.js → Render URL
export function getApiBase() {
    if (import.meta.env.DEV) {
        return '/api';
    }
    if (typeof window !== 'undefined' && window.__VARTA_API__) {
        return window.__VARTA_API__;
    }
    return 'https://captioncrow-1.onrender.com/api';
}
