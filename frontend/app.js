const API = 'http://localhost:3001';
let currentPlanId = null;
let currentBudget = 'medium';
const qaData = [
  {
    qid: 'q1',
    text: '你喜歡哪種行程安排？',
    type: 'choices',
    choices: [
      { cid: 'q1a1', label: '比起都市更喜歡看風景接觸大自然' },
      { cid: 'q1a2', label: '逛街購物整天都沒問題' },
      { cid: 'q1a3', label: '早起玩好玩滿' },
      { cid: 'q1a4', label: '睡飽想去哪就去哪' }
    ]
  },
  {
    qid: 'q2',
    text: '你對於住宿環境要求是如何？',
    type: 'choices',
    choices: [
      { cid: 'q2a1', label: '只要有床有衛浴乾淨就行' },
      { cid: 'q2a2', label: '喜歡具有當地風格的民宿（可較遠）' },
      { cid: 'q2a3', label: '不是五星級我可是不住' },
      { cid: 'q2a4', label: '比較在意飯店/民宿設施' }
    ]
  },
  {
    qid: 'q3',
    text: '旅遊中你對於食物的要求是如何？',
    type: 'choices',
    choices: [
      { cid: 'q3a1', label: '只要路邊看到喜歡就吃' },
      { cid: 'q3a2', label: '一定要三餐都吃正餐不能餓到' },
      { cid: 'q3a3', label: '少吃一餐沒關係' },
      { cid: 'q3a4', label: '只要好吃不管排多人都要吃到 / 再貴都無妨' }
    ]
  },
  {
    qid: 'q4',
    text: '交通工具你會如何選擇？',
    type: 'choices',
    choices: [
      { cid: 'q4a1', label: '能用走的就走' },
      { cid: 'q4a2', label: '計程車' },
      { cid: 'q4a3', label: '巴士/公共汽車' },
      { cid: 'q4a4', label: '直接包車最舒適' }
    ]
  },
  {
    qid: 'q5',
    text: '哪一種對你來說最放鬆舒壓？',
    type: 'choices',
    choices: [
      { cid: 'q5a1', label: '人多熱鬧活力充沛' },
      { cid: 'q5a2', label: '漫步城市中跟自己相處探索自我' },
      { cid: 'q5a3', label: '什麼都不做待在飯店' },
      { cid: 'q5a4', label: '探索新的人事物' }
    ]
  },
  {
    qid: 'q6',
    text: '你對旅程還有什麼期望？',
    type: 'text'
  }
];
let qaIndex = 0;
let qaAnswers = {};

function setPlanId(id){
  currentPlanId = id;
  document.getElementById('planId').textContent = id;
  document.getElementById('planIdWrap').classList.remove('hidden');
  refreshOverview();
}

async function createPlan(){
  try {
    const start_date = document.getElementById('startDate').value || new Date().toISOString().slice(0,10);
    const end_date = document.getElementById('endDate').value || new Date(Date.now()+86400000).toISOString().slice(0,10);
    const destinationInput = document.getElementById('startPlace');
    const start_place = (destinationInput && destinationInput.value) ? destinationInput.value : 'HKG Airport';
    const end_place = start_place;
    const res = await fetch(API + '/plans', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        budget: { level: currentBudget, currency: 'HKD' },
        date_range: { start_date, end_date, nights: 1 },
        locations: { start_place, end_place }
      })
    });
    if(!res.ok){ throw new Error('HTTP ' + res.status); }
    const data = await res.json();
    if(!data.plan_id){ throw new Error('回傳格式錯誤'); }
    setPlanId(data.plan_id);
    try { await fetch(API + '/plans/' + data.plan_id + '/generate', { method: 'POST' }); } catch {}
    await loadItinerary();
    await showWeatherHint();
    // 成功後跳至 QA
    location.hash = '#qa';
  } catch (e) {
    console.error(e);
    alert('建立計畫失敗，請稍後再試：' + (e?.message || e));
  }
}

async function answer(q, a){
  if(!currentPlanId) return alert('請先建立計畫');
  await fetch(API + '/plans/' + currentPlanId + '/answers', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ question_id: q, selected_choice_id: a })
  });
}

