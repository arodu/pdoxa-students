import { describe, it, expect } from 'vitest';
import { encodeSelection, decodeSelection } from './shareCode.js';

describe('shareCode', () => {
    it('round-trips numeric ids', () => {
        const ids = [10, 13, 14];
        expect(decodeSelection(encodeSelection(ids))).toEqual(ids);
    });

    it('does not expose the raw ids in the encoded value', () => {
        const encoded = encodeSelection([10, 13, 14]);
        expect(encoded).not.toContain('10');
        expect(encoded).not.toContain(',');
    });

    it('round-trips string ids without reinterpreting them', () => {
        expect(decodeSelection(encodeSelection(['abc', 'sec-12']))).toEqual(['abc', 'sec-12']);
    });

    it('returns an empty string for an empty selection', () => {
        expect(encodeSelection([])).toBe('');
        expect(encodeSelection(null)).toBe('');
    });

    it('returns null for missing or invalid input', () => {
        expect(decodeSelection('')).toBeNull();
        expect(decodeSelection(undefined)).toBeNull();
        expect(decodeSelection('!!!not-base64!!!')).toBeNull();
    });
});
