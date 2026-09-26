/* MyWinter V2 — Experience layer
 * Keeps reading progressive and lightweight: one memory at a time.
 */
import { getRelatedMemories } from './memory-engine.js';

export function memoryPreview(memory) {
  if (!memory) return null;
  return {
    id: memory.id,
    eyebrow: memory.date,
    title: memory.type === 'every-27' ? 'Every 27th' : (memory.mood || 'Memory'),
    quote: memory.text.length > 120 ? `${memory.text.slice(0, 117)}…` : memory.text,
    meta: [memory.time, memory.sender].filter(Boolean).join(' · ')
  };
}

export function memoryDetail(store, id) {
  const memory = store.byId.get(id);
  if (!memory) return null;
  return {
    memory,
    context: memory.context,
    related: getRelatedMemories(store, memory)
  };
}

export function nextMemory(store, currentId) {
  if (!store.all.length) return null;
  const currentIndex = store.all.findIndex(item => item.id === currentId);
  return store.all[(currentIndex + 1 + store.all.length) % store.all.length] ?? store.all[0];
}
