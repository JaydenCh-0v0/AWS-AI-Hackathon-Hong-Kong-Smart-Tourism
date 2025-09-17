import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { createEvents } from 'ics';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchHkoNineDay, extractDailyForecastNineDay, weatherAdviceFromSummary } from './integrations/hko.js';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for demo
const plans = new Map();

// Minimal Plan JSON helpers
function buildSlotsForOneDay(date) {
  return [
    { slot_id: 'breakfast', label: 'Breakfast (08:00–09:00)', options: [], selected_option_id: null, swipe_history: [] },
    { slot_id: 'morning', label: 'Morning (09:00–12:00)', options: [], selected_option_id: null, swipe_history: [] },
    { slot_id: 'lunch', label: 'Lunch (12:00–13:30)', options: [], selected_option_id: null, swipe_history: [] },
    { slot_id: 'afternoon', label: 'Afternoon (13:30–15:30)', options: [], selected_option_id: null, swipe_history: [] },
    { slot_id: 'evening', label: 'Evening (15:30–18:30)', options: [], selected_option_id: null, swipe_history: [] },
    { slot_id: 'dinner', label: 'Dinner (18:30–20:00)', options: [], selected_option_id: null, swipe_history: [] },
    { slot_id: 'night', label: 'Night (20:00–22:00)', options: [], selected_option_id: null, swipe_history: [] },
    { slot_id: 'accommodation', label: 'Accommodation (22:00–08:00)', options: [], selected_option_id: null, swipe_history: [] }
  ];
}

function createMinimalPlan({ budget, date_range, locations }) {
  const planId = nanoid(10);
  const createdAt = new Date().toISOString();
  const startDate = new Date(date_range.start_date);
  const day = (offset) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  return {
    plan_id: planId,
    created_at: createdAt,
    updated_at: createdAt,
    version: '0.1.0',
    inputs: { budget, date_range, locations },
    context: { weather: [] },
    expectation_answers: [],
    preference_profile: {},
    itinerary: [ { day_index: 1, date: day(0), slots: buildSlotsForOneDay(day(0)) } ],
    final_selection: {},
    exports: {},
    audit: []
  };
}

function mockOptions(type) {
  const base = {
    poi: [
      { id: 'poi-1', name: '太平山 Victoria Peak', rating: 4.7, images: ['https://picsum.photos/seed/peak/400/240'] },
      { id: 'poi-2', name: '星光大道 Avenue of Stars', rating: 4.5, images: ['https://picsum.photos/seed/avenue/400/240'] },
      { id: 'poi-3', name: '天星小輪 Star Ferry', rating: 4.6, images: ['https://picsum.photos/seed/ferry/400/240'] }
    ],
    food: [
      { id: 'food-1', name: '添好運 Tim Ho Wan', rating: 4.4, images: ['https://picsum.photos/seed/timhowan/400/240'] },
      { id: 'food-2', name: '九記牛腩 Kau Kee', rating: 4.5, images: ['https://picsum.photos/seed/kaukee/400/240'] },
      { id: 'food-3', name: '勝香園 Sing Heung Yuen', rating: 4.6, images: ['https://picsum.photos/seed/singheung/400/240'] }
    ],
    hotel: [
      { id: 'hotel-1', name: '尖沙咀海景酒店', rating: 4.3, images: ['https://picsum.photos/seed/hotel1/400/240'] },
      { id: 'hotel-2', name: '中環商旅酒店', rating: 4.2, images: ['https://picsum.photos/seed/hotel2/400/240'] },
      { id: 'hotel-3', name: '灣仔精品酒店', rating: 4.1, images: ['https://picsum.photos/seed/hotel3/400/240'] }
    ]
  };
  return (base[type] || []).map((x) => ({
    option_id: x.id,
    title: x.name,
    intro: '示意資料，僅供 Demo 使用',
    images: [x.images[0], x.images[0] + '?1', x.images[0] + '?2', x.images[0] + '?3', x.images[0] + '?4'],
    reviews: [
      { author: 'Alice', text: '很棒的體驗！' },
      { author: 'Bob', text: '值得再訪。' },
      { author: 'Carol', text: '風景很美/食物很讚。' },
      { author: 'Dave', text: '動線方便。' },
      { author: 'Eve', text: '排隊稍久，但值得。' }
    ],
    transit: { hint: '地鐵/步行 10 分鐘' },
    scores: { popularity: x.rating, preference_match: 0.7, weather_fit: 0.8 }
  }));
}

function fillOptionsForSlots(slots) {
  for (const slot of slots) {
    const type =
      slot.slot_id === 'breakfast' || slot.slot_id === 'lunch' || slot.slot_id === 'dinner'
        ? 'food'
        : slot.slot_id === 'accommodation'
        ? 'hotel'
        : 'poi';
    slot.options = mockOptions(type);
  }
}

function ensureEightSlots(plan) {
  const day0 = plan.itinerary && plan.itinerary[0];
  if (!day0) return plan;
  if (!Array.isArray(day0.slots) || day0.slots.length < 8) {
    const slots = buildSlotsForOneDay(day0.date);
    fillOptionsForSlots(slots);
    day0.slots = slots;
    plan.updated_at = new Date().toISOString();
  }
  return plan;
}

