import { sameId } from './ids.js';

export const getRoomName = (rooms, roomId, fallback = 'TBA') => {
    const room = (rooms || []).find((r) => sameId(r.id, roomId));
    return room ? room.name : fallback;
};
