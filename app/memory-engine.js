/* MyWinter V2 — Memory Engine
 * Experience-first foundation: discover → preview → reveal → explore.
 */
export function normalizeMemory(raw = {}, index = 0) {
  const text = String(raw.text ?? raw.body ?? raw.quote ?? '').trim();
  const date = String(raw.date ?? '').trim();
  const id = String(raw.id ?? `${date || 'memory'}-${index}`).replace(/[^a-zA-Z0-9_-]/g, '-');
  return {
    id,
    date,
    time: String(raw.time ?? '').trim(),
    sender: String(raw.sender ?? '').trim(),
    text,
    type: String(raw.type ?? raw.memoryType ?? 'memory'),
    mood: String(raw.mood ?? 'love'),
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
    importance: Number(raw.importance ?? raw.memoryScore ?? 0),
    context: Array.isArray(raw.context) ? raw.context : [],
    relatedMemories: Array.isArray(raw.relatedMemories) ? raw.relatedMemories : [],
    source: raw.source ?? null
  };
}

export function createMemoryStore(payload = {}) {
  const all = Array.isArray(payload.all) ? payload.all.map(normalizeMemory) : [];
  const byId = new Map(all.map(item => [item.id, item]));
  return {
    all,
    byId,
    every27: Array.isArray(payload.every27) ? payload.every27.map(normalizeMemory) : [],
    sayang: Array.isArray(payload.sayang) ? payload.sayang.map(normalizeMemory) : [],
    littleThings: Array.isArray(payload.littleThings) ? payload.littleThings.map(normalizeMemory) : [],
    calendar: Array.isArray(payload.calendar) ? payload.calendar : [],
    constellation: Array.isArray(payload.constellation) ? payload.constellation : []
  };
}

export function searchMemories(store, query, filters = {}) {
  const q = String(query ?? '').trim().toLowerCase();
  return store.all.filter(memory => {
    if (filters.date && memory.date !== filters.date) return false;
    if (filters.sender && memory.sender !== filters.sender) return false;
    if (filters.type && memory.type !== filters.type) return false;
    if (!q) return true;
    const haystack = [memory.text, memory.sender, memory.date, memory.type, memory.mood, ...memory.keywords].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export function getRelatedMemories(store, memory, limit = 4) {
  const ids = new Set(memory?.relatedMemories ?? []);
  const direct = [...ids].map(id => store.byId.get(id)).filter(Boolean);
  if (direct.length >= limit) return direct.slice(0, limit);
  const fallback = store.all
    .filter(item => item.id !== memory?.id && item.type === memory?.type)
    .sort((a, b) => b.importance - a.importance);
  return [...direct, ...fallback].slice(0, limit);
}