function selectDefaultsForSlots(slots) {
  for (const slot of slots) {
    if (!slot.selected_option_id && Array.isArray(slot.options) && slot.options.length > 0) {
      slot.selected_option_id = slot.options[0].option_id;
    }
  }
}

// POST /plans — create plan from inputs
app.post('/plans', (req, res) => {
  const { budget, date_range, locations } = req.body || {};
  const plan = createMinimalPlan({ budget, date_range, locations });
  // Weather mock per day (sunny/rainy alternating)
  plan.context.weather = [];
  // Fill mock options for 8 slots
  const day0 = plan.itinerary[0];
  fillOptionsForSlots(day0.slots);
  selectDefaultsForSlots(day0.slots);
  plans.set(plan.plan_id, plan);
  res.json({ plan_id: plan.plan_id });
});

// GET /weather?date=YYYY-MM-DD
app.get('/weather', async (req, res) => {
  try {
    const date = (req.query.date || '').toString();
    if (!/\d{4}-\d{2}-\d{2}/.test(date)) return res.status(400).json({ error: 'invalid date' });
    const json = await fetchHkoNineDay('tc');
    const one = extractDailyForecastNineDay(json, date);
    if (!one) {
      // Out of 9-day range → graceful fallback
      return res.json({ date, summary: 'Sunny', precipitation_probability: 10, advice: '適合戶外行程' });
    }
    one.advice = weatherAdviceFromSummary(one.summary);
    res.json(one);
  } catch (e) {
    // Fallback to mock
    res.json({ date: req.query.date, summary: 'Sunny', precipitation_probability: 10, advice: '適合戶外行程' });
  }
});

// POST /plans/:id/answers — append Q&A
app.post('/plans/:id/answers', (req, res) => {
  const plan = plans.get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'plan not found' });
  const payload = req.body || {};
  plan.expectation_answers.push({ ...payload, selected_at: new Date().toISOString() });
  plan.updated_at = new Date().toISOString();
  res.json({ ok: true });
});

// POST /plans/:id/generate — no-op for demo (already filled)
app.post('/plans/:id/generate', (req, res) => {
  const plan = plans.get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'plan not found' });
  ensureEightSlots(plan);
  const day0 = plan.itinerary[0];
  // Refill empty options just in case and set defaults for unselected
  for (const slot of day0.slots) {
    if (!Array.isArray(slot.options) || slot.options.length === 0) {
      const type = slot.slot_id === 'breakfast' || slot.slot_id === 'lunch' || slot.slot_id === 'dinner' ? 'food' : (slot.slot_id === 'accommodation' ? 'hotel' : 'poi');
      slot.options = mockOptions(type);
    }
  }
  selectDefaultsForSlots(day0.slots);
  res.json({ ok: true });
});

// POST /plans/:id/swipe — record swipe and selection
app.post('/plans/:id/swipe', (req, res) => {
  const plan = plans.get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'plan not found' });
  const { day_index, slot_id, action, option_id } = req.body || {};
  const day = plan.itinerary.find((d) => d.day_index === day_index);
  if (!day) return res.status(400).json({ error: 'invalid day_index' });
  const slot = day.slots.find((s) => s.slot_id === slot_id);
  if (!slot) return res.status(400).json({ error: 'invalid slot_id' });
  slot.swipe_history.push({ action, option_id, at: new Date().toISOString() });
  if (action === 'keep') {
    slot.selected_option_id = option_id;
  } else if (action === 'remove') {
    slot.options = slot.options.filter((o) => o.option_id !== option_id);
    if (slot.selected_option_id === option_id) slot.selected_option_id = null;
    // Auto-refill when depleted
    if (slot.options.length < 1) {
      slot.options = mockOptions(slot_id === 'lunch' ? 'food' : 'poi');
    }
  }
  plan.updated_at = new Date().toISOString();
  res.json({ ok: true, slot });
});

// GET /plans/:id — fetch plan
app.get('/plans/:id', (req, res) => {
  const plan = plans.get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'plan not found' });
  res.json(ensureEightSlots(plan));
});

// POST /plans/:id/finalize — freeze
app.post('/plans/:id/finalize', (req, res) => {
  const plan = plans.get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'plan not found' });
  plan.final_selection = { at: new Date().toISOString() };
  res.json({ ok: true });
});

// POST /plans/:id/export/pdf — return placeholder URL
app.post('/plans/:id/export/pdf', (req, res) => {
  const plan = plans.get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'plan not found' });
  const url = `https://example.com/pdf/${plan.plan_id}.pdf`;
  plan.exports.pdf_url = url;
  res.json({ url });
});

// POST /plans/:id/calendar — return ICS file content
app.post('/plans/:id/calendar', (req, res) => {
  const plan = plans.get(req.params.id);
  if (!plan) return res.status(404).json({ error: 'plan not found' });
  // Build one event for demo
  const [y, m, d] = plan.itinerary[0].date.split('-').map((x) => parseInt(x, 10));
  const { error, value } = createEvents([
    {
      title: 'HK Trip Day 1',
      start: [y, m, d, 9, 0],
      end: [y, m, d, 12, 0]
    }
  ]);
  if (error) return res.status(500).json({ error: String(error) });
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=plan-${plan.plan_id}.ics`);
  res.send(value);
});

// Serve static frontend for demo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../frontend');
app.use('/', express.static(frontendDir));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});


