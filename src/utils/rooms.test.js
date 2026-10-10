import { describe, it, expect } from 'vitest';
import { getRoomName } from './rooms.js';

describe('getRoomName', () => {
    const rooms = [{ id: 5, name: 'Room 01' }, { id: 'a1', name: 'Aula A' }];

    it('devuelve el nombre cuando la sala existe', () => {
        expect(getRoomName(rooms, 5)).toBe('Room 01');
        expect(getRoomName(rooms, 'a1')).toBe('Aula A');
    });

    it('devuelve TBA cuando la sala no existe', () => {
        expect(getRoomName(rooms, 999)).toBe('TBA');
    });

    it('tolera tipos distintos de id', () => {
        expect(getRoomName(rooms, '5')).toBe('Room 01');
    });

    it('devuelve TBA si rooms es undefined o vacío', () => {
        expect(getRoomName(undefined, 5)).toBe('TBA');
        expect(getRoomName([], 5)).toBe('TBA');
    });

    it('acepta un fallback custom', () => {
        expect(getRoomName(rooms, 999, '')).toBe('');
    });
});
