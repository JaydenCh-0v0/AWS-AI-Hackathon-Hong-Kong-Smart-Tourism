const API = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api';
let currentPlanId = null;
let currentBudget = 'medium';
let currentDayIndex = 0;
let allDaysSlots = {}; // 儲存所有日期的行程
let currentSlots = []; // 當前日期的行程

const qaData = [
  {
    qid: 'q1',
    text: 'What kind of itinerary do you prefer?',
    type: 'choices',
    choices: [
      { cid: 'q1a1', label: 'Prefer enjoying natural scenery over urban areas' },
      { cid: 'q1a2', label: 'Happy to spend all day shopping' },
      { cid: 'q1a3', label: 'Early riser, want to play and enjoy fully' },
      { cid: 'q1a4', label: 'Sleep well and go wherever you want' },
    ]
  },
  {
    qid: 'q2',
    text: 'What are your requirements for accommodation?',
    type: 'choices',
    choices: [
      { cid: 'q2a1', label: 'As long as there is a bed and a clean bathroom, it’s fine' },
      { cid: 'q2a2', label: 'Prefer local-style guesthouses (can be farther away)' },
      { cid: 'q2a3', label: 'I won’t stay unless it’s a five-star hotel' },
      { cid: 'q2a4', label: 'More concerned about hotel/guesthouse facilities' },
    ]
  },
  {
    qid: 'q3',
    text: 'What are your food preferences during travel?',
    type: 'choices',
    choices: [
      { cid: 'q3a1', label: "I'll eat whatever I like on the street" },
      { cid: 'q3a2', label: "I must have three proper meals and can't go hungry" },
      { cid: 'q3a3', label: "It's okay to skip a meal" },
      { cid: 'q3a4', label: "As long as it's delicious, I'll wait in long lines or pay any price" },
    ]
  },
  {
    qid: 'q4',
    text: 'How do you choose your transportation during travel?',
    type: 'choices',
    choices: [
      { cid: 'q4a1', label: 'Walk whenever possible' },
      { cid: 'q4a2', label: 'Taxi' },
      { cid: 'q4a3', label: 'Bus/public transportation' },
      { cid: 'q4a4', label: 'Charter a private car for maximum comfort' },
    ]
  },
  {
    qid: 'q5',
    text: 'What is most relaxing and stress-relieving for you?',
    type: 'choices',
    choices: [
      { cid: 'q5a1', label: "Being in a lively, bustling crowd full of energy" },
      { cid: 'q5a2', label: "Strolling through the city, spending time with myself, exploring self" },
      { cid: 'q5a3', label: "Doing nothing and staying at the hotel" },
      { cid: 'q5a4', label: "Exploring new people, things, and experiences" },
    ]
  },
  {
    qid: 'q6',
    text: 'Do you have any expectation for this trip?',
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
      { id: 'hotel-1', name: '尖沙咀海景酒店 InterContinental Grand Stanford Hong Kong by IHG', rating: 4.3, img: 'https://picsum.photos/seed/hotel1/400/240' },
      { id: 'hotel-2', name: '香港中環石板街酒店 The Pottinger Hong Kong', rating: 4.2, img: 'https://picsum.photos/seed/hotel2/400/240' },
      { id: 'hotel-3', name: '灣仔精品酒店 Wifi Boutique Hotel', rating: 4.1, img: 'https://picsum.photos/seed/hotel3/400/240' }
    ]
  };
  return (pool[type]||[]).map(x=>({ option_id:x.id, title:x.name, images:[x.img], intro:'Only for Demo used', scores:{popularity:x.rating} }));
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
  completeBtn.textContent = '✅ Done';
  completeBtn.onclick = () => {
    updateSectionVisibility(['p1', 'weather', 'qa', 'itinerary', 'overview']);
    // Update navigation focus from Plan to Overview
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('current'));
    const overviewLink = document.querySelector('nav a[href="Overview.html"]');
    if (overviewLink) overviewLink.classList.add('current');
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
    if(!data.plan_id){ throw new Error('Return Format Error'); }
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
    alert('Fail to build the Plan, Please try later...' + (e?.message || e));
  }
}

