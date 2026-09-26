(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const root = document.body;
  const mosaic = $('#mosaic');
  const detail = $('#mosaic-detail');
  const detailBody = $('#mosaic-detail-body');
  const count = $('#mosaic-count');
  const search = $('#mosaic-search');
  const reset = $('#mosaic-reset');
  let memories = [];
  let active = null;

  const escape = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const textOf = m => m.text || m.content || m.message || m.quote || m.body || '';
  const dateOf = m => m.date || m.timestamp || m.datetime || '';
  const tagsOf = m => Array.isArray(m.tags) ? m.tags : (m.tags ? String(m.tags).split(',') : []);
  const normalize = (m, i) => ({...m, _i:i, _text:textOf(m), _date:dateOf(m), _tags:tagsOf(m)});

  function render(list=memories) {
    mosaic.innerHTML = '';
    count.textContent = `${list.length} FRAGMENTS`;
    if (!list.length) {
      mosaic.innerHTML = '<div class="mosaic-empty">NO FRAGMENT FOUND.</div>';
      return;
    }
    list.forEach((m, i) => {
      const el = document.createElement('button');
      el.className = `mosaic-fragment type-${i % 5}`;
      el.dataset.index = m._i;
      el.style.setProperty('--x', `${(i * 37) % 88 + 5}%`);
      el.style.setProperty('--y', `${(i * 61) % 82 + 8}%`);
      el.style.setProperty('--r', `${((i * 17) % 10) - 5}deg`);
      const date = m._date ? String(m._date).slice(0, 10) : '';
      const txt = m._text.length > 92 ? `${m._text.slice(0, 92)}…` : m._text;
      el.innerHTML = `<span class="fragment-index">${String(i+1).padStart(2,'0')}</span><span class="fragment-date">${escape(date)}</span><span class="fragment-text">${escape(txt || 'memory')}</span>`;
      el.addEventListener('click', () => open(m));
      mosaic.appendChild(el);
    });
  }

  function open(m) {
    active = m;
    $$('.mosaic-fragment').forEach(el => el.classList.toggle('is-muted', Number(el.dataset.index) !== m._i));
    detailBody.innerHTML = `<div class="detail-kicker">${escape(m._date || 'MEMORY')}</div><h2>${escape(m._text || 'A little memory.')}</h2><div class="detail-meta">${escape(m._tags.join(' · '))}</div><button class="detail-source" id="detail-source">VIEW ORIGINAL CONTEXT →</button>`;
    detail.classList.add('open');
    root.classList.add('mosaic-focus');
    $('#detail-source').onclick = () => showContext(m);
  }

  function showContext(m) {
    const original = m.messages || m.conversation || m.context || m.original;
    const body = Array.isArray(original) ? original.map(x => `<p>${escape(typeof x === 'string' ? x : (x.text || x.message || ''))}</p>`).join('') : `<p>${escape(original || m._text || 'Original conversation context is not available in this memory record.')}</p>`;
    detailBody.innerHTML = `<div class="detail-kicker">ORIGINAL CONVERSATION</div><h2>${escape(m._date || '')}</h2><div class="detail-thread">${body}</div><button class="detail-source" id="detail-back">← BACK TO FRAGMENT</button>`;
    $('#detail-back').onclick = () => open(m);
  }

  function close() { detail.classList.remove('open'); root.classList.remove('mosaic-focus'); $$('.mosaic-fragment').forEach(x => x.classList.remove('is-muted')); active=null; }
  detail.addEventListener('click', e => { if (e.target === detail) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  reset.addEventListener('click', () => { search.value=''; render(); });
  search.addEventListener('input', () => { const q=search.value.trim().toLowerCase(); render(q ? memories.filter(m => `${m._text} ${m._date} ${m._tags.join(' ')}`.toLowerCase().includes(q)) : memories); });

  fetch('data/memories.json').then(r => r.ok ? r.json() : Promise.reject()).then(data => {
    const source = Array.isArray(data) ? data : (data.memories || data.items || data.data || []);
    memories = source.map(normalize).filter(m => m._text || m._date);
    render();
  }).catch(() => {
    count.textContent='DATA UNAVAILABLE';
    mosaic.innerHTML='<div class="mosaic-empty">MEMORY DATA COULD NOT BE LOADED.</div>';
  });
})();
