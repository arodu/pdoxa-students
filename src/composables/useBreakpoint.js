import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useBreakpoint(query = '(min-width: 992px)') {
    const matches = ref(false);
    let mql = null;

    const update = (event) => {
        matches.value = event.matches;
    };

    onMounted(() => {
        mql = window.matchMedia(query);
        matches.value = mql.matches;
        mql.addEventListener('change', update);
    });

    onUnmounted(() => {
        if (mql) mql.removeEventListener('change', update);
    });

    return {
        isDesktop: matches,
        isMobile: computed(() => !matches.value),
    };
}
