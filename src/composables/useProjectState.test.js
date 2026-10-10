import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProjectState } from './useProjectState.js';
import { useI18n } from '../i18n/index.js';

const mockRouter = () => ({ replace: vi.fn(() => Promise.resolve()) });
const STORAGE_KEY = 'schedule_selections_test-slug';

describe('initializeSync', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('carga los ids desde el query (URL) como números', () => {
        const route = { query: { courses: '1,2,3' } };
        const router = mockRouter();
        const { state, initializeSync } = useProjectState();

        initializeSync(route, router, 'test-slug');

        expect(state.selectedSectionIds).toEqual([1, 2, 3]);
        expect(router.replace).not.toHaveBeenCalled();
    });

    it('carga desde localStorage cuando no hay query y reescribe la URL', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([3, 4]));
        const route = { query: {} };
        const router = mockRouter();
        const { state, initializeSync } = useProjectState();

        initializeSync(route, router, 'test-slug');

        expect(state.selectedSectionIds).toEqual([3, 4]);
        expect(router.replace).toHaveBeenCalledWith({ query: { courses: '3,4' } });
    });

    it('la URL gana sobre localStorage', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([9]));
        const route = { query: { courses: '1,2' } };
        const router = mockRouter();
        const { state, initializeSync } = useProjectState();

        initializeSync(route, router, 'test-slug');

        expect(state.selectedSectionIds).toEqual([1, 2]);
    });

    it('conserva ids no numéricos del query sin descartarlos', () => {
        const route = { query: { courses: '1,abc,sec-12' } };
        const router = mockRouter();
        const { state, initializeSync } = useProjectState();

        initializeSync(route, router, 'test-slug');

        expect(state.selectedSectionIds).toEqual([1, 'abc', 'sec-12']);
    });

    it('restaura ids string desde localStorage sin reinterpretarlos', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(['10', '11']));
        const route = { query: {} };
        const router = mockRouter();
        const { state, initializeSync } = useProjectState();

        initializeSync(route, router, 'test-slug');

        expect(state.selectedSectionIds).toEqual(['10', '11']);
        expect(router.replace).toHaveBeenCalledWith({ query: { courses: '10,11' } });
    });
});

describe('fetchProjectData', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        useI18n().setLocale('es');
    });

    it('normaliza courses/rooms/instructors a arrays y no rompe si faltan', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ meta: { name: 'X' } }),
        })));
        const { state, fetchProjectData } = useProjectState();

        await fetchProjectData('slug');

        expect(state.courses).toEqual([]);
        expect(state.rooms).toEqual([]);
        expect(state.instructors).toEqual([]);
        expect(state.error).toBeNull();
    });

    it('acepta el cuerpo con envelope data', async () => {
        const courses = [{ id: 1, sections: [] }];
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: { courses, rooms: [], instructors: [] } }),
        })));
        const { state, fetchProjectData } = useProjectState();

        await fetchProjectData('slug');

        expect(state.courses).toEqual(courses);
    });

    it('diferencia 404 de un fallo de red', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 404 })));
        const notFound = useProjectState();
        await notFound.fetchProjectData('slug');
        const notFoundMsg = notFound.state.error;
        expect(notFoundMsg).toMatch(/no encontrado/i);

        vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))));
        const network = useProjectState();
        await network.fetchProjectData('slug');
        expect(network.state.error).toMatch(/conectar/i);
        expect(network.state.error).not.toBe(notFoundMsg);
    });

    it('diferencia un error de servidor (5xx)', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })));
        const { state, fetchProjectData } = useProjectState();

        await fetchProjectData('slug');

        expect(state.error).toMatch(/servidor/i);
    });
});
