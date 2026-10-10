import { describe, it, expect } from 'vitest';
import { sameId, includesId, normalizeId } from './ids.js';

describe('sameId', () => {
    it('compara por valor string, no por tipo', () => {
        expect(sameId(1, '1')).toBe(true);
        expect(sameId('10', 10)).toBe(true);
        expect(sameId(1, 2)).toBe(false);
        expect(sameId('a', 'b')).toBe(false);
    });
});

describe('includesId', () => {
    it('encuentra ids sin importar el tipo', () => {
        expect(includesId([1, 2, 3], '2')).toBe(true);
        expect(includesId(['abc', 'def'], 'abc')).toBe(true);
        expect(includesId([1, 2], 3)).toBe(false);
    });
});

describe('normalizeId', () => {
    it('conserva enteros como número', () => {
        expect(normalizeId('1')).toBe(1);
        expect(normalizeId(' 2 ')).toBe(2);
    });

    it('conserva strings no numéricos', () => {
        expect(normalizeId('abc')).toBe('abc');
        expect(normalizeId('sec-12')).toBe('sec-12');
    });

    it('devuelve null para vacíos', () => {
        expect(normalizeId('')).toBeNull();
        expect(normalizeId('   ')).toBeNull();
        expect(normalizeId(null)).toBeNull();
    });
});
