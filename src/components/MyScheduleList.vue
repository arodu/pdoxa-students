<script setup>
import { computed } from 'vue';
import { useProjectState } from '../composables/useProjectState';
import { includesId } from '../utils/ids.js';
import { useI18n } from '../i18n/index.js';

const { state, toggleSection, focusCourse } = useProjectState();
const { t } = useI18n();
const repoUrl = import.meta.env.VITE_REPO_URL;

const mySchedule = computed(() => {
    const selected = [];
    state.courses.forEach(course => {
        const selectedSection = course.sections.find(s => includesId(state.selectedSectionIds, s.id));
        if (selectedSection) {
            selected.push({ course, section: selectedSection });
        }
    });
    return selected;
});

const removeCourse = (sectionId) => toggleSection(sectionId);
</script>

<template>
    <div class="my-schedule d-flex flex-column h-100">
        <h6 class="text-uppercase text-muted fw-bold mb-3 small">
            <i class="bi bi-briefcase me-1"></i> {{ t('mySchedule') }} ({{ mySchedule.length }})
        </h6>
        <div v-if="mySchedule.length === 0" class="text-center text-muted small py-3 bg-body-tertiary rounded">
            {{ t('noCoursesSelected') }}
        </div>
        <div v-else class="d-flex flex-column gap-2 overflow-auto pe-1">
            <div v-for="item in mySchedule" :key="item.section.id"
                 @click="focusCourse(item.course)"
                 class="cart-item d-flex justify-content-between align-items-center p-2 border rounded bg-body shadow-sm transition-all cursor-pointer">
                <div class="text-truncate pe-2 w-100">
                    <div class="fw-bold small text-truncate text-primary" :title="item.course.name">{{ item.course.name }}</div>
                    <div class="x-small text-muted">{{ t('sec') }} {{ item.section.name }}</div>
                </div>
                <button @click.stop="removeCourse(item.section.id)" class="btn btn-sm btn-outline-danger p-1 rounded" :title="t('dropCourse')" :aria-label="`${t('dropCourse')}: ${item.course.name}`">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>

        <div class="info-note mt-3">
            <i class="bi bi-info-circle me-1"></i>{{ t('scheduleNotice') }}
        </div>

        <div class="mt-auto pt-3 text-center text-muted x-small">
            <a v-if="repoUrl" class="text-muted text-decoration-none" :href="repoUrl" target="_blank" rel="noopener">
                <i class="bi bi-github me-1"></i>Fork me on GitHub
            </a>
        </div>
    </div>
</template>

<style scoped>
.x-small { font-size: 0.7rem; }
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.2s ease; }
.cart-item { border-color: var(--bs-border-color) !important; }
.cart-item:hover { border-color: var(--app-accent) !important; transform: translateX(2px); }
.info-note {
    font-size: 0.72rem;
    line-height: 1.35;
    color: var(--bs-secondary-color);
    background: var(--bs-tertiary-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 8px;
    padding: 8px 10px;
}
.overflow-auto::-webkit-scrollbar { width: 4px; }
.overflow-auto::-webkit-scrollbar-thumb { background: var(--bs-border-color); border-radius: 4px; }
</style>
