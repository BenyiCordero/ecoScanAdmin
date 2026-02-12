// js/session.js
const BASE_API_URL = 'http://localhost:8080/ecoScan_rest/api/usuario';
const GET_NAME_API_URL = `${BASE_API_URL}/getbyemail`;

const CACHE_TTL_MS = 60 * 60 * 1000;
const STORAGE_KEY = 'userProfileCache';

function now() { return Date.now(); }

function saveProfileToCache(profile) {
    const payload = { ts: now(), profile };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearUserProfile() {
    localStorage.removeItem(STORAGE_KEY);
}

export function readProfileFromCache(allowStale = false) {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.ts || !parsed?.profile) return null;
        if ((now() - parsed.ts) > CACHE_TTL_MS) {
            if (!allowStale) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            // Return stale cache as fallback
            return parsed.profile;
        }
        return parsed.profile;
    } catch (e) {
        console.warn('Cache userProfile parse error', e);
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

async function fetchUserProfileFromApiInternal(retry = false, attempt = 0) {
    const maxRetries = 3;
    const authToken = localStorage.getItem('authToken');
    const email = localStorage.getItem('email');

    if (!authToken) throw new Error('No authToken (no autenticado)');
    if (!email) throw new Error('No email en localStorage');

    const url = `${GET_NAME_API_URL}?email=${encodeURIComponent(email)}`;
    let res;
    try {
        res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (fetchError) {
        // Network error, retry
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Backoff
            return fetchUserProfileFromApiInternal(retry, attempt + 1);
        }
        throw new Error('Network error after retries');
    }

    const data = await res.json();

    if (!data) throw new Error('Respuesta inválida de perfil');
    const nombre = [
        data.nombre || '',
        data.primerApellido || '',
        data.segundoApellido || ''
    ].map(s => s?.trim()).filter(Boolean).join(' ').trim();

    const profile = {
        email: data.email,
        rol: data.rol,
        nombre: data.nombre || '',
        primerApellido: data.primerApellido || '',
        segundoApellido: data.segundoApellido || '',
        nombreCompleto: nombre,
        nombreSimple: data.nombre || '',
        primeros: data.nombre ? data.nombre.charAt(0).toUpperCase() : (nombre ? nombre.charAt(0).toUpperCase() : 'U'),
        raw: data
    };

    saveProfileToCache(profile);
    return profile;
}

export async function fetchUserProfileFromApi() {
    return fetchUserProfileFromApiInternal();
}

export async function getUserProfile({ forceRefresh = false } = {}) {
    if (!forceRefresh) {
        const cached = readProfileFromCache();
        if (cached) return cached;
    }
    try {
        const profile = await fetchUserProfileFromApi();
        return profile;
    } catch (e) {
        // Fallback to stale cache if fetch fails
        const stale = readProfileFromCache(true);
        if (stale) return stale;
        throw e; // Re-throw if no fallback
    }
}