async function loadItinerary(){
  if(!currentPlanId) return;
  let plan = await (await fetch(API + '/plans/' + currentPlanId)).json();
  let slots = plan.itinerary[0].slots || [];
  if(slots.length < 8){
    try { await fetch(API + '/plans/' + currentPlanId + '/generate', { method: 'POST' }); } catch {}
    plan = await (await fetch(API + '/plans/' + currentPlanId)).json();
    slots = plan.itinerary[0].slots || [];
  }
  const desired = [
    { id: 'breakfast',   label: 'Breakfast (08:00–09:00)', type: 'food' },
    { id: 'morning',     label: 'Morning (09:00–12:00)',   type: 'poi'  },
    { id: 'lunch',       label: 'Lunch (12:00–13:30)',     type: 'food' },
    { id: 'afternoon',   label: 'Afternoon (13:30–15:30)', type: 'poi'  },
    { id: 'evening',     label: 'Evening (15:30–18:30)',   type: 'poi'  },
    { id: 'dinner',      label: 'Dinner (18:30–20:00)',    type: 'food' },
    { id: 'night',       label: 'Night (20:00–22:00)',     type: 'poi'  },
    { id: 'accommodation',label:'Accommodation (22:00–08:00)', type: 'hotel' }
  ];
  function mock3(type){
    const pool = {
      poi: [
        { id: 'poi-1', name: '太平山 Victoria Peak', rating: 4.4, img: 'https://picsum.photos/seed/peak/400/240' },
        { id: 'poi-2', name: '星光大道 Avenue of Stars', rating: 4.5, img: 'https://picsum.photos/seed/avenue/400/240' },
        { id: 'poi-3', name: '天星小輪 Star Ferry', rating: 4.6, img: 'https://picsum.photos/seed/ferry/400/240' }
      ],
      food: [
        { id: 'food-1', name: '添好運 Tim Ho Wan', rating: 4.4, img: 'https://picsum.photos/seed/timhowan/400/240' },
        { id: 'food-2', name: '九記牛腩 Kau Kee', rating: 4.5, img: 'https://picsum.photos/seed/kaukee/400/240' },
        { id: 'food-3', name: '勝香園 Sing Heung Yuen', rating: 4.6, img: 'https://picsum.photos/seed/singheung/400/240' }
      ],
      hotel: [
        { id: 'hotel-1', name: '尖沙咀海景酒店', rating: 4.3, img: 'https://picsum.photos/seed/hotel1/400/240' },
        { id: 'hotel-2', name: '中環商旅酒店', rating: 4.2, img: 'https://picsum.photos/seed/hotel2/400/240' },
        { id: 'hotel-3', name: '灣仔精品酒店', rating: 4.1, img: 'https://picsum.photos/seed/hotel3/400/240' }
      ]
    };
    return (pool[type]||[]).map(x=>({ option_id:x.id, title:x.name, images:[x.img], intro:'示意資料', scores:{popularity:x.rating} }));
  }
  const mapById = Object.fromEntries(slots.map(s => [s.slot_id, s]));
  currentSlots = desired.map(d => mapById[d.id] || { slot_id: d.id, label: d.label, options: mock3(d.type), selected_option_id: null, swipe_history: [] });
  renderSlotList(currentSlots);
  renderStackForSlot(currentSlots[0]);
}

function renderSlotList(slots){
  const slotList = document.getElementById('slotList');
  slotList.innerHTML = '';
  slots.forEach(s => {
    const li = document.createElement('div'); li.className = 'slot-item'; li.dataset.slot = s.slot_id;
    if(s.selected_option_id){ li.classList.add('selected'); }
    const dot = document.createElement('span'); dot.textContent = '•'; dot.style.color = s.selected_option_id ? 'var(--primary)' : '#999';
    const selectedName = s.options.find(o => o.option_id === s.selected_option_id)?.title || '—';
    const text = document.createElement('div'); text.style.flex = '1'; text.innerHTML = `<div>${s.label}</div><div class="muted">${s.selected_option_id ? '已選：' + selectedName : '未選'}</div>`;
    li.appendChild(dot); li.appendChild(text);
    li.onclick = () => renderStackForSlot(s);
    slotList.appendChild(li);
  });
}

