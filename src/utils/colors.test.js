import { describe, it, expect } from 'vitest';
import { courseColor, PALETTE } from './colors.js';

describe('courseColor', () => {
    it('es estable para la misma clave', () => {
        expect(courseColor(6)).toEqual(courseColor(6));
        expect(courseColor('MAT101')).toEqual(courseColor('MAT101'));
    });

    it('devuelve siempre un color de la paleta con bg/border/text', () => {
        for (const key of [1, 2, 3, 'a', 'fisica', 42]) {
            const color = courseColor(key);
            expect(PALETTE).toContainEqual(color);
            expect(color).toHaveProperty('bg');
            expect(color).toHaveProperty('border');
            expect(color).toHaveProperty('text');
        }
    });

    it('reparte claves distintas entre la paleta', () => {
        const seen = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((k) => courseColor(k).border));
        expect(seen.size).toBeGreaterThan(1);
    });
});
