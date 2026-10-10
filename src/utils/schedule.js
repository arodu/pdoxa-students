export const SLOT_DURATION = 5;
export const MINUTES_PER_HOUR = 60;
export const ROWS_PER_HOUR = MINUTES_PER_HOUR / SLOT_DURATION;

const DAY_ORDER = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
};

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * MINUTES_PER_HOUR + m;
};

export const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
};

export const getRowIndexForTime = (timeStr, startH) => {
    if (!timeStr) return 1;
    const startMins = startH * MINUTES_PER_HOUR;
    const entryMins = timeToMinutes(timeStr);
    const slotRaw = (entryMins - startMins) / SLOT_DURATION;
    return Math.round(slotRaw) + 1;
};

export const getGridRowPlacement = (startTime, endTime, startH) => {
    const start = getRowIndexForTime(startTime, startH);
    const end = getRowIndexForTime(endTime, startH);
    const safeEnd = end <= start ? start + 1 : end;
    return `${start} / ${safeEnd}`;
};

export const sortDays = (days) =>
    [...days].sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99));

export const computeGridSettings = (courses) => {
    const daysSet = new Set();
    let minMin = 24 * 60;
    let maxMin = 0;

    (courses || []).forEach((c) => {
        (c?.sections || []).forEach((s) => {
            (s?.entries || []).forEach((e) => {
                if (e.day) daysSet.add(e.day.toString());
                if (e.start_time) minMin = Math.min(minMin, timeToMinutes(e.start_time));
                if (e.end_time) maxMin = Math.max(maxMin, timeToMinutes(e.end_time));
            });
        });
    });

    const activeDays = sortDays(daysSet);
    const startHour = Math.max(0, Math.floor(minMin / MINUTES_PER_HOUR) - 1);
    const endHour = Math.min(24, Math.ceil(maxMin / MINUTES_PER_HOUR) + 1);
    const totalMinutes = (endHour - startHour) * MINUTES_PER_HOUR;
    const totalSlots = totalMinutes / SLOT_DURATION;

    return {
        days: activeDays.length ? activeDays : [...DEFAULT_DAYS],
        startHour,
        endHour,
        totalMinutes,
        totalSlots,
    };
};