async function answer(q, a){
  if(!currentPlanId) return alert('Have planning first');
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
    const text = document.createElement('div'); text.style.flex = '1'; text.innerHTML = `<div>${s.label}</div><div class="muted">${s.selected_option_id ? 'Selected：' + selectedName : 'Empty'}</div>`;
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
    const fullText = o.intro || o.description || 'Highly recommended';
    const maxLength = 50;
    if (fullText.length > maxLength) {
      intro.innerHTML = `${fullText.substring(0, maxLength)}... <span class="view-more" onclick="showInfoModal('${o.option_id}', '${o.title}', '${fullText}', ${JSON.stringify(o.reviews || []).replace(/"/g, '&quot;')}, '${o.photographer || 'Unknown'}', '${o.transit?.hint || ''}')"> (More Info) </span>`;
    } else {
      intro.textContent = fullText;
    }
    
    // Add traffic information
    if (o.traffic) {
      const trafficDiv = document.createElement('div');
      trafficDiv.className = 'card-traffic';
      trafficDiv.style.fontSize = '12px';
      trafficDiv.style.color = '#666';
      trafficDiv.style.marginTop = '8px';
      trafficDiv.textContent = o.traffic;
      intro.appendChild(trafficDiv);
    }
    
    // Add user comment
    if (o.userComment) {
      const commentDiv = document.createElement('div');
      commentDiv.className = 'card-comment';
      commentDiv.style.fontSize = '12px';
      commentDiv.style.color = '#0a7';
      commentDiv.style.marginTop = '6px';
      commentDiv.style.fontStyle = 'italic';
      commentDiv.textContent = o.userComment;
      intro.appendChild(commentDiv);
    }
    
    // Add booking links
    if (slot.slot_id === 'breakfast' || slot.slot_id === 'lunch' || slot.slot_id === 'dinner') {
      const bookingLink = document.createElement('div');
      bookingLink.innerHTML = `<a href="https://www.openrice.com/en/hongkong/restaurants?whatwhere=${encodeURIComponent(o.title)}&tabIndex=0" target="_blank" style="color: var(--primary); text-decoration: none; font-size: 12px;">📍 Book on OpenRice</a>`;
      intro.appendChild(bookingLink);
    } else if (slot.slot_id === 'accommodation') {
      const bookingLink = document.createElement('div');
      bookingLink.innerHTML = `<a href="https://www.hotels.com/search.do?q-destination=${encodeURIComponent('Hong Kong')}&q-check-in=${document.getElementById('startDate').value}&q-check-out=${document.getElementById('endDate').value}&q-rooms=1" target="_blank" style="color: var(--primary); text-decoration: none; font-size: 12px;">🏨 Book on Hotels.com</a>`;
      intro.appendChild(bookingLink);
    }
    
    const toolbar = document.createElement('div'); toolbar.className = 'card-toolbar';
    const btnAgain = document.createElement('button'); btnAgain.className = 'round-btn again'; btnAgain.textContent = '⟲';
    const btnReject = document.createElement('button'); btnReject.className = 'round-btn reject'; btnReject.textContent = '✕';
    const btnAccept = document.createElement('button'); btnAccept.className = 'round-btn accept'; btnAccept.textContent = '✓';
    const btnInfo = document.createElement('button'); btnInfo.className = 'round-btn info'; btnInfo.textContent = 'i';
    
    // Add booking buttons
    if (slot.slot_id === 'breakfast' || slot.slot_id === 'lunch' || slot.slot_id === 'dinner') {
      const btnBook = document.createElement('button'); 
      btnBook.className = 'round-btn book'; 
      btnBook.textContent = '📍';
      btnBook.title = 'Book on OpenRice';
      btnBook.onclick = (e) => {
        e.stopPropagation();
        window.open(`https://www.openrice.com/en/hongkong/restaurants?whatwhere=${encodeURIComponent(o.title)}&tabIndex=0`, '_blank');
      };
      toolbar.appendChild(btnBook);
    } else if (slot.slot_id === 'accommodation') {
      const btnBook = document.createElement('button'); 
      btnBook.className = 'round-btn hotel'; 
      btnBook.textContent = '🏨';
      btnBook.title = 'Book on Hotels.com';
      btnBook.onclick = (e) => {
        e.stopPropagation();
        const checkIn = document.getElementById('startDate').value;
        const checkOut = document.getElementById('endDate').value;
        window.open(`https://www.hotels.com/search.do?q-destination=${encodeURIComponent('Hong Kong')}&q-check-in=${checkIn}&q-check-out=${checkOut}&q-rooms=1`, '_blank');
      };
      toolbar.appendChild(btnBook);
    }
    
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
        slot.options.push({ option_id: `gen-${seed}`, title: o.title + ' (More)', images: [ (o.images?.[0]||'') + `?r=${seed}` ], intro: o.intro, scores: o.scores });
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
    
    btnAccept.onclick = async () => {
      const target = currentSlots.find(s => s.slot_id === slot.slot_id);
      if(target){ target.selected_option_id = o.option_id; }
      allDaysSlots[currentDayIndex] = currentSlots;
      renderSlotList(currentSlots);
      await refreshOverview(); // Update overview immediately
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
  
  // Generate AI overview
  await generateAIOverview(plan);
  
  const sum = document.getElementById('overviewSummary');
  if(sum){
    sum.innerHTML = '';
    // Use current slots data which has the actual selections
    const slots = allDaysSlots[currentDayIndex] || currentSlots || [];
    slots.forEach(s => {
      const sel = s.options?.find(o => o.option_id === s.selected_option_id);
      const badge = document.createElement('span'); 
      badge.className = 'chip';
      if (sel) {
        badge.textContent = `${s.slot_id}: ${sel.title}`;
        badge.style.background = '#0a7';
        badge.style.color = 'white';
      } else {
        badge.textContent = `${s.slot_id}: Not Selected`;
        badge.style.background = '#ccc';
        badge.style.color = '#666';
      }
      sum.appendChild(badge);
    });
  }
}

async function generateAIOverview(plan) {
  const overviewText = document.getElementById('aiOverviewText');
  const voiceBtn = document.getElementById('voiceOverviewBtn');
  
  if (!overviewText) return;
  
  try {
    overviewText.textContent = 'AI analyzing your travel plan...';
    
    // Send current slots data for more accurate analysis
    const currentSlotsData = allDaysSlots[currentDayIndex] || currentSlots || [];
    
    const response = await fetch(`${API}/plans/${currentPlanId}/overview`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ currentSlots: currentSlotsData })
    });
    
    if (response.ok) {
      const data = await response.json();
      overviewText.textContent = data.overview || 'Your Hong Kong travel plan looks great! Based on the weather forecast, I recommend bringing comfortable walking shoes and light clothing.';
    } else {
      // Fallback with current slots data
      const selectedCount = currentSlotsData.filter(s => s.selected_option_id).length;
      if (selectedCount > 0) {
        const selectedNames = currentSlotsData
          .filter(s => s.selected_option_id)
          .map(s => s.options.find(o => o.option_id === s.selected_option_id)?.title)
          .filter(Boolean)
          .slice(0, 3)
          .join(', ');
        overviewText.textContent = `Great Hong Kong itinerary! 🎆 You've selected ${selectedCount} activities including ${selectedNames}${selectedCount > 3 ? ' and more' : ''}. Your plan offers a wonderful mix of Hong Kong's culture, cuisine, and attractions. Remember to wear comfortable shoes and enjoy the journey!`;
      } else {
        overviewText.textContent = 'Welcome to your Hong Kong adventure! 🇭🇰 Start selecting your preferred activities to create your personalized itinerary.';
      }
    }
  } catch (error) {
    // Fallback with current slots data
    const currentSlotsData = allDaysSlots[currentDayIndex] || currentSlots || [];
    const selectedCount = currentSlotsData.filter(s => s.selected_option_id).length;
    if (selectedCount > 0) {
      overviewText.textContent = `Your Hong Kong travel plan is taking shape! 🎆 You've selected ${selectedCount} activities. Based on the weather forecast, your itinerary looks great for exploring Hong Kong's best attractions, dining, and culture.`;
    } else {
      overviewText.textContent = 'Welcome to your Hong Kong adventure! 🇭🇰 Start selecting your preferred activities to create your personalized itinerary.';
    }
  }
  
  // Enable voice button
  if (voiceBtn) {
    voiceBtn.disabled = false;
    voiceBtn.onclick = () => speakText(overviewText.textContent);
  }
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }
}

