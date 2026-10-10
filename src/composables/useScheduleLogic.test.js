import { describe, it, expect } from 'vitest';
import { useScheduleLogic, timeToMinutes, doEntriesOverlap } from './useScheduleLogic.js';
const entry = (day, start, end) => ({ day, start_time: start, end_time: end });

const buildState = (courses, selectedSectionIds) => ({ courses, selectedSectionIds });

describe('timeToMinutes (re-exportado)', () => {
    it('convierte "HH:MM"', () => {
        expect(timeToMinutes('10:15')).toBe(615);
    });
});

describe('doEntriesOverlap', () => {
    it('detecta solapamiento en el mismo día', () => {
        expect(doEntriesOverlap(entry('Monday', '08:00', '10:00'), entry('Monday', '09:00', '11:00'))).toBe(true);
    });

    it('no solapa en días distintos', () => {
        expect(doEntriesOverlap(entry('Monday', '08:00', '10:00'), entry('Tuesday', '09:00', '11:00'))).toBe(false);
    });

    it('no considera solapamiento si solo se tocan los bordes', () => {
        expect(doEntriesOverlap(entry('Monday', '08:00', '10:00'), entry('Monday', '10:00', '12:00'))).toBe(false);
    });

    it('detecta contención total', () => {
        expect(doEntriesOverlap(entry('Monday', '08:00', '12:00'), entry('Monday', '09:00', '10:00'))).toBe(true);
    });
});

describe('hasConflict', () => {
    const sectionA = { id: 10, name: 'A', entries: [entry('Monday', '08:00', '10:00')] };
    const sectionB = { id: 11, name: 'B', entries: [entry('Monday', '09:00', '11:00')] };
    const sectionC = { id: 12, name: 'C', entries: [entry('Tuesday', '09:00', '11:00')] };

    it('devuelve true cuando la sección solapa con una seleccionada', () => {
        const state = buildState([{ id: 1, name: 'X', sections: [sectionA, sectionB] }], [10]);
        const { hasConflict } = useScheduleLogic(state);
        expect(hasConflict(sectionB)).toBe(true);
    });

    it('devuelve false cuando la sección ya está seleccionada', () => {
        const state = buildState([{ id: 1, name: 'X', sections: [sectionA] }], [10]);
        const { hasConflict } = useScheduleLogic(state);
        expect(hasConflict(sectionA)).toBe(false);
    });

    it('devuelve false cuando los días difieren', () => {
        const state = buildState([{ id: 1, name: 'X', sections: [sectionA, sectionC] }], [10]);
        const { hasConflict } = useScheduleLogic(state);
        expect(hasConflict(sectionC)).toBe(false);
    });

    it('ignora las secciones indicadas en ignoreSectionIds', () => {
        const state = buildState([{ id: 1, name: 'X', sections: [sectionA, sectionB] }], [10]);
        const { hasConflict } = useScheduleLogic(state);
        expect(hasConflict(sectionB, [10])).toBe(false);
    });

    it('matchea ids aunque difiera el tipo (number vs string)', () => {
        const state = buildState([{ id: 1, name: 'X', sections: [sectionA] }], ['10']);
        const { selectedSectionsFull, hasConflict } = useScheduleLogic(state);
        expect(selectedSectionsFull.value.map(s => s.id)).toEqual([10]);
        expect(hasConflict(sectionA)).toBe(false);
    });
});

describe('getConflicts', () => {
    const mathA = { id: 10, name: 'A', entries: [entry('Monday', '08:00', '10:00')] };
    const physB = { id: 11, name: 'B', entries: [entry('Monday', '09:00', '11:00')] };
    const chemC = { id: 12, name: 'C', entries: [entry('Tuesday', '09:00', '11:00')] };
    const courses = [
        { id: 1, name: 'Cálculo I', sections: [mathA] },
        { id: 2, name: 'Física I', sections: [physB] },
    ];

    it('devuelve el detalle de la sección que choca', () => {
        const state = buildState(courses, [10]);
        const { getConflicts } = useScheduleLogic(state);

        const conflicts = getConflicts(physB);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0]).toMatchObject({
            courseName: 'Cálculo I',
            sectionName: 'A',
            day: 'Monday',
            start_time: '08:00',
            end_time: '10:00',
        });
    });

    it('devuelve vacío cuando los días difieren', () => {
        const state = buildState([{ id: 1, name: 'Cálculo I', sections: [mathA] }], [10]);
        const { getConflicts } = useScheduleLogic(state);
        expect(getConflicts(chemC)).toEqual([]);
    });

    it('devuelve vacío cuando solo se tocan los bordes', () => {
        const touching = { id: 20, name: 'D', entries: [entry('Monday', '10:00', '12:00')] };
        const state = buildState([{ id: 1, name: 'Cálculo I', sections: [mathA] }], [10]);
        const { getConflicts } = useScheduleLogic(state);
        expect(getConflicts(touching)).toEqual([]);
    });

    it('devuelve vacío cuando la sección ya está seleccionada', () => {
        const state = buildState([{ id: 1, name: 'Cálculo I', sections: [mathA] }], [10]);
        const { getConflicts } = useScheduleLogic(state);
        expect(getConflicts(mathA)).toEqual([]);
    });

    it('respeta ignoreSectionIds', () => {
        const state = buildState(courses, [10]);
        const { getConflicts } = useScheduleLogic(state);
        expect(getConflicts(physB, [10])).toEqual([]);
    });
});
