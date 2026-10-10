<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectState } from '../composables/useProjectState';

import CourseList from '../components/CourseList.vue'; 
import ScheduleGrid from '../components/ScheduleGrid.vue'; 
import MyScheduleList from '../components/MyScheduleList.vue'; 
import ExportSheet from '../components/ExportSheet.vue'; 
import { useBreakpoint } from '../composables/useBreakpoint';
import { useI18n } from '../i18n/index.js';
import { toPng } from 'html-to-image';

const route = useRoute();
const router = useRouter();
const { state, fetchProjectData, initializeSync } = useProjectState();
const { t } = useI18n();

const { isDesktop, isMobile } = useBreakpoint();
const showMobileSchedule = ref(false);

const isDarkMode = ref(false);
const copied = ref(false);

const printSchedule = () => window.print();
const toggleDarkMode = () => isDarkMode.value = !isDarkMode.value;

const exportRef = ref(null);

const downloadImage = async () => {
    const node = exportRef.value;
    if (!node) return;
    node.classList.add('export-capturing');
    try {
        await nextTick();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const dataUrl = await toPng(node, { pixelRatio: 3, backgroundColor: '#ffffff', cacheBust: true });
        const link = document.createElement('a');
        link.download = `${state.projectMeta?.slug || 'horario'}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (e) {
        console.error('Failed to export image', e);
    } finally {
        node.classList.remove('export-capturing');
    }
};

const shareSchedule = async () => {
    const currentUrl = window.location.href;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
        try { await navigator.share({ title: 'Schedule', text: 'Check this out!', url: currentUrl }); } 
        catch (e) { console.log('Share cancelled', e); }
    } else {
        try {
            await navigator.clipboard.writeText(currentUrl);
            copied.value = true;
            setTimeout(() => copied.value = false, 2000);
        } catch (e) { console.error('Failed to copy', e); }
    }
};

watch(isDarkMode, (newValue) => {
    document.documentElement.setAttribute('data-bs-theme', newValue ? 'dark' : 'light');
    localStorage.setItem('schedule_theme', newValue ? 'dark' : 'light');
});

onMounted(() => {
    if (localStorage.getItem('schedule_theme') === 'dark') isDarkMode.value = true;
    const slug = route.params.slug || route.path.replace('/', '');
    if (slug) {
        fetchProjectData(slug);
        initializeSync(route, router, slug);
    }
});
</script>

<template>
    <div class="schedule-wrapper print-mode-landscape-fixed">
        
        <div class="page-heading py-1 px-3 mb-0 flex-shrink-0">
            
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 d-print-none">
                <h6 class="mb-0 text-truncate fw-bold">{{ t('appTitle') }}</h6>
                <div class="header-actions d-flex gap-2">
                    <button @click="shareSchedule" :aria-label="t('share')" class="btn btn-sm btn-subtle rounded-pill shadow-sm" :title="t('share')">
                        <i class="bi bi-share"></i><span class="d-none lg:d-inline ms-1">{{ copied ? t('copied') : t('share') }}</span>
                    </button>
                    <button @click="downloadImage" :aria-label="t('image')" class="btn btn-sm btn-subtle rounded-pill shadow-sm" :title="t('image')">
                        <i class="bi bi-image"></i><span class="d-none lg:d-inline ms-1">{{ t('image') }}</span>
                    </button>
                    <button @click="printSchedule" :aria-label="t('print')" class="btn btn-sm btn-subtle rounded-pill shadow-sm" :title="t('print')">
                        <i class="bi bi-printer"></i><span class="d-none lg:d-inline ms-1">{{ t('print') }}</span>
                    </button>
                    <button @click="toggleDarkMode" :aria-label="isDarkMode ? t('light') : t('dark')" :aria-pressed="isDarkMode ? 'true' : 'false'" class="btn btn-sm btn-solid theme-primary rounded-pill shadow-sm" :title="isDarkMode ? t('light') : t('dark')">
                        <i :class="isDarkMode ? 'bi bi-sun' : 'bi bi-moon-stars'"></i><span class="d-none lg:d-inline ms-1">{{ isDarkMode ? t('light') : t('dark') }}</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="page-content print-main-content container-fluid pt-1 px-2 lg:px-3 pb-3 d-flex flex-column flex-grow-1">
            <div class="row gx-3 gy-3 lg:gy-0 m-0 flex-grow-1 align-items-stretch">
                
                <div class="col-12 px-0 lg:pe-3 d-print-none" :class="isDesktop ? 'lg:col-3' : ''">
                    <div class="card shadow-sm h-100 mb-0">
                        <div class="card-body p-3 d-flex flex-column">
                            <div v-if="state.isLoading" class="text-center fg-secondary mt-4">
                                <div class="spinner-border spinner-sm me-2"></div>{{ t('loading') }}
                            </div>
                            <div v-else-if="state.error" class="alert theme-danger">{{ state.error }}</div>
                            <CourseList v-else />
                        </div>
                    </div>
                </div>

                <div class="col-12 px-0 schedule-grid-col d-flex flex-column" :class="isDesktop ? 'lg:col-6' : ''">
                    <div class="card shadow-sm h-100 mb-0 schedule-grid-card d-flex flex-column">
                        <div class="card-body p-2 md:p-3 schedule-grid-body flex-grow-1 d-flex flex-column overflow-auto">
                            <div v-if="!state.isLoading && !state.error && state.courses.length === 0"
                                 class="text-center fg-secondary my-auto py-5">
                                <i class="bi bi-inbox text-2xl d-block mb-2"></i>
                                <p class="mb-0">{{ t('noCoursesAvailable') }}</p>
                            </div>
                            <ScheduleGrid v-else-if="!state.isLoading && !state.error" class="flex-grow-1" />
                        </div>
                    </div>
                </div>

                <div v-if="isDesktop" class="lg:col-3 px-0 lg:ps-3 d-print-none">
                    <div class="card shadow-sm h-100 mb-0">
                        <div class="card-body p-3 d-flex flex-column">
                            <MyScheduleList />
                        </div>
                    </div>
                </div>

            </div>

            <button v-if="isMobile" class="ms-chip d-print-none" @click="showMobileSchedule = !showMobileSchedule">
                <i class="bi bi-briefcase me-1"></i> {{ t('mySchedule') }} ({{ state.selectedSectionIds.length }})
            </button>

            <div v-if="isMobile && showMobileSchedule" class="ms-panel d-print-none">
                <button class="btn btn-sm btn-subtle float-end" :aria-label="t('close')" @click="showMobileSchedule = false">&times;</button>
                <MyScheduleList />
            </div>
        </div>

        <div class="export-container" ref="exportRef">
            <ExportSheet />
        </div>
    </div>
</template>

<style>
.x-small { font-size: 0.75rem; }

/* Mobile floating chip + panel for "My Schedule" */
.ms-chip {
    position: fixed; right: 16px; bottom: 16px; z-index: 1040;
    background: var(--bg-body); border: 1px solid var(--app-accent); color: var(--app-accent);
    border-radius: 999px; padding: 8px 14px; font-weight: 700;
    box-shadow: 0 4px 12px rgba(0, 0, 0, .15); cursor: pointer;
}
.ms-panel {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 1050;
    background: var(--bg-body); border-top: 1px solid var(--border-color);
    border-radius: 16px 16px 0 0; padding: 16px; max-height: 60vh; overflow: auto;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, .15);
}

/* FIX VISTA PANTALLA: Wrapper relajado. Scroll natural, sin cortes. */
.schedule-wrapper { 
    min-height: 100vh; 
    display: flex; 
    flex-direction: column; 
    padding: 0;
}

.export-container { position: absolute; left: -99999px; top: 0; }
.export-container.export-capturing { position: fixed; left: 0; top: 0; z-index: 99999; background: #fff; }

/* =========================================
  IMPRESIÓN: solo el ExportSheet
========================================= */
@media print {
    @page { size: landscape; margin: 5mm; }

    .schedule-wrapper > *:not(.export-container) { display: none !important; }

    .export-container {
        position: static !important; left: auto !important; top: auto !important;
        display: block !important;
    }
    .export-container .export-sheet { width: 100% !important; padding: 0 !important; }
    .export-container .schedule-container { min-width: 0 !important; }
    .export-container .grid-body { min-height: 0 !important; }

    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>