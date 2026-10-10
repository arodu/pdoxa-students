import { computed } from 'vue';
import { timeToMinutes } from '../utils/schedule.js';
import { includesId } from '../utils/ids.js';

export { timeToMinutes };

export const doEntriesOverlap = (entryA, entryB) => {
    if (entryA.day !== entryB.day) return false;
    const startA = timeToMinutes(entryA.start_time);
    const endA = timeToMinutes(entryA.end_time);
    const startB = timeToMinutes(entryB.start_time);
    const endB = timeToMinutes(entryB.end_time);
    return (startA < endB) && (endA > startB);
};

export function useScheduleLogic(projectState) {
    const selectedSectionsFull = computed(() => {
        const selected = [];
        (projectState.courses || []).forEach(course => {
            (course.sections || []).forEach(section => {
                if (includesId(projectState.selectedSectionIds, section.id)) {
                    // Include the full course object so the grid can use it for focus
                    selected.push({ ...section, course_name: course.name, course: course });
                }
            });
        });
        return selected;
    });

    const getConflicts = (targetSection, ignoreSectionIds = []) => {
        if (includesId(projectState.selectedSectionIds, targetSection.id)) return [];

        const activeSections = selectedSectionsFull.value.filter(s => !includesId(ignoreSectionIds, s.id));
        const conflicts = [];

        for (const selectedSec of activeSections) {
            for (const targetEntry of targetSection.entries) {
                for (const selectedEntry of selectedSec.entries) {
                    if (doEntriesOverlap(targetEntry, selectedEntry)) {
                        conflicts.push({
                            sectionId: selectedSec.id,
                            sectionName: selectedSec.name,
                            courseName: selectedSec.course_name,
                            day: selectedEntry.day,
                            start_time: selectedEntry.start_time,
                            end_time: selectedEntry.end_time,
                        });
                    }
                }
            }
        }
        return conflicts;
    };

    const hasConflict = (targetSection, ignoreSectionIds = []) =>
        getConflicts(targetSection, ignoreSectionIds).length > 0;

    return {
        selectedSectionsFull,
        getConflicts,
        hasConflict
    };
}
