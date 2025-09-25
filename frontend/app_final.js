const API = 'http://localhost:3001';
let currentPlanId = null;
let currentBudget = 'medium';
let currentDayIndex = 0;
let allDaysSlots = {}; // 儲存所有日期的行程
let currentSlots = []; // 當前日期的行程

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

function generateDefaultSlots() {
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
  return desired.map(d => ({ slot_id: d.id, label: d.label, options: mock3(d.type), selected_option_id: null, swipe_history: [] }));
}

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
  return (pool[type]||[]).map(x=>({ option_id:x.id, title:x.name, images:[x.img], intro:'示意資料，僅供 Demo 使用', scores:{popularity:x.rating} }));
}

function generateDayTabs() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  if (!startDate || !endDate) return;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayTabs = document.getElementById('dayTabs');
  dayTabs.innerHTML = '';
  
  let currentDate = new Date(start);
  let dayIndex = 0;
  
  while (currentDate <= end) {
    const tab = document.createElement('div');
    tab.className = 'day-tab';
    if (dayIndex === currentDayIndex) tab.classList.add('active');
    tab.textContent = `Day ${dayIndex + 1} (${currentDate.getMonth() + 1}/${currentDate.getDate()})`;
    const currentDayIdx = dayIndex; // 保存當前 dayIndex
    tab.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      switchDay(currentDayIdx);
    };
    tab.style.cursor = 'pointer';
    dayTabs.appendChild(tab);
    
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }
  
  // 在右邊添加完成規劃按鈕
  const completeBtn = document.createElement('button');
  completeBtn.className = 'btn-primary complete-btn';
  completeBtn.textContent = '✅ 完成';
  completeBtn.onclick = () => {
    updateSectionVisibility(['p1', 'weather', 'qa', 'itinerary', 'overview']);
  };
  dayTabs.appendChild(completeBtn);
}

function switchDay(dayIndex) {
  console.log('Switching to day:', dayIndex);
  currentDayIndex = dayIndex;
  
  // 更新 tab active 狀態
  document.querySelectorAll('.day-tab').forEach((tab, idx) => {
    if (idx === dayIndex) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // 如果該日期還沒有行程，初始化
  if (!allDaysSlots[currentDayIndex]) {
    allDaysSlots[currentDayIndex] = generateDefaultSlots();
  }
  
  currentSlots = allDaysSlots[currentDayIndex];
  
  // 更新天氣資訊為當前選中的日期
  updateWeatherInfo();
  
  renderSlotList(currentSlots);
  if(currentSlots.length > 0) renderStackForSlot(currentSlots[0]);
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
    
    // 初始化所有日期的行程
    allDaysSlots = {};
    currentDayIndex = 0;
    
    await loadItinerary();
    
    // 顯示天氣卡片並更新天氣資訊
    showWeatherCard();
    await updateWeatherInfo();
    addQAButton();
    
    // 更新顯示狀態：P1 + 天氣
    updateSectionVisibility(['p1', 'weather']);
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
  generateDayTabs();
  
  try {
    // 從後端獲取最新的行程資料
    const response = await fetch(`${API}/plans/${currentPlanId}`);
    if (response.ok) {
      const plan = await response.json();
      const backendSlots = plan.itinerary?.[0]?.slots || [];
      
      if (backendSlots.length > 0) {
        // 使用後端的資料
        allDaysSlots[currentDayIndex] = backendSlots;
        console.log('✅ Loaded slots from backend:', backendSlots.length);
      } else {
        // 如果後端沒有資料，使用預設資料
        if (!allDaysSlots[currentDayIndex]) {
          allDaysSlots[currentDayIndex] = generateDefaultSlots();
        }
      }
    } else {
      // 如果請求失敗，使用預設資料
      if (!allDaysSlots[currentDayIndex]) {
        allDaysSlots[currentDayIndex] = generateDefaultSlots();
      }
    }
  } catch (error) {
    console.error('Error loading itinerary:', error);
    // 如果發生錯誤，使用預設資料
    if (!allDaysSlots[currentDayIndex]) {
      allDaysSlots[currentDayIndex] = generateDefaultSlots();
    }
  }
  
  currentSlots = allDaysSlots[currentDayIndex];
  renderSlotList(currentSlots);
  if(currentSlots.length > 0) renderStackForSlot(currentSlots[0]);
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
    li.onclick = () => {
      document.querySelectorAll('.slot-item').forEach(item => item.classList.remove('focused'));
      li.classList.add('focused');
      renderStackForSlot(s);
    };
    slotList.appendChild(li);
  });
}

