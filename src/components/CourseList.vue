<script setup>
import { ref, computed, watch } from 'vue';
import { useProjectState } from '../composables/useProjectState';
import { useScheduleLogic } from '../composables/useScheduleLogic';
import { includesId } from '../utils/ids.js';
import { normalizeLevel, compareLevels, levelOptionLabel } from '../utils/levels.js';
import { getRoomName as getRoomNameFrom } from '../utils/rooms.js';
import { useI18n } from '../i18n/index.js';

const { state, toggleSection } = useProjectState();
const { hasConflict, getConflicts } = useScheduleLogic(state);
const { t } = useI18n();

const search = ref('');
const expandedCourseId = ref('');

const normalize = (value) => (value ?? '').toString().toLowerCase();

const filteredCourses = computed(() => {
    const query = normalize(search.value).trim();
    if (!query) return state.courses;
    return state.courses.filter(course =>
        normalize(course.name).includes(query) || normalize(course.code).includes(query)
    );
});

const coursesByLevel = computed(() => {
    const map = new Map();
    filteredCourses.value.forEach(course => {
        const level = normalizeLevel(course.level);
        if (!map.has(level)) map.set(level, []);
        map.get(level).push(course);
    });
    return [...map.entries()]
        .sort((a, b) => compareLevels(a[0], b[0]))
        .map(([level, courses]) => ({ level, courses }));
});

const isExpanded = (course) => expandedCourseId.value !== '' && String(expandedCourseId.value) === String(course.id);

const toggleCourse = (course) => {
    expandedCourseId.value = isExpanded(course) ? '' : course.id;
};

// Clicking a grid block focuses (opens) its course here.
watch(() => state.uiFocus.t, () => {
    const focus = state.uiFocus;
    if (focus.courseId) {
        search.value = '';
        expandedCourseId.value = focus.courseId;
    }
});

const isSelected = (sectionId) => includesId(state.selectedSectionIds, sectionId);

const getSelectedSectionIdForCourse = (course) => {
    const selected = course.sections.find(s => isSelected(s.id));
    return selected ? selected.id : null;
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    return `${h}:${m}`;
};

const getRoomName = (roomId) => getRoomNameFrom(state.rooms, roomId);

const sectionConflicts = (course, section) => getConflicts(section, [getSelectedSectionIdForCourse(course)]);

const conflictText = (course, section) => {
    const list = sectionConflicts(course, section);
    if (!list.length) return '';
    const first = list[0];
    const extra = list.length > 1 ? ` (+${list.length - 1})` : '';
    return `${t('conflictsWith')}: ${first.courseName} (${first.sectionName}) — ${first.day} ${formatTime(first.start_time)}-${formatTime(first.end_time)}${extra}`;
};

const levelHeading = (level) => level === 'Uncategorized' ? t('uncategorized') : levelOptionLabel(level, t('level'));

const handleSectionSelect = (course, section) => {
    if (hasConflict(section, [getSelectedSectionIdForCourse(course)]) && !isSelected(section.id)) {
        return;
    }
    if (isSelected(section.id)) {
        toggleSection(section.id);
        return;
    }
    const sameCourseSelectedIds = course.sections.filter(s => isSelected(s.id)).map(s => s.id);
    sameCourseSelectedIds.forEach(id => toggleSection(id));
    toggleSection(section.id);
};
</script>

