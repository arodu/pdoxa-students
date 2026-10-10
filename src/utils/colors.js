// Pastel palette per course, matching the approved mockups:
// filled pastel background + colored left border + dark readable text.
const PALETTE = [
    { border: '#1a73e8', bg: '#e8f0fe', text: '#174ea6' },
    { border: '#188038', bg: '#e6f4ea', text: '#0d652d' },
    { border: '#e37400', bg: '#fef7e0', text: '#b06000' },
    { border: '#d93025', bg: '#fce8e6', text: '#a50e0e' },
    { border: '#9334e6', bg: '#f3e8fd', text: '#6a1b9a' },
    { border: '#00838f', bg: '#e0f7fa', text: '#006064' },
];

const hash = (key) => {
    const value = String(key ?? '');
    let h = 0;
    for (let i = 0; i < value.length; i++) {
        h = (h * 31 + value.charCodeAt(i)) >>> 0;
    }
    return h;
};

export const courseColor = (key) => PALETTE[hash(key) % PALETTE.length];

export { PALETTE };
