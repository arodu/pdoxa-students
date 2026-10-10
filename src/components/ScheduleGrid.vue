<script setup>
import { computed } from 'vue';
import { useProjectState } from '../composables/useProjectState';
import { useScheduleLogic } from '../composables/useScheduleLogic';
import {
    ROWS_PER_HOUR,
    formatTime,
    getGridRowPlacement,
    computeGridSettings,
} from '../utils/schedule.js';
import { getRoomName } from '../utils/rooms.js';
import { courseColor } from '../utils/colors.js';

const { state, focusCourse } = useProjectState();
const { selectedSectionsFull } = useScheduleLogic(state);

const courseColorVars = (section) => {
    const color = courseColor(section.course?.id ?? section.id);
    return { '--block-bg': color.bg, '--block-border': color.border, '--block-text': color.text };
};

const props = defineProps({
    days: { type: Array, default: null },
    startHour: { type: Number, default: null },
});

const baseSettings = computed(() => computeGridSettings(state.courses));

const gridSettings = computed(() => {
    const base = baseSettings.value;
    const days = (props.days && props.days.length) ? props.days : base.days;
    const startHour = props.startHour ?? base.startHour;
    return { ...base, days, startHour };
});

const gridAxisLines = computed(() => {
    const lines = [];
    const { startHour, endHour } = gridSettings.value;

    for (let h = startHour; h <= endHour; h++) {
        lines.push({ type: 'hour', label: formatTime(`${h}:00`), row: ((h - startHour) * ROWS_PER_HOUR) + 1 });
        if (h < endHour) {
            lines.push({ type: 'half', label: formatTime(`${h}:30`), row: ((h - startHour) * ROWS_PER_HOUR) + (ROWS_PER_HOUR / 2) + 1 });
        }
    }
    return lines;
});
</script>

<template>
    <div class="schedule-container h-100 d-flex flex-column" :style="{ '--num-days': gridSettings.days.length, '--total-slots': gridSettings.totalSlots }">
        
        <div class="grid-layout grid-header border-bottom border-2 border-dark">
            <div class="time-column-header border-end-strict bg-body"></div>
            <div v-for="day in gridSettings.days" :key="day" class="day-column-header text-center fw-bold py-2 text-primary small border-end-strict">
                {{ day.toUpperCase() }}
            </div>
        </div>

        <div class="grid-layout grid-body flex-grow-1 border-bottom-strict">
            
            <div class="time-column border-end-strict position-relative h-100">
                <div v-for="(line, idx) in gridAxisLines" :key="'label-'+idx" 
                     class="time-label-wrapper" :class="{ 'half-hour-wrapper': line.type === 'half' }"
                     :style="{ 'grid-row': `${line.row} / span 1` }">
                    <span class="time-label" :class="{ 'half-hour-label': line.type === 'half' }">{{ line.label }}</span>
                </div>
            </div>

            <div v-for="day in gridSettings.days" :key="day" class="day-column border-end-strict position-relative h-100">
                
                <div v-for="(line, idx) in gridAxisLines" :key="'line-'+idx" 
                     class="hour-line-container" :style="{ 'grid-row': `${line.row} / span 1` }">
                    <div class="hour-line" :class="{ 'half-hour-line': line.type === 'half' }"></div>
                </div>

                <template v-for="section in selectedSectionsFull" :key="section.id">
                    <template v-for="entry in section.entries" :key="entry.id">
                        <div v-if="entry.day === day" 
                             role="button"
                             tabindex="0"
                             :aria-label="`${section.course_name}, sección ${section.name}`"
                             @click="focusCourse(section.course)"
                             @keydown.enter.prevent="focusCourse(section.course)"
                             @keydown.space.prevent="focusCourse(section.course)"
                             class="schedule-block shadow-sm d-flex flex-column cursor-pointer"
                             :style="{ 'grid-row': getGridRowPlacement(entry.start_time, entry.end_time, gridSettings.startHour), ...courseColorVars(section) }">
                            
                            <span class="fw-bold text-truncate d-block">{{ section.course_name }}</span>
                            <span class="x-small text-truncate opacity-75 d-block">{{ section.name }} - {{ getRoomName(state.rooms, entry.room_id) }}</span>
                            <span class="x-small fw-bold opacity-75 d-block mt-auto text-truncate pt-1">
                                {{ formatTime(entry.start_time) }} - {{ formatTime(entry.end_time) }}
                            </span>
                        </div>
                    </template>
                </template>

            </div>
        </div>
    </div>
</template>

<style scoped>
.schedule-container { min-width: 0; font-family: 'Nunito', sans-serif; width: 100%; }

/* Mobile: allow horizontal scroll so all days are reachable (swipe) */
@media (max-width: 991.98px) {
    .schedule-container { min-width: 560px; }
}

.grid-layout {
    display: grid;
    grid-template-columns: 80px repeat(var(--num-days), minmax(0, 1fr));
    width: 100%; margin: 0; padding: 0;
}

/* En pantalla, garantizamos un alto mínimo para que sea fácil de leer y hacer scroll */
.grid-body { min-height: 700px; }

/* FIX CRÍTICO: 1fr puro. El contenedor ahora divide el espacio equitativamente */
.time-column, .day-column { 
    display: grid;
    grid-template-rows: repeat(var(--total-slots), 1fr);
    margin: 0; padding: 0;
}

.day-column-header:last-child { border-right: none !important; }

/* FIX CRÍTICO: ABSOLUTE. Desconectamos los elementos del tamaño de la fila */
.time-label-wrapper { 
    position: absolute; left: 0; right: 0; top: 0; grid-column: 1;
    display: flex; justify-content: flex-end; align-items: center; 
    padding-right: 12px; pointer-events: none; 
    transform: translateY(-50%); /* Centra la hora sobre la línea */
}
.time-label { font-size: 0.72rem; color: var(--bs-secondary-color); font-weight: 700; background-color: var(--bs-body-bg); padding: 2px 4px; line-height: 1; }
.half-hour-label { font-size: 0.65rem; font-weight: 500; opacity: 0.6; }

.hour-line-container { 
    position: absolute; top: 0; left: 0; right: 0; grid-column: 1; 
    pointer-events: none; z-index: 1; 
}
.hour-line { position: absolute; top: 0; left: 0; right: 0; border-top: 1px dashed var(--bs-border-color); width: 100%; }
.half-hour-line { border-top: 1px dotted var(--bs-border-color); opacity: 0.6; }

/* Blocks: pastel fill + colored left border + dark text (mockup style) */
.schedule-block {
    position: absolute; inset: 0; grid-column: 1;
    --block-bg: var(--app-accent);
    --block-border: rgba(0, 0, 0, 0.2);
    --block-text: #fff;
    background-color: var(--block-bg); color: var(--block-text);
    padding: 4px 8px; border-radius: 6px; font-size: 0.75rem;
    z-index: 10; overflow: hidden;
    border-left: 4px solid var(--block-border);
    transition: transform 0.1s ease; line-height: 1.1;
    margin: 1px 4px; 
}
.schedule-block:hover { transform: scale(1.02); z-index: 11; border-color: var(--block-border) !important; }

.cursor-pointer { cursor: pointer; }
.x-small { font-size: 0.65rem; }

.border-end-strict { border-right: 1px solid var(--bs-border-color) !important; }
.border-bottom-strict { border-bottom: 1px solid var(--bs-border-color) !important; }

.grid-header .day-column-header:last-child { border-right: none !important; }
.grid-body .day-column:last-child { border-right: none !important; }
</style>