<template>
    <div class="course-selector-wrapper d-flex flex-column h-100">

        <div class="selection-area mb-3">
            <h6 class="text-uppercase fg-secondary fw-bold mb-3 small">{{ t('findCourses') }}</h6>
            <div class="input-group input-group-sm mb-2">
                <span class="input-group-text bg-2"><i class="bi bi-search"></i></span>
                <input v-model="search" type="search" class="form-control shadow-sm" :placeholder="t('searchCourses')" :aria-label="t('searchCourses')">
            </div>
            <div class="course-list overflow-auto pe-1">
                <div v-for="group in coursesByLevel" :key="group.level" class="mb-2">
                    <div class="level-heading fg-secondary fw-bold text-uppercase">{{ levelHeading(group.level) }}</div>

                    <div v-for="course in group.courses" :key="course.id" class="course-accordion mb-1">
                        <button
                            type="button"
                            class="course-item w-100 text-start border rounded-2 p-2 d-flex justify-content-between align-items-center"
                            :class="{ 'course-item--open': isExpanded(course) }"
                            :aria-expanded="isExpanded(course) ? 'true' : 'false'"
                            :aria-controls="`course-sections-${course.id}`"
                            @click="toggleCourse(course)"
                        >
                            <span class="fw-bold small text-truncate pe-2">{{ course.name }}</span>
                            <span class="d-flex align-items-center gap-1 flex-shrink-0">
                                <i v-if="getSelectedSectionIdForCourse(course) !== null" class="bi bi-check-circle-fill fg-primary"></i>
                                <i class="bi" :class="isExpanded(course) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                            </span>
                        </button>

                        <div
                            v-if="isExpanded(course)"
                            :id="`course-sections-${course.id}`"
                            class="course-sections d-grid gap-2 mt-1 ps-2"
                        >
                            <button
                                v-for="section in course.sections"
                                :key="section.id"
                                type="button"
                                :aria-pressed="isSelected(section.id) ? 'true' : 'false'"
                                :aria-label="section.name"
                                @click="handleSectionSelect(course, section)"
                                class="section-card p-2 border rounded-3 position-relative cursor-pointer transition-all text-start w-100"
                                :class="[
                                    isSelected(section.id) ? 'border-primary section-card--selected shadow-sm' : 'border section-card--default',
                                    hasConflict(section, [getSelectedSectionIdForCourse(course)]) && !isSelected(section.id) ? 'opacity-50 grayscale' : ''
                                ]"
                            >
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="fw-bold small">{{ section.name }}</span>
                                    <i v-if="hasConflict(section, [getSelectedSectionIdForCourse(course)]) && !isSelected(section.id)"
                                       class="bi bi-exclamation-triangle-fill fg-danger x-small"></i>
                                </div>
                                <div v-if="!isSelected(section.id) && sectionConflicts(course, section).length"
                                     class="x-small fg-danger fw-semibold mt-1 text-truncate" :title="conflictText(course, section)">
                                    {{ conflictText(course, section) }}
                                </div>
                                <div v-if="section.entries.length" class="entries-list">
                                    <div v-for="entry in section.entries" :key="entry.id" class="d-flex justify-content-between x-small fg-secondary">
                                        <span>{{ entry.day }} {{ formatTime(entry.start_time) }}-{{ formatTime(entry.end_time) }}</span>
                                        <span class="text-truncate ms-1">{{ getRoomName(entry.room_id) }}</span>
                                    </div>
                                </div>
                                <div v-else class="x-small fg-secondary">{{ t('noScheduleAssigned') }}</div>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="filteredCourses.length === 0" class="fg-secondary small text-center py-3">{{ t('noResults') }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.course-selector-wrapper { max-height: calc(100vh - 160px); }
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.2s ease; }
.x-small { font-size: 0.7rem; }
.level-heading { font-size: 0.68rem; letter-spacing: .03em; margin-bottom: 4px; }
.course-list { max-height: calc(100vh - 260px); }

.course-item {
    background-color: var(--bg-2);
    border-color: var(--border-color) !important;
    color: var(--fg-body);
}
.course-item:hover { border-color: var(--app-accent) !important; background-color: var(--bg-3); }
.course-item--open {
    background-color: color-mix(in srgb, var(--app-accent) 12%, transparent);
    border-color: var(--app-accent) !important;
}

.course-sections { border-left: 2px solid var(--border-color); margin-left: 2px; }

.grayscale { filter: grayscale(1); }
.section-card { background-color: var(--bg-2); border-color: var(--border-color) !important; color: inherit; }
.section-card--default { background-color: var(--bg-2); }
.section-card--selected {
    background-color: color-mix(in srgb, var(--app-accent) 12%, transparent);
    border-color: var(--app-accent) !important;
}
.section-card:hover:not(.opacity-50) { border-color: var(--app-accent) !important; background-color: var(--bg-3); }
.overflow-auto::-webkit-scrollbar { width: 4px; }
.overflow-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-auto::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
.overflow-auto::-webkit-scrollbar-thumb:hover { background: var(--secondary-fg); }
</style>