function renderStackForSlot(slot){
  const stack = document.getElementById('cardStack');
  stack.innerHTML = '';
  if(!slot) return;
  
  // 更新 focused 狀態
  document.querySelectorAll('.slot-item').forEach(item => item.classList.remove('focused'));
  const focusedItem = document.querySelector(`[data-slot="${slot.slot_id}"]`);
  if(focusedItem) focusedItem.classList.add('focused');
  
  const options = [...(slot.options||[])].slice(0,3); // 只顯示前三張
  console.log(`🃏 Rendering ${options.length} cards for slot ${slot.slot_id}:`, options);
  
  options.forEach((o, idx) => {
    const card = document.createElement('div'); card.className = 'card-item';
    card.style.transform = `translateY(${idx*8}px) scale(${1 - idx*0.04})`;
    const img = document.createElement('img'); 
    // Force reload images to bypass cache
    const imageUrl = o.images?.[0] || 'https://picsum.photos/400/240?random=' + Math.floor(Math.random()*1000);
    img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
    img.onerror = () => {
      // Fallback to a different Unsplash image if the first one fails
      img.src = `https://source.unsplash.com/400x240/?hong-kong,travel&t=${Date.now()}`;
    };
    console.log('🖼️ Loading image:', img.src);
    
    // 更好的評分顯示
    const rating = o.scores?.popularity || o.rating || 4.0;
    const label = document.createElement('div'); 
    label.className = 'card-label'; 
    label.textContent = `${o.title} (${rating})`;
    
    const intro = document.createElement('div'); 
    intro.className = 'card-intro'; 
    const fullText = o.intro || o.description || '精彩推薦，值得一訪';
    const maxLength = 50;
    if (fullText.length > maxLength) {
      intro.innerHTML = `${fullText.substring(0, maxLength)}... <span class="view-more" onclick="showInfoModal('${o.option_id}', '${o.title}', '${fullText}', ${JSON.stringify(o.reviews || []).replace(/"/g, '&quot;')}, '${o.photographer || 'Unknown'}', '${o.transit?.hint || ''}')">(查看更多)</span>`;
    } else {
      intro.textContent = fullText;
    }
    
    const toolbar = document.createElement('div'); toolbar.className = 'card-toolbar';
    const btnAgain = document.createElement('button'); btnAgain.className = 'round-btn again'; btnAgain.textContent = '⟲';
    const btnReject = document.createElement('button'); btnReject.className = 'round-btn reject'; btnReject.textContent = '✕';
    const btnAccept = document.createElement('button'); btnAccept.className = 'round-btn accept'; btnAccept.textContent = '✓';
    const btnInfo = document.createElement('button'); btnInfo.className = 'round-btn info'; btnInfo.textContent = 'i';
    toolbar.appendChild(btnAgain); toolbar.appendChild(btnReject); toolbar.appendChild(btnAccept); toolbar.appendChild(btnInfo);

    btnAgain.onclick = async () => {
      console.log('🔄 Generating more options for', slot.slot_id);
      // 請求更多 AI 生成的選項
      try {
        const response = await fetch(`${API}/plans/${currentPlanId}/generate`, { method: 'POST' });
        if (response.ok) {
          await loadItinerary();
          renderStackForSlot(slot);
        }
      } catch (error) {
        console.error('Failed to generate more options:', error);
        // 如果失敗，使用原本的方式
        const seed = Math.floor(Math.random()*10000);
        slot.options.push({ option_id: `gen-${seed}`, title: o.title + ' (更多)', images: [ (o.images?.[0]||'') + `?r=${seed}` ], intro: o.intro, scores: o.scores });
        allDaysSlots[currentDayIndex] = currentSlots;
        renderStackForSlot(slot);
      }
    };
    
    btnReject.onclick = () => {
      slot.options = slot.options.filter(opt => opt.option_id !== o.option_id);
      if(slot.selected_option_id === o.option_id){ slot.selected_option_id = null; }
      allDaysSlots[currentDayIndex] = currentSlots;
      renderSlotList(currentSlots);
      renderStackForSlot(slot);
    };
    
    btnAccept.onclick = () => {
      const target = currentSlots.find(s => s.slot_id === slot.slot_id);
      if(target){ target.selected_option_id = o.option_id; }
      allDaysSlots[currentDayIndex] = currentSlots;
      renderSlotList(currentSlots);
      // 自動切換到下一個槽位（如有）
      const all = Array.from(document.querySelectorAll('#slotList .slot-item'));
      const idxLi = all.findIndex(li => li.dataset.slot === slot.slot_id);
      if(idxLi >= 0 && all[idxLi+1]) all[idxLi+1].click();
    };
    
    btnInfo.onclick = () => {
      showInfoModal(
        o.option_id,
        o.title,
        fullText,
        o.reviews || [],
        o.photographer || 'Unknown',
        o.transit?.hint || ''
      );
    };

    card.appendChild(img); card.appendChild(label); card.appendChild(intro); card.appendChild(toolbar); stack.appendChild(card);
    
    // 儲存卡片資訊供 modal 使用
    card.dataset.cardInfo = JSON.stringify({
      id: o.option_id,
      title: o.title,
      intro: fullText,
      reviews: o.reviews || [],
      photographer: o.photographer || 'Unknown',
      transit: o.transit?.hint || '',
      images: o.images || []
    });
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

// 日期限制功能
function setupDateValidation() {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  
  // 设置今天为最小日期
  const today = new Date().toISOString().slice(0, 10);
  startDateInput.min = today;
  endDateInput.min = today;
  
  // 当出发日期改变时，更新回程日期的最小值
  startDateInput.addEventListener('change', function() {
    const startDate = this.value;
    if (startDate) {
      endDateInput.min = startDate;
      // 如果回程日期早于出发日期，清空回程日期
      if (endDateInput.value && endDateInput.value < startDate) {
        endDateInput.value = '';
      }
    } else {
      endDateInput.min = today;
    }
  });
  
  // 当回程日期改变时，验证不能早于出发日期
  endDateInput.addEventListener('change', function() {
    const startDate = startDateInput.value;
    const endDate = this.value;
    
    if (startDate && endDate && endDate < startDate) {
      alert('回程日期不能早于出发日期');
      this.value = '';
    }
  });
}

// 页面加载时设置日期验证和预设日期
document.addEventListener('DOMContentLoaded', () => {
  setupDateValidation();
  // 设置预设日期：出发日期和回程日期都为明天
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  document.getElementById('startDate').value = tomorrow.toISOString().slice(0, 10);
  document.getElementById('endDate').value = tomorrow.toISOString().slice(0, 10);
});

// Bindings
document.getElementById('createPlanBtn').onclick = createPlan;
document.getElementById('finalizeBtn').onclick = finalize;
document.getElementById('pdfBtn').onclick = exportPdf;
document.getElementById('icsBtn').onclick = exportIcs;
const regenBtn = document.getElementById('regenBtn');
if(regenBtn){
  regenBtn.onclick = async () => {
    if(!currentPlanId) return alert('請先建立計畫');
    
    // 顯示載入狀態
    regenBtn.textContent = '🤖 AI 生成中...';
    regenBtn.disabled = true;
    
    try {
      console.log('🚀 Starting AI generation...');
      const response = await fetch(API + '/plans/' + currentPlanId + '/generate', { method: 'POST' });
      const data = await response.json();
      
      console.log('📥 AI generation response:', data);
      
      // 如果有 AI 推薦，顯示通知
      if (data.ai_recommendations && data.ai_recommendations.recommendations) {
        const count = data.ai_recommendations.recommendations.length;
        addMessage(`🎯 我已根據您的偏好生成了 ${count} 個新推薦！`, 'ai');
      }
      
      // 清除緩存並重新載入行程以獲取最新的 AI 生成卡片
      allDaysSlots = {}; // 清除緩存
      await loadItinerary();
      
      // 強制重新渲染當前槽位
      if (currentSlots.length > 0) {
        renderStackForSlot(currentSlots[0]);
      }
      
      // 顯示成功訊息
      addMessage('✅ AI 已為您生成全新的香港旅遊卡片！請查看各時段的推薦。', 'ai');
    } catch (error) {
      console.error('Generation failed:', error);
      alert('AI 生成失敗，請稍後再試');
    } finally {
      regenBtn.textContent = '重新生成';
      regenBtn.disabled = false;
    }
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

function showWeatherCard() {
  const weatherCard = document.getElementById('weather');
  if (weatherCard) {
    weatherCard.classList.remove('hidden');
  }
}

async function updateWeatherInfo(){
  const selectedDate = getSelectedDate();
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 8);
  
  // 更新日期顯示
  const dateStr = selectedDate.toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  document.getElementById('weatherDate').textContent = dateStr;
  
  // 檢查日期是否超過 9 天
  if (selectedDate > maxDate) {
    document.getElementById('weatherStatus').textContent = '無法獲取天氣資訊';
    document.getElementById('weatherTemp').textContent = '--';
    document.getElementById('weatherDesc').textContent = '無資料';
    document.getElementById('adviceContent').textContent = '無法提供超過 9 天的天氣預報';
    return;
  }
  
  try{
    const dateStr = selectedDate.toISOString().slice(0,10);
    
    // 更新狀態
    document.getElementById('weatherStatus').textContent = '正在獲取天氣資訊...';
    document.getElementById('weatherTemp').textContent = '--°C';
    document.getElementById('weatherDesc').textContent = '載入中...';
    document.getElementById('adviceContent').textContent = '正在分析最佳旅遊建議...';
    
    const res = await fetch(API + '/weather?date=' + encodeURIComponent(dateStr));
    if(!res.ok) throw new Error('weather http ' + res.status);
    const w = await res.json();
    
    // 更新天氣資訊
    document.getElementById('weatherStatus').textContent = '天氣資訊已更新';
    document.getElementById('weatherTemp').textContent = w.temperature || '25°C';
    document.getElementById('weatherDesc').textContent = w.summary || '晴朗';
    document.getElementById('adviceContent').textContent = w.advice || '天氣良好，適合戶外活動和觀光';
  } catch(e){
    // 使用模擬資料
    document.getElementById('weatherStatus').textContent = '使用預設天氣資訊';
    document.getElementById('weatherTemp').textContent = '25°C';
    document.getElementById('weatherDesc').textContent = '晴朗';
    document.getElementById('adviceContent').textContent = '天氣良好，適合戶外活動。建議攜帶防曬用品，穿著輕便舒適的服裝。';
  }
}

function getSelectedDate() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  if (!startDate || !endDate) return new Date();
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 根據 currentDayIndex 計算當前選中的日期
  const selectedDate = new Date(start);
  selectedDate.setDate(start.getDate() + currentDayIndex);
  
  return selectedDate;
}

// 更新 section 顯示狀態
function updateSectionVisibility(visibleSections) {
  const allSections = ['p1', 'weather', 'qa', 'itinerary', 'overview'];
  
  allSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      if (visibleSections.includes(sectionId)) {
        section.classList.remove('hidden');
        section.style.display = 'block';
      } else {
        section.classList.add('hidden');
        section.style.display = 'none';
      }
    }
  });
  
  // 更新導航狀態
  updateNavigation(visibleSections[visibleSections.length - 1]);
}