function renderStackForSlot(slot){
  const stack = document.getElementById('cardStack');
  stack.innerHTML = '';
  if(!slot) return;
  const options = [...(slot.options||[])].slice(0,3); // 只顯示前三張
  options.forEach((o, idx) => {
    const card = document.createElement('div'); card.className = 'card-item';
    card.style.transform = `translateY(${idx*8}px) scale(${1 - idx*0.04})`;
    const img = document.createElement('img'); img.src = o.images?.[0] || '';
    const label = document.createElement('div'); label.className = 'card-label'; label.textContent = `${o.title}  (${o.scores?.popularity||''})`;
    const toolbar = document.createElement('div'); toolbar.className = 'card-toolbar';
    const note = document.createElement('div'); note.className = 'pill'; note.textContent = '（簡短描述）';
    const spacer = document.createElement('div'); spacer.className = 'toolbar-spacer';
    const btnAgain = document.createElement('button'); btnAgain.className = 'round-btn again'; btnAgain.textContent = '⟲';
    const btnReject = document.createElement('button'); btnReject.className = 'round-btn reject'; btnReject.textContent = '✕';
    const btnAccept = document.createElement('button'); btnAccept.className = 'round-btn accept'; btnAccept.textContent = '✓';
    const btnInfo = document.createElement('button'); btnInfo.className = 'round-btn info'; btnInfo.textContent = 'i';
    toolbar.appendChild(note); toolbar.appendChild(spacer); toolbar.appendChild(btnAgain); toolbar.appendChild(btnReject); toolbar.appendChild(btnAccept); toolbar.appendChild(btnInfo);

    // 行為：again -> 補一張新的到末尾（簡易 mock），reject -> 移除，accept -> keep，info -> alert 詳情
    btnAgain.onclick = () => {
      // 簡單補卡：複製頂卡改 seed
      const seed = Math.floor(Math.random()*10000);
      slot.options.push({ option_id: `gen-${seed}`, title: o.title + ' (更多)', images: [ (o.images?.[0]||'') + `?r=${seed}` ], intro: o.intro, scores: o.scores });
      renderStackForSlot(slot);
    };
    btnReject.onclick = async () => {
      if(String(o.option_id).startsWith('gen-')){
        slot.options = slot.options.filter(opt => opt.option_id !== o.option_id);
        if(slot.selected_option_id === o.option_id){ slot.selected_option_id = null; }
        renderSlotList(currentSlots);
        renderStackForSlot(slot);
        return;
      }
      await swipe(slot.slot_id, 'remove', o.option_id);
      const target = currentSlots.find(s => s.slot_id === slot.slot_id);
      if(target){ target.options = target.options.filter(opt => opt.option_id !== o.option_id); if(target.selected_option_id === o.option_id){ target.selected_option_id = null; } }
      renderSlotList(currentSlots);
      renderStackForSlot(target || slot);
    };
    btnAccept.onclick = async () => {
      await swipe(slot.slot_id, 'keep', o.option_id);
      const target = currentSlots.find(s => s.slot_id === slot.slot_id);
      if(target){ target.selected_option_id = o.option_id; }
      renderSlotList(currentSlots);
      // 自動切換到下一個槽位（如有）
      const all = Array.from(document.querySelectorAll('#slotList .slot-item'));
      const idxLi = all.findIndex(li => li.dataset.slot === slot.slot_id);
      if(idxLi >= 0 && all[idxLi+1]) all[idxLi+1].click();
      else await refreshOverview();
    };
    btnInfo.onclick = () => {
      alert(`${o.title}\n\n${o.intro || '（無描述）'}`);
    };

    card.appendChild(img); card.appendChild(label); card.appendChild(toolbar); stack.appendChild(card);
  });
}

async function swipe(slot_id, action, option_id){
  if(!currentPlanId) return;
  await fetch(API + '/plans/' + currentPlanId + '/swipe', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ day_index: 1, slot_id, action, option_id })
  });
  await loadItinerary();
  await refreshOverview();
}

async function refreshOverview(){
  if(!currentPlanId) return;
  const plan = await (await fetch(API + '/plans/' + currentPlanId)).json();
  document.getElementById('overviewJson').textContent = JSON.stringify(plan, null, 2);
  const sum = document.getElementById('overviewSummary');
  if(sum){
    sum.innerHTML = '';
    const slots = plan.itinerary?.[0]?.slots || [];
    slots.forEach(s => {
      const sel = s.options.find(o => o.option_id === s.selected_option_id);
      const badge = document.createElement('span'); badge.className = 'chip'; badge.textContent = sel ? `${s.slot_id}: ${sel.title}` : `${s.slot_id}: 未選`;
      sum.appendChild(badge);
    });
  }
}

async function finalize(){
  if(!currentPlanId) return;
  await fetch(API + '/plans/' + currentPlanId + '/finalize', { method: 'POST' });
  await refreshOverview();
}

async function exportPdf(){
  if(!currentPlanId) return;
  const res = await fetch(API + '/plans/' + currentPlanId + '/export/pdf', { method: 'POST' });
  const data = await res.json();
  document.getElementById('pdfLink').innerHTML = '<a href="' + data.url + '" target="_blank">PDF Link</a>';
}

async function exportIcs(){
  if(!currentPlanId) return;
  const res = await fetch(API + '/plans/' + currentPlanId + '/calendar', { method: 'POST' });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'plan-' + currentPlanId + '.ics'; a.click();
  URL.revokeObjectURL(url);
}

// Bindings
document.getElementById('createPlanBtn').onclick = createPlan;
document.getElementById('finalizeBtn').onclick = finalize;
document.getElementById('pdfBtn').onclick = exportPdf;
document.getElementById('icsBtn').onclick = exportIcs;
const regenBtn = document.getElementById('regenBtn');
if(regenBtn){
  regenBtn.onclick = async () => {
    if(!currentPlanId) return alert('請先建立計畫');
    await fetch(API + '/plans/' + currentPlanId + '/generate', { method: 'POST' });
    await loadItinerary();
  };
}

