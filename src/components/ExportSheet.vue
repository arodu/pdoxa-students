<script setup>
import { computed } from 'vue';
import { useProjectState } from '../composables/useProjectState';
import { includesId } from '../utils/ids.js';
import { getRoomName } from '../utils/rooms.js';
import { useI18n } from '../i18n/index.js';
import ScheduleGrid from './ScheduleGrid.vue';

const { state } = useProjectState();
const { t } = useI18n();

const rows = computed(() => {
    const out = [];
    state.courses.forEach(course => {
        const section = course.sections.find(s => includesId(state.selectedSectionIds, s.id));
        if (section) {
            out.push({
                course,
                section,
                roomNames: section.entries.map(e => getRoomName(state.rooms, e.room_id)),
            });
        }
    });
    return out;
});
</script>

<template>
    <div class="export-sheet" data-bs-theme="light">
        <div class="export-header">
            <h2 class="fw-bold mb-1">{{ state.projectMeta?.name || 'Schedule' }}</h2>
            <p class="text-muted mb-3">{{ t('scheduleForEnrollment') }}</p>
        </div>
        <div class="export-body d-flex">
            <div class="export-summary">
                <h5 class="fw-bold text-uppercase small mb-3">{{ t('courses') }} ({{ rows.length }})</h5>
                <div v-if="rows.length === 0" class="text-muted small">{{ t('noCoursesSelected') }}</div>
                <div v-for="row in rows" :key="row.section.id" class="mb-3">
                    <div class="fw-bold">{{ row.course.name }}</div>
                    <div class="x-small text-muted">{{ t('sec') }} {{ row.section.name }}</div>
                    <div v-for="(entry, idx) in row.section.entries" :key="idx" class="x-small">
                        {{ entry.day }} {{ entry.start_time }}-{{ entry.end_time }} · {{ row.roomNames[idx] }}
                    </div>
                </div>
            </div>
            <div class="export-grid">
                <ScheduleGrid />
            </div>
        </div>
    </div>
</template>

<style scoped>
.export-sheet {
    background: #fff;
    color: #111;
    width: 1100px;
    padding: 24px;
    font-family: 'Nunito', sans-serif;
}
.export-summary { width: 280px; flex-shrink: 0; margin-right: 16px; }
.export-grid { flex: 1 1 auto; min-width: 0; }
.x-small { font-size: 0.72rem; }
</style>