// 更新導航狀態
function updateNavigation(activeSection) {
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    if (href === activeSection) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

// 當點擊開始 Q&A 時顯示 QA 卡片
function startQA() {
  if (!currentPlanId) {
    alert('請先建立旅遊計畫');
    return;
  }
  updateSectionVisibility(['p1', 'weather', 'qa']);
}

// 添加開始 Q&A 的按鈕到天氣卡片
function addQAButton() {
  const weatherCard = document.getElementById('weather');
  if (weatherCard && !weatherCard.querySelector('.start-qa-btn')) {
    const qaButton = document.createElement('button');
    qaButton.className = 'btn-primary';
    qaButton.textContent = '🤔 開始個人化問答';
    qaButton.style.marginTop = '16px';
    qaButton.onclick = startQA;
    weatherCard.querySelector('.weather-content').appendChild(qaButton);
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
  if(nextBtn){ nextBtn.textContent = (qaIndex === qaData.length - 1) ? '🎯 完成並查看行程' : '➡️ 下一題'; }
}

document.getElementById('qaPrev').onclick = () => { 
  if(qaIndex > 0){ 
    qaIndex--; 
    renderQA(); 
  } else {
    // 回到天氣頁面
    updateSectionVisibility(['p1', 'weather']);
  }
};

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
    // 完成問卷，生成 AI 推薦並顯示行程
    await generateAIRecommendations();
    updateSectionVisibility(['p1', 'weather', 'qa', 'itinerary']);
    try { await loadItinerary(); } catch {}
  }
};

