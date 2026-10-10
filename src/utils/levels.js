export const UNCATEGORIZED = 'Uncategorized';

export const normalizeLevel = (level) => {
    if (level === null || level === undefined || level === '') return UNCATEGORIZED;
    return level;
};

export const compareLevels = (a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true });

export const sortLevels = (levels) => [...levels].sort(compareLevels);

export const sameLevel = (a, b) => String(normalizeLevel(a)) === String(normalizeLevel(b));

export const isNumericLevel = (level) => {
    if (level === null || level === undefined || level === '') return false;
    return !Number.isNaN(Number(level));
};

export const levelOptionLabel = (level, prefix = 'Level') =>
    isNumericLevel(level) ? `${prefix} ${level}` : String(level);
