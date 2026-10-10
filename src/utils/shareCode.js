import { normalizeId } from './ids.js';

const toBase64Url = (value) => {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value) => {
    let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    base64 += '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
};

export const encodeSelection = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return '';
    return toBase64Url(ids.join(','));
};

export const decodeSelection = (raw) => {
    if (raw === null || raw === undefined || raw === '') return null;
    try {
        const decoded = fromBase64Url(String(raw));
        return decoded.split(',').map(normalizeId).filter((id) => id !== null);
    } catch {
        return null;
    }
};