async function generateAIRecommendations() {
  if (!currentPlanId) return;
  
  try {
    console.log('🚀 Generating AI recommendations...');
    
    // 更新按鈕狀態
    const nextBtn = document.getElementById('qaNext');
    if (nextBtn) {
      nextBtn.textContent = '🤖 AI 生成中...';
      nextBtn.disabled = true;
    }
    
    const response = await fetch(`${API}/plans/${currentPlanId}/generate`, { 
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ generate_all: true })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ AI recommendations generated:', data);
      
      // 清除緩存以獲取最新的 AI 生成卡片
      allDaysSlots = {};
      
      return data;
    }
  } catch (error) {
    console.error('❌ AI generation failed:', error);
  } finally {
    // 恢復按鈕狀態
    const nextBtn = document.getElementById('qaNext');
    if (nextBtn) {
      nextBtn.textContent = '🎯 完成並查看行程';
      nextBtn.disabled = false;
    }
  }
}

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

// 導航點擊處理
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetSection = link.getAttribute('href').replace('#', '');
    
    // 根據目標 section 決定要顯示的內容
    if (targetSection === 'p1') {
      updateSectionVisibility(['p1']);
    } else if (targetSection === 'qa') {
      if (currentPlanId) {
        updateSectionVisibility(['p1', 'weather', 'qa']);
      } else {
        alert('請先建立旅遊計畫');
        return;
      }
    } else if (targetSection === 'itinerary') {
      if (currentPlanId) {
        updateSectionVisibility(['p1', 'weather', 'qa', 'itinerary']);
      } else {
        alert('請先建立旅遊計畫');
        return;
      }
    } else if (targetSection === 'overview') {
      if (currentPlanId) {
        updateSectionVisibility(['p1', 'weather', 'qa', 'itinerary', 'overview']);
      } else {
        alert('請先建立旅遊計畫');
        return;
      }
    }
  });
});

