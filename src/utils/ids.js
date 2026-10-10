export const sameId = (a, b) => String(a) === String(b);

export const includesId = (ids, id) => ids.some((value) => sameId(value, id));

export const normalizeId = (raw) => {
    if (raw === null || raw === undefined) return null;
    const value = String(raw).trim();
    if (!value) return null;
    const num = Number(value);
    return Number.isInteger(num) && String(num) === value ? num : value;
};
