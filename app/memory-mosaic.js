(() => {
  const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const root=document.body,mosaic=$('#mosaic'),detail=$('#mosaic-detail'),detailBody=$('#mosaic-detail-body'),count=$('#mosaic-count'),search=$('#mosaic-search'),reset=$('#mosaic-reset'),loading=$('#mosaic-loading'),toastEl=$('#toast');
  let memories=[],active=null,toastTimer=null;
  const escape=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const textOf=m=>m.text||m.content||m.message||m.quote||m.body||'';
  const dateOf=m=>m.date||m.timestamp||m.datetime||'';
  const tagsOf=m=>Array.isArray(m.tags)?m.tags:(m.tags?String(m.tags).split(',').map(x=>x.trim()).filter(Boolean):[]);
  const normalize=(m,i)=>({...m,_i:i,_text:String(textOf(m)),_date:String(dateOf(m)),_tags:tagsOf(m)});
  const shortDate=v=>{if(!v)return 'A LITTLE MEMORY';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}).toUpperCase();};
  const showToast=msg=>{toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2400);};
  function updateStats(){
    $('#stat-count').textContent=memories.length.toLocaleString('id-ID');
    const dates=memories.map(m=>new Date(m._date)).filter(d=>!Number.isNaN(d.getTime())).sort((a,b)=>a-b);
    $('#stat-range').textContent=dates.length?dates[0].toLocaleDateString('id-ID',{month:'short',year:'numeric'})+' — '+dates[dates.length-1].toLocaleDateString('id-ID',{month:'short',year:'numeric'}):'A growing story';
  }
  function makePositions(total){
    const cols=window.innerWidth<600?2:window.innerWidth<900?3:4,rows=Math.max(2,Math.ceil(total/cols)),positions=[];
    for(let i=0;i<total;i++){const col=i%cols,row=Math.floor(i/cols),cw=100/cols,ch=100/rows;positions.push({x:col*cw+cw*(.42+Math.random()*.16),y:row*ch+ch*(.43+Math.random()*.14),r:(Math.random()*7-3.5).toFixed(1)});}
    return positions;
  }
  function render(list=memories){
    mosaic.innerHTML='';count.textContent=list.length.toLocaleString('id-ID')+' KENANGAN';
    $('#wall-hint').textContent=list.length?'KETUK KARTU UNTUK MEMBUKA ↗':'COBA KATA KUNCI LAIN';
    if(!list.length){mosaic.innerHTML='<div class="mosaic-empty">Belum ada potongan yang cocok. Coba kata lain, ya.</div>';return;}
    const visible=list.length>72?list.filter((_,i)=>i%Math.ceil(list.length/72)===0).slice(0,72):list,positions=makePositions(visible.length);
    visible.forEach((m,i)=>{const el=document.createElement('button');el.type='button';el.className='mosaic-fragment';el.dataset.index=m._i;el.style.setProperty('--x',positions[i].x+'%');el.style.setProperty('--y',positions[i].y+'%');el.style.setProperty('--r',positions[i].r+'deg');el.style.setProperty('--delay',Math.min(i*16,480)+'ms');const txt=m._text.length>100?m._text.slice(0,100)+'…':m._text;
      el.innerHTML='<span class="fragment-index">'+String(i+1).padStart(2,'0')+'</span><span class="fragment-date">'+escape(shortDate(m._date))+'</span><span class="fragment-text">'+escape(txt||'A little memory.')+'</span><span class="fragment-hint">OPEN MEMORY ↗</span>';
      el.setAttribute('aria-label','Buka kenangan: '+m._text.slice(0,80));el.addEventListener('click',()=>open(m));mosaic.appendChild(el);});
  }
  function open(m){
    active=m;$$('.mosaic-fragment').forEach(el=>el.classList.toggle('is-muted',Number(el.dataset.index)!==m._i));
    detailBody.innerHTML='<div class="detail-kicker">✳ A LITTLE PIECE OF US / '+String(m._i+1).padStart(3,'0')+'</div><h2>'+escape(m._text||'A little memory.')+'</h2><div class="detail-meta">'+escape(shortDate(m._date))+(m._tags.length?' · '+escape(m._tags.join(' · ')):'')+'</div><p class="detail-note">Ada hal-hal kecil yang mungkin terasa biasa saat terjadi, tapi tetap layak disimpan. Inilah salah satu potongan cerita kita. ♡</p><button class="detail-source" id="detail-source">LIHAT KONTEKS ASLI →</button>';
    detail.classList.add('open');root.classList.add('mosaic-focus');$('#detail-close').focus();$('#detail-source').onclick=()=>showContext(m);
  }
  function showContext(m){
    const original=m.messages||m.conversation||m.context||m.original;
    const body=Array.isArray(original)?original.map(x=>'<p>'+escape(typeof x==='string'?x:(x.text||x.message||''))+'</p>').join(''):'<p>'+escape(original||m._text||'Konteks percakapan asli tidak tersedia pada potongan ini.')+'</p>';
    detailBody.innerHTML='<div class="detail-kicker">THE WORDS AROUND THE MEMORY</div><h2>'+escape(shortDate(m._date))+'</h2><p class="detail-note">Konteks yang tersedia dari arsip ini.</p><div class="detail-thread">'+body+'</div><button class="detail-source" id="detail-back">← KEMBALI KE KENANGAN</button>';$('#detail-back').onclick=()=>open(m);
  }
  function close(){detail.classList.remove('open');root.classList.remove('mosaic-focus');$$('.mosaic-fragment').forEach(x=>x.classList.remove('is-muted'));active=null;}
  function discover(){if(!memories.length){showToast('Kenangan masih sedang disiapkan.');return;}open(memories[Math.floor(Math.random()*memories.length)]);}
  function filtered(){const q=search.value.trim().toLocaleLowerCase('id');return q?memories.filter(m=>(m._text+' '+m._date+' '+m._tags.join(' ')).toLocaleLowerCase('id').includes(q)):memories;}
  function resetAll(){search.value='';render(memories);close();$('#intro').scrollIntoView({behavior:'smooth',block:'start'});showToast('Kita mulai lagi dari awal. ♡');}
  $('#detail-close').addEventListener('click',close);detail.addEventListener('click',e=>{if(e.target===detail)close();});document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  $('#discover-btn').addEventListener('click',discover);$('#explore-btn').addEventListener('click',()=>$('#collection').scrollIntoView({behavior:'smooth'}));
  $('#shuffle-btn').addEventListener('click',()=>{render([...filtered()].sort(()=>Math.random()-.5));showToast('Mosaik diacak. Temukan cerita yang baru ♡');});
  $('#brand-home').addEventListener('click',e=>{e.preventDefault();$('#intro').scrollIntoView({behavior:'smooth'});});reset.addEventListener('click',resetAll);search.addEventListener('input',()=>render(filtered()));
  window.addEventListener('resize',()=>{clearTimeout(window.__mosaicResize);window.__mosaicResize=setTimeout(()=>render(filtered()),180);});
  async function loadFullDataset(){
    try{const idxRes=await fetch('data/index.json?v=3',{cache:'no-store'});if(!idxRes.ok)throw new Error('index');const idx=await idxRes.json(),all=[];
      for(const file of idx.chunks||[]){const r=await fetch('data/chunks/'+file+'?v=3',{cache:'force-cache'});if(!r.ok)throw new Error(file);all.push(...await r.json());count.textContent='MERANGKAI '+all.length.toLocaleString('id-ID')+' / '+Number(idx.message_count||0).toLocaleString('id-ID');}
      memories=all.map(normalize).filter(m=>m._text||m._date);
    }catch(e){try{const r=await fetch('data/memories.json?v=3',{cache:'no-store'});if(!r.ok)throw e;const data=await r.json(),source=Array.isArray(data)?data:(data.memories||data.items||data.data||[]);memories=source.map(normalize).filter(m=>m._text||m._date);}
      catch(_){count.textContent='ARSIP BELUM TERSEDIA';mosaic.innerHTML='<div class="mosaic-empty">Kenangan belum bisa dimuat. Coba muat ulang halaman.</div>';loading.classList.add('hidden');showToast('Koneksi ke arsip belum berhasil.');return;}}
    updateStats();render();loading.classList.add('hidden');
  }
  loadFullDataset();
})();