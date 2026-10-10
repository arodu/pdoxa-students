import { describe, it, expect } from 'vitest';
import {
    UNCATEGORIZED,
    compareLevels,
    sortLevels,
    normalizeLevel,
    sameLevel,
    isNumericLevel,
    levelOptionLabel,
} from './levels.js';

describe('sortLevels', () => {
    it('ordena niveles mixtos con orden natural', () => {
        expect(sortLevels([10, 2, 1, '1A'])).toEqual([1, '1A', 2, 10]);
    });

    it('ordena strings no numéricos de forma estable', () => {
        const result = sortLevels(['Básico', 'Avanzado', 'Intermedio']);
        expect(result).toEqual(['Avanzado', 'Básico', 'Intermedio']);
    });
});

describe('normalizeLevel', () => {
    it('usa Uncategorized para vacíos', () => {
        expect(normalizeLevel(null)).toBe(UNCATEGORIZED);
        expect(normalizeLevel(undefined)).toBe(UNCATEGORIZED);
        expect(normalizeLevel('')).toBe(UNCATEGORIZED);
    });

    it('conserva valores válidos, incluido 0', () => {
        expect(normalizeLevel(1)).toBe(1);
        expect(normalizeLevel(0)).toBe(0);
        expect(normalizeLevel('1A')).toBe('1A');
    });
});

describe('sameLevel', () => {
    it('compara por valor string sin importar el tipo', () => {
        expect(sameLevel(1, '1')).toBe(true);
        expect(sameLevel('1A', '1A')).toBe(true);
        expect(sameLevel(1, 2)).toBe(false);
    });

    it('trata vacío y Uncategorized como el mismo nivel', () => {
        expect(sameLevel(null, UNCATEGORIZED)).toBe(true);
    });
});

describe('isNumericLevel / levelOptionLabel', () => {
    it('detecta niveles numéricos', () => {
        expect(isNumericLevel(1)).toBe(true);
        expect(isNumericLevel('10')).toBe(true);
        expect(isNumericLevel('1A')).toBe(false);
        expect(isNumericLevel('')).toBe(false);
    });

    it('prefija Level solo si es numérico', () => {
        expect(levelOptionLabel(1)).toBe('Level 1');
        expect(levelOptionLabel('Básico')).toBe('Básico');
        expect(levelOptionLabel(UNCATEGORIZED)).toBe(UNCATEGORIZED);
    });
});