// 初始化時先隱藏 QA 卡片但渲染
document.getElementById('qa').classList.add('hidden');
renderQA();

// 初始化顯示狀態
updateSectionVisibility(['p1']);

// AI Agent Chat
document.getElementById('aiAgent').onclick = () => {
  document.getElementById('chatRoom').classList.remove('hidden');
};

document.getElementById('chatClose').onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('chatRoom').classList.add('hidden');
};

document.getElementById('chatSend').onclick = async () => {
  const textarea = document.getElementById('chatTextarea');
  const message = textarea.value.trim();
  if (!message) return;
  
  // 添加用戶消息
  addMessage(message, 'user');
  textarea.value = '';
  
  // 顯示載入中
  addMessage('呱呱努力思考中...', 'thinking');
  
  try {
    const response = await sendChatMessage(message);
    // 移除載入訊息
    const loadingMsg = document.querySelector('.thinking-message');
    if (loadingMsg) loadingMsg.remove();
    
    addMessage(response, 'ai');
  } catch (error) {
    // 移除載入訊息並顯示錯誤
    const loadingMsg = document.querySelector('.thinking-message');
    if (loadingMsg) loadingMsg.remove();
    
    addMessage('抱歉，我現在無法回應，請稍後再試。', 'ai');
  }
};

function addMessage(content, type) {
  const messagesContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  if (type === 'ai') {
    // AI 訊息使用打字機效果
    messageDiv.classList.add('typing');
    contentDiv.textContent = '';
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // 逐字顯示
    let i = 0;
    const typeWriter = () => {
      if (i < content.length) {
        contentDiv.textContent += content.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
      } else {
        messageDiv.classList.remove('typing');
      }
    };
    typeWriter();
  } else {
    contentDiv.textContent = content;
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
  }
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendChatMessage(message) {
  if (!currentPlanId) {
    return '請先建立旅遊計畫，我才能為您提供個人化建議。';
  }
  
  const response = await fetch(`${API}/plans/${currentPlanId}/chat`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ message })
  });
  
  if (!response.ok) {
    throw new Error('Chat API failed');
  }
  
  const data = await response.json();
  return data.response;
}

// Enter key support
document.getElementById('chatTextarea').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('chatSend').click();
  }
});