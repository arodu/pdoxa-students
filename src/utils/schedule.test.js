import { describe, it, expect } from 'vitest';
import {
    SLOT_DURATION,
    timeToMinutes,
    formatTime,
    getRowIndexForTime,
    getGridRowPlacement,
    computeGridSettings,
} from './schedule.js';

const entry = (day, start, end) => ({ day, start_time: start, end_time: end });
const course = (sections) => ({ sections });

describe('timeToMinutes', () => {
    it('convierte "HH:MM" a minutos', () => {
        expect(timeToMinutes('08:30')).toBe(510);
        expect(timeToMinutes('00:00')).toBe(0);
        expect(timeToMinutes('23:59')).toBe(1439);
    });

    it('devuelve 0 para valores vacíos o nulos', () => {
        expect(timeToMinutes('')).toBe(0);
        expect(timeToMinutes(null)).toBe(0);
        expect(timeToMinutes(undefined)).toBe(0);
    });
});

describe('formatTime', () => {
    it('formatea en 12h con AM/PM', () => {
        expect(formatTime('08:30')).toBe('8:30 AM');
        expect(formatTime('12:00')).toBe('12:00 PM');
        expect(formatTime('13:05')).toBe('1:05 PM');
        expect(formatTime('00:30')).toBe('12:30 AM');
    });

    it('devuelve cadena vacía para valores vacíos', () => {
        expect(formatTime('')).toBe('');
    });
});

describe('getRowIndexForTime', () => {
    it('calcula la fila 1-based a partir de la hora de inicio de la grilla', () => {
        expect(getRowIndexForTime('07:00', 7)).toBe(1);
        expect(getRowIndexForTime('08:30', 7)).toBe(19);
    });

    it('redondea al slot más cercano', () => {
        expect(getRowIndexForTime('07:02', 7)).toBe(1);
        expect(getRowIndexForTime('07:03', 7)).toBe(2);
    });
});

describe('getGridRowPlacement', () => {
    it('devuelve "start / end" para grid-row', () => {
        expect(getGridRowPlacement('08:30', '10:45', 7)).toBe('19 / 46');
    });

    it('garantiza al menos un slot de alto cuando start === end', () => {
        expect(getGridRowPlacement('09:00', '09:00', 7)).toBe('25 / 26');
    });
});

describe('computeGridSettings', () => {
    it('deriva días ordenados y rango horario desde los entries', () => {
        const courses = [
            course([{ entries: [entry('Wednesday', '08:30', '10:45')] }]),
            course([{ entries: [entry('Monday', '08:30', '10:45')] }]),
        ];
        const s = computeGridSettings(courses);
        expect(s.days).toEqual(['Monday', 'Wednesday']);
        expect(s.startHour).toBe(7);
        expect(s.endHour).toBe(12);
        expect(s.totalMinutes).toBe((12 - 7) * 60);
        expect(s.totalSlots).toBe(((12 - 7) * 60) / SLOT_DURATION);
    });

    it('cae a lunes-viernes cuando no hay entries', () => {
        const s = computeGridSettings([]);
        expect(s.days).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    });

    it('tolera entradas mal formadas', () => {
        const courses = [course([{ entries: [{ day: 'Tuesday' }] }])];
        const s = computeGridSettings(courses);
        expect(s.days).toEqual(['Tuesday']);
    });
});