function exportToGoogleMaps() {
  if (!currentPlanId) return;
  
  const slots = allDaysSlots[currentDayIndex] || currentSlots || [];
  const waypoints = [];
  
  slots.forEach(slot => {
    const selected = slot.options.find(o => o.option_id === slot.selected_option_id);
    if (selected && (slot.slot_id === 'morning' || slot.slot_id === 'afternoon' || slot.slot_id === 'evening' || slot.slot_id === 'night')) {
      waypoints.push(encodeURIComponent(selected.title + ' Hong Kong'));
    }
  });
  
  if (waypoints.length > 0) {
    const url = `https://www.google.com/maps/dir/${waypoints.join('/')}`;
    window.open(url, '_blank');
  } else {
    alert('Please select some attractions first!');
  }
}

function exportToGoogleCalendar() {
  if (!currentPlanId) return;
  
  const startDate = document.getElementById('startDate').value;
  if (!startDate) return;
  
  const slots = allDaysSlots[currentDayIndex] || currentSlots || [];
  const events = [];
  
  slots.forEach(slot => {
    const selected = slot.options.find(o => o.option_id === slot.selected_option_id);
    if (selected) {
      const timeMap = {
        'breakfast': '0800',
        'morning': '0900',
        'lunch': '1200',
        'afternoon': '1330',
        'evening': '1530',
        'dinner': '1830',
        'night': '2000',
        'accommodation': '2200'
      };
      
      const endTimeMap = {
        'breakfast': '0900',
        'morning': '1200',
        'lunch': '1330',
        'afternoon': '1530',
        'evening': '1830',
        'dinner': '2000',
        'night': '2200',
        'accommodation': '0800'
      };
      
      const startTime = timeMap[slot.slot_id] || '0900';
      const endTime = endTimeMap[slot.slot_id] || '1000';
      const eventDate = startDate.replace(/-/g, '');
      const nextDay = slot.slot_id === 'accommodation' ? 
        (parseInt(eventDate) + 1).toString() : eventDate;
      
      const title = encodeURIComponent(`${selected.title}`);
      const details = encodeURIComponent(`${slot.label}\n\n${selected.intro || ''}\n\nTraffic: ${selected.traffic || 'MTR access'}`);
      
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${eventDate}T${startTime}00/${nextDay}T${endTime}00&details=${details}&location=${encodeURIComponent(selected.title + ', Hong Kong')}`;
      events.push(calendarUrl);
    }
  });
  
  if (events.length > 0) {
    events.forEach((url, index) => {
      setTimeout(() => window.open(url, '_blank'), index * 500);
    });
  } else {
    alert('Please select your itinerary items first!');
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
      alert('Return date must be later than depart date');
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
    if(!currentPlanId) return alert('Plan First');
    
    // 顯示載入狀態
    regenBtn.textContent = '🤖 AI generating...';
    regenBtn.disabled = true;
    
    try {
      console.log('🚀 Starting AI generation...');
      const response = await fetch(API + '/plans/' + currentPlanId + '/generate', { method: 'POST' });
      const data = await response.json();
      
      console.log('📥 AI generation response:', data);
      
      // 如果有 AI 推薦，顯示通知
      if (data.ai_recommendations && data.ai_recommendations.recommendations) {
        const count = data.ai_recommendations.recommendations.length;
        addMessage(`🎯 I have generated ${count} new recommendations based on your preferences.`, 'ai');
      }
      
      // 清除緩存並重新載入行程以獲取最新的 AI 生成卡片
      allDaysSlots = {}; // 清除緩存
      await loadItinerary();
      
      // 強制重新渲染當前槽位
      if (currentSlots.length > 0) {
        renderStackForSlot(currentSlots[0]);
      }
      
      // 顯示成功訊息
      addMessage('✅AI has generated brand new Hong Kong travel cards for you! Please check the recommendations for each time period.', 'ai');
    } catch (error) {
      console.error('Generation failed:', error);
      alert('AI generation failed, please try again later.');
    } finally {
      regenBtn.textContent = 'Regenerate';
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
    document.getElementById('weatherStatus').textContent = 'Unable to obtain weather information.';
    document.getElementById('weatherTemp').textContent = '--';
    document.getElementById('weatherDesc').textContent = 'No information';
    document.getElementById('adviceContent').textContent = 'Weather forecasts beyond 9 days cannot be provided.';
    return;
  }
  
  try{
    const dateStr = selectedDate.toISOString().slice(0,10);
    document.getElementById('weatherStatus').textContent = 'Fetching weather information...';
    document.getElementById('weatherTemp').textContent = '--°C';
    document.getElementById('weatherDesc').textContent = 'Loading...';
    document.getElementById('adviceContent').textContent = 'Analyzing best travel advice...';

    const res = await fetch(API + '/weather?date=' + encodeURIComponent(dateStr));
    if(!res.ok) throw new Error('weather http ' + res.status);
    const w = await res.json();

    // Update weather information
    document.getElementById('weatherStatus').textContent = 'Weather information updated';
    document.getElementById('weatherTemp').textContent = w.temperature || '25°C';
    document.getElementById('weatherDesc').textContent = w.summary || 'Sunny';
    document.getElementById('adviceContent').textContent = w.advice || 'Good weather, suitable for outdoor activities and sightseeing';
    } catch(e){
    // Use default data
    document.getElementById('weatherStatus').textContent = 'Using default weather information';
    document.getElementById('weatherTemp').textContent = '25°C';
    document.getElementById('weatherDesc').textContent = 'Sunny';
    document.getElementById('adviceContent').textContent = 'Good weather, suitable for outdoor activities. Recommend carrying sunscreen and wearing lightweight comfortable clothing.';
  }

    /*
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
    */
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
    alert('Please create a travel plan first.');
    return;
  }
  updateSectionVisibility(['p1', 'weather', 'qa']);
}

// 添加開始 Q&A 的按鈕到天氣卡片，按鈕包裹文字並有右上角框線
function addQAButton() {
  const weatherCard = document.getElementById('weather');
  if (weatherCard && !weatherCard.querySelector('.start-qa-btn')) {
    const qaButton = document.createElement('button');
    qaButton.className = 'btn-primary start-qa-btn';
    qaButton.textContent = 'GO to Peronalized Quiz';
    qaButton.style.marginTop = '24px';
    qaButton.style.marginBottom = '16px';
    qaButton.style.marginRight = '16px';
    qaButton.style.height = '36px';
    qaButton.onclick = startQA;
    // Append the button to the bottom of the weather card frame with some margin between the frame
    weatherCard.appendChild(qaButton);
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
      btn.className = 'qa-choice-btn';
      btn.textContent = c.label;
      btn.onclick = async () => {
        qaAnswers[q.qid] = c.cid;
        const prev = box.querySelector('.choice-selected'); if(prev) prev.classList.remove('choice-selected');
        btn.classList.add('choice-selected');
        try { await answer(q.qid, c.cid); if(status) status.textContent = 'Sent：' + c.label; }
        catch { if(status) status.textContent = 'Send Failure, Please try again'; }
      };
      box.appendChild(btn);
    });
  } else if(q.type === 'text'){
    const ta = document.createElement('textarea');
    ta.id = 'qaText';
    ta.rows = 3;
    ta.style.width = '100%';
    ta.placeholder = 'Any Other epxectation for this trip? (optional)';
    box.appendChild(ta);
  }
  // 更新下一題按鈕文案（最後一題改為完成）
  const nextBtn = document.getElementById('qaNext');
  if(nextBtn){ nextBtn.textContent = (qaIndex === qaData.length - 1) ? '🎯 Finish and check the plan' : '➡️ Next Question'; }
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
      nextBtn.textContent = '🤖 AI generating...';
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
      nextBtn.textContent = 'Complete and review your trip';
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
        alert('Please create a travel plan first.');
        return;
      }
    } else if (targetSection === 'itinerary') {
      if (currentPlanId) {
        updateSectionVisibility(['p1', 'weather', 'qa', 'itinerary']);
      } else {
        alert('Please create a travel plan first.');
        return;
      }
    } else if (targetSection === 'overview') {
      if (currentPlanId) {
        updateSectionVisibility(['p1', 'weather', 'qa', 'itinerary', 'overview']);
      } else {
        alert('Please create a travel plan first.');
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
  addMessage('Froggy Thinking...', 'thinking');
  
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
    
    addMessage('Sorry, I am unable to respond right now, please try again later.', 'ai');
  }
};

function addMessage(content, type) {
  const messagesContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  if (type === 'ai') {
    // AI 訊息直接顯示，不使用打字機效果
    contentDiv.innerHTML = content;
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
  } else {
    contentDiv.textContent = content;
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
  }
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendChatMessage(message) {
  if (!currentPlanId) {
    return 'Please create a travel plan first.，I can then provide you with personalized recommendations。';
  }
  
  // Check for complete travel planning request
  if (message.toLowerCase().includes('complete') && (message.toLowerCase().includes('plan') || message.toLowerCase().includes('travel') || message.toLowerCase().includes('itinerary'))) {
    return await autoCompleteTravelPlan();
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

async function autoCompleteTravelPlan() {
  if (!currentPlanId) return 'Please create a travel plan first.';
  
  try {
    const slots = allDaysSlots[currentDayIndex] || currentSlots || [];
    let completedCount = 0;
    
    // Auto-select first option for empty slots
    slots.forEach(slot => {
      if (!slot.selected_option_id && slot.options && slot.options.length > 0) {
        slot.selected_option_id = slot.options[0].option_id;
        completedCount++;
      }
    });
    
    // Update the slots data
    allDaysSlots[currentDayIndex] = slots;
    currentSlots = slots;
    
    // Refresh the UI
    renderSlotList(currentSlots);
    await refreshOverview();
    
    if (completedCount > 0) {
      return `🎆 Perfect! I've completed your Hong Kong travel plan by selecting ${completedCount} activities for you! Your itinerary now includes:\n\n${slots.filter(s => s.selected_option_id).map(s => {
        const selected = s.options.find(o => o.option_id === s.selected_option_id);
        return `• ${s.slot_id}: ${selected?.title || 'Selected'}`;
      }).join('\n')}\n\n🌟 Your complete Hong Kong adventure is ready! Check the overview section for export options to Google Maps and Calendar. Have an amazing trip! 🇭🇰`;
    } else {
      const selectedItems = slots.filter(s => s.selected_option_id);
      return `🎉 Great news! Your Hong Kong travel plan is already complete with ${selectedItems.length} selected activities:\n\n${selectedItems.map(s => {
        const selected = s.options.find(o => o.option_id === s.selected_option_id);
        return `• ${s.slot_id}: ${selected?.title || 'Selected'}`;
      }).join('\n')}\n\n🗺️ You can now export your plan to Google Maps and Google Calendar from the overview section. Enjoy your Hong Kong adventure! 🇭🇰`;
    }
  } catch (error) {
    console.error('Auto-complete error:', error);
    return '🤖 I encountered an issue while completing your plan. Please try selecting your preferences manually, and I\'ll be happy to help with any questions!';
  }
}

// Enter key support
document.getElementById('chatTextarea').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('chatSend').click();
  }
});