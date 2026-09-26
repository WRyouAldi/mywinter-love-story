import { createMemoryStore } from './memory-engine.js';

export function buildTimeMemoryRelation(payload = {}) {
  const store = createMemoryStore(payload);
  return store.all.map((m, i) => ({
    ...m,
    sequence: i + 1,
    relation: m.relatedMemories || [],
    timestamp: `${m.date}${m.time ? ` ${m.time}` : ''}`
  }));
}

export function findByQuery(memories, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return memories;
  return memories.filter(m => [m.text,m.date,m.sender,m.type,m.mood,...m.keywords].join(' ').toLowerCase().includes(q));
}