// Budget quick buttons
document.querySelectorAll('.budgetBtn').forEach(btn => {
  btn.onclick = () => {
    currentBudget = btn.dataset.budget;
    document.querySelectorAll('.budgetBtn').forEach(b => b.style.outline = '');
    btn.style.outline = '2px solid #0a7';
  };
});

function setQuickPlace(text){
  const el = document.activeElement;
  const isStart = el && el.id === 'startPlace';
  const isEnd = el && el.id === 'endPlace';
  const target = isStart ? el : (isEnd ? el : document.getElementById('startPlace'));
  target.value = text;
}
document.getElementById('btnAirport').onclick = () => setQuickPlace('Airport');
document.getElementById('btnWestKowloon').onclick = () => setQuickPlace('Hong Kong West Kowloon Station');

async function showWeatherHint(){
  try{
    const start_date = document.getElementById('startDate').value || new Date().toISOString().slice(0,10);
    document.getElementById('weatherHint').textContent = '查詢天氣中…';
    const res = await fetch(API + '/weather?date=' + encodeURIComponent(start_date));
    if(!res.ok) throw new Error('weather http ' + res.status);
    const w = await res.json();
    document.getElementById('weatherHint').textContent = `${w.summary}，${w.advice}`;
  } catch(e){
    document.getElementById('weatherHint').textContent = 'Sunny，適合戶外行程';
  }
}

// QA wizard
function renderQA(){
  const q = qaData[qaIndex];
  const progressText = document.getElementById('qaProgressText');
  const progressBar = document.getElementById('qaProgressBar');
  if(progressText) progressText.textContent = `${qaIndex+1} / ${qaData.length}`;
  if(progressBar) progressBar.style.width = Math.round(((qaIndex+1)/qaData.length)*100) + '%';
  document.getElementById('qaQuestion').textContent = q.text;
  const box = document.getElementById('qaChoices');
  box.innerHTML = '';
  const status = document.getElementById('qaStatus');
  if(status) status.textContent = '';
  if(q.type === 'choices'){
    (q.choices || []).forEach(c => {
      const btn = document.createElement('button');
      btn.textContent = c.label;
      btn.onclick = async () => {
        qaAnswers[q.qid] = c.cid;
        const prev = box.querySelector('.choice-selected'); if(prev) prev.classList.remove('choice-selected');
        btn.classList.add('choice-selected');
        try { await answer(q.qid, c.cid); if(status) status.textContent = '已送出：' + c.label; }
        catch { if(status) status.textContent = '送出失敗，請重試'; }
      };
      box.appendChild(btn);
    });
  } else if(q.type === 'text'){
    const ta = document.createElement('textarea');
    ta.id = 'qaText';
    ta.rows = 3;
    ta.style.width = '100%';
    ta.placeholder = '請輸入您的期望（選填）';
    box.appendChild(ta);
  }
  // 更新下一題按鈕文案（最後一題改為完成）
  const nextBtn = document.getElementById('qaNext');
  if(nextBtn){ nextBtn.textContent = (qaIndex === qaData.length - 1) ? '完成並前往行程' : '下一題'; }
}
document.getElementById('qaPrev').onclick = () => { if(qaIndex>0){ qaIndex--; renderQA(); } };
document.getElementById('qaNext').onclick = async () => {
  const q = qaData[qaIndex];
  if(q.type === 'text'){
    const ta = document.getElementById('qaText');
    const val = (ta && ta.value.trim()) ? ta.value.trim() : '';
    if(val){ try { await answer(q.qid, val); } catch {} }
  }
  if(qaIndex < qaData.length - 1){
    qaIndex++;
    renderQA();
  } else {
    // 完成問卷，轉跳至行程頁
    location.hash = '#itinerary';
    try { await loadItinerary(); } catch {}
  }
};
renderQA();

// Theme toggle & scroll top
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'light';
if(savedTheme === 'dark'){ root.classList.add('dark'); if(themeToggle) themeToggle.checked = true; }
if(themeToggle){
  themeToggle.onchange = () => {
    if(themeToggle.checked){ root.classList.add('dark'); localStorage.setItem('theme','dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme','light'); }
  };
}
const scrollTopBtn = document.getElementById('scrollTopBtn');
if(scrollTopBtn){ scrollTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' }); }

// Hash routing
function updateSectionByHash(){
  const hash = (location.hash || '#p1').replace('#','');
  document.querySelectorAll('section[data-section]').forEach(sec => { sec.style.display = (sec.dataset.section === hash) ? 'block' : 'none'; });
  document.querySelectorAll('nav a').forEach(a => { const id = a.getAttribute('href').replace('#',''); if(id === hash) a.classList.add('active'); else a.classList.remove('active'); });
}
window.addEventListener('hashchange', updateSectionByHash);
updateSectionByHash();


