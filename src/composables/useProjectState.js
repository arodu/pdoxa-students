import { reactive, readonly, watch } from 'vue';
import { sameId, normalizeId } from '../utils/ids.js';
import { normalizeLevel } from '../utils/levels.js';
import { encodeSelection, decodeSelection } from '../utils/shareCode.js';
import { useI18n } from '../i18n/index.js';

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const state = reactive({
    projectMeta: null,
    courses: [],
    rooms: [],
    instructors: [],
    selectedSectionIds: [],
    isLoading: false,
    error: null,
    // Se agregó 't' (timestamp) para forzar la reactividad en clicks repetidos
    uiFocus: {
        level: '',
        courseId: '',
        t: 0
    }
});

let isInitializing = false;

export function useProjectState() {
    const { t } = useI18n();
    
    const fetchProjectData = async (slug) => {
        state.isLoading = true;
        state.error = null;

        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        if (!apiUrl) {
            state.error = t('errorNoConfig');
            state.isLoading = false;
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/v1/schedule/${slug}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                const error = new Error(`HTTP error! status: ${response.status}`);
                error.code = response.status === 404 ? 'not_found' : 'server';
                throw error;
            }
            
            const jsonResponse = await response.json();
            const data = jsonResponse.data || jsonResponse;
            
            state.projectMeta = isPlainObject(data.meta) ? data.meta : null;
            state.courses = Array.isArray(data.courses) ? data.courses : [];
            state.rooms = Array.isArray(data.rooms) ? data.rooms : [];
            state.instructors = Array.isArray(data.instructors) ? data.instructors : [];
            
        } catch (error) {
            if (error?.code === 'not_found') {
                state.error = t('errorNotFound');
            } else if (error?.code === 'server') {
                state.error = t('errorServer');
            } else if (error instanceof TypeError) {
                state.error = t('errorNetwork');
            } else {
                state.error = t('errorGeneric');
            }
            console.error('API Fetch Error:', error);
        } finally {
            state.isLoading = false;
        }
    };

    const toggleSection = (sectionId) => {
        const index = state.selectedSectionIds.findIndex(id => sameId(id, sectionId));
        if (index === -1) {
            state.selectedSectionIds.push(sectionId);
        } else {
            state.selectedSectionIds.splice(index, 1);
        }
    };

    const focusCourse = (course) => {
        if (course) {
            state.uiFocus.level = normalizeLevel(course.level);
            state.uiFocus.courseId = course.id;
            state.uiFocus.t = Date.now(); // Fuerza a los Watchers a dispararse siempre
        }
    };

    const initializeSync = (route, router, slug) => {
        isInitializing = true;
        const storageKey = `schedule_selections_${slug}`;

        // `c` is the encoded selection; `courses` is the legacy (raw CSV) param.
        const urlSelection = decodeSelection(route.query.c);
        const legacySelection = route.query.courses
            ? String(route.query.courses).split(',').map(normalizeId).filter(id => id !== null)
            : null;

        let loadedFromUrl = false;
        const urlIds = (urlSelection && urlSelection.length > 0) ? urlSelection : legacySelection;

        if (urlIds && urlIds.length > 0) {
            state.selectedSectionIds.splice(0, state.selectedSectionIds.length, ...urlIds);
            loadedFromUrl = true;
        }

        if (!loadedFromUrl) {
            const savedIds = localStorage.getItem(storageKey);
            if (savedIds) {
                try {
                    const parsedIds = JSON.parse(savedIds);
                    if (Array.isArray(parsedIds) && parsedIds.length > 0) {
                        state.selectedSectionIds.splice(0, state.selectedSectionIds.length, ...parsedIds);
                        router.replace({ query: { ...route.query, c: encodeSelection(parsedIds) } });
                    }
                } catch (e) {
                    console.error('Error parsing local storage data:', e);
                }
            }
        }

        isInitializing = false;

        watch(() => state.selectedSectionIds, (newIds) => {
            if (isInitializing) return;

            localStorage.setItem(storageKey, JSON.stringify(newIds));

            const newQuery = { ...route.query };
            delete newQuery.courses;
            if (newIds.length > 0) {
                newQuery.c = encodeSelection(newIds);
            } else {
                delete newQuery.c;
            }

            router.replace({ query: newQuery }).catch(err => {
                if (err.name !== 'NavigationDuplicated') console.error(err);
            });
        }, { deep: true });
    };

    return {
        state: readonly(state),
        fetchProjectData,
        toggleSection,
        initializeSync,
        focusCourse
    };
}