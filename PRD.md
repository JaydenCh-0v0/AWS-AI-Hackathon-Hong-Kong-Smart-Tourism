### Product Requirements Document (PRD) — Hong Kong Travel Planning Web App (N8N AI Agent)

## 1. Summary
- **Product**: Web application for Hong Kong travel planning orchestrated by an N8N AI Agent.
- **Goal**: Deliver weather-aware, preference-driven itineraries with swipe-based curation, export/share, and calendar sync.
- **Primary Metric Targets**: Itinerary generation < 10s; P95 API latency < 800ms (excl. third-party); >70% users complete plan finalization.

## 2. Problem Statement & Opportunity
- Planning HK trips is time-consuming across multiple sources (weather, POIs, food, hotels). Users lack a cohesive, adaptive planner.
- Opportunity: A single web app that leverages AI and live data to propose, refine, and finalize itineraries quickly.

## 3. Objectives & Key Results (OKRs)
- **O1**: Reduce planning time.
  - KR: 70% of users finalize within 15 minutes.
- **O2**: Improve plan relevance.
  - KR: Post-trip CSAT ≥ 4.3/5; NPS ≥ 30.
- **O3**: Operational excellence.
  - KR: P95 latency < 800ms (excl. third-party), itinerary generation < 10s.

## 4. Personas
- **Tourist**: 2–4 day stay, food/shopping/culture emphasis.
- **Business Traveler**: Tight schedules, proximity and convenience.
- **Family Traveler**: Accessibility, kid-friendly activities, shorter walks.

## 5. User Stories (Selected)
- As a user, I set budget, trip dates, and locations to generate a plan.
- As a user, I answer preference questions to tune suggestions.
- As a user, I swipe to accept/reject places, restaurants, and hotels.
- As a user, I review daily overview and adjust selections and notes.
- As a user, I export my itinerary (PDF) and add it to my calendar.
- As a user, I receive reminders and weather updates before/during trip.

## 6. Scope
- **In Scope (P1–P4)**
  - P1 Initial Input: budget/date range/start-end location; weather lookup; initial context.
  - P2 Expectation Q&A: build preference profile; generate day-by-day slots; 3 candidates per slot.
  - P3 Finalization via Swipes: Tinder-like keep/remove; AI suggestions and conflict checks.
  - P4 Overview & Export: final itinerary; edits; PDF export; share; calendar sync; feedback prompt.
- **Out of Scope (Phase 1)**
  - In-app booking/payment; offline maps; native apps; multi-user collaborative editing.

## 7. User Journey & IA
1) Inputs (budget/dates/places) → 2) Q&A cards (one-at-a-time) → 3) Itinerary with candidate stacks → 4) Swipe-based selection per slot → 5) Daily overview → 6) Export/share/calendar → 7) Notifications & post-trip feedback.

## 8. Features & Requirements
- **F1 Initial Input (Web UI)**
  - Budget slider + presets (Low < 1000 HKD, Medium 1000–5000 HKD, High > 5000 HKD).
  - Date range picker (no past dates; auto-calc nights).
  - Start/End inputs with quick buttons (Airport, Hong Kong West Kowloon Station) and autocomplete (Google Places).
  - On submit: create `plan_id`, store inputs, call HKO to fetch weather; compute outdoor/indoor weighting.
  - Validation: date range validity, location resolvable, budget bounds.
- **F2 Preferences & Itinerary Generation**
  - Single-question UI with four answer cards; back/next; progress indicator.
  - Persist answers; update preference weights in real-time.
  - Generate time slots per day:
    - Breakfast (08:00–09:00) – 3 restaurants.
    - Morning (09:00–12:00) – 3 POIs.
    - Lunch (12:00–13:30) – 3 restaurants.
    - Afternoon (13:30–15:30) – 3 POIs.
    - Evening (15:30–18:30) – 3 POIs.
    - Dinner (18:30–20:00) – 3 restaurants.
    - Night (20:00–22:00) – 3 POIs.
    - Accommodation (22:00–08:00) – 3 hotels.
  - Data sources: POIs (Google Places), Restaurants (OpenRice or alternative), Hotels (Agoda or affiliate).
  - Scoring: preference match, popularity, weather fit, distance/travel time, opening-hours feasibility, estimated cost.
  - Store candidates with images, intros, top 5 reviews, and transit info.
- **F3 Swipe Finalization**
  - Tinder-like stack per slot: left remove, right keep; flip for details.
  - Record swipe history and `selected_option_id`; auto-refill when depleted.
  - AI suggests replacements, reorders candidates, flags routing/opening-hours conflicts.
- **F4 Overview & Export**
  - Daily overview with map preview; minor edits (time notes, memos).
  - Export PDF (multilingual, QR/map/booking links); share via email/social; ICS file and/or Google Calendar events.
  - Post-trip feedback (CSAT, NPS, comments).

## 9. Data Model (Plan JSON Contract)
- Top-level: `plan_id`, `created_at`, `updated_at`, `version`, `user_profile_ref`.
- `inputs`: budget (level, min/max, currency), date_range (start, end, nights), locations (start_place, end_place).
- `context.weather`: per-day summary, precipitation probability, min/max temp, advice.
- `constraints`: `max_walk_minutes`, `dietary`, `accessibility`.
- `expectation_answers`: question/choice pairs with timestamps.
- `preference_profile`: weights (adventure, relaxation, shopping, culture, foodie) + notes.
- `itinerary`: days with `slots` and `options` (cards with images, intro, reviews, price range, opening hours, source refs, ranking scores, transit), `selected_option_id`.
- `final_selection`, `exports`, `audit`.

## 10. APIs
- POST `/plans` — create plan from inputs.
- POST `/plans/{id}/answers` — add answers.
- POST `/plans/{id}/generate` — generate/refresh itinerary.
- POST `/plans/{id}/swipe` — record swipe and selection updates.
- GET `/plans/{id}` — fetch complete plan JSON.
- POST `/plans/{id}/finalize` — freeze final selection.
- POST `/plans/{id}/export/pdf` — generate/store PDF and return link.
- POST `/plans/{id}/share` — email/social share.
- POST `/plans/{id}/calendar` — produce ICS/Google events.

## 11. UX & UI Requirements (Web)
- Mobile-first responsive layout; dark mode.
- Accessible components: keyboard navigation, ARIA labels, focus states.
- Map previews for selected options; clear slot time windows and transit hints.
- Fast image loading via CDN; lazy-loading and responsive images.

## 12. Non-Functional Requirements
- **Performance**: P95 < 800ms (excl. third-party); generation < 10s; TTI < 3s (4G) on key pages.
- **Reliability**: 99.9% availability; retries with backoff; cached fallbacks.
- **Scalability**: Horizontal scale API/N8N; CDN for media; caching.
- **Security & Privacy**: OAuth (Google/Apple), JWT sessions, rate limiting, CSP, HTTPS-only, PDPO/GDPR compliance, data export/delete.
- **Observability**: Structured logs, metrics, tracing, alerting; front-end RUM for Core Web Vitals.

## 13. Analytics
- Funnel tracking across P1–P4; swipe engagement metrics; export and calendar conversion; notification open/click.
- Post-trip survey capture (CSAT, NPS, comments) for preference tuning.

## 14. Release Plan
- **MVP (4–6 weeks)**: P1 inputs + HKO weather; P2 Q&A; itinerary generation (limited sources); P3 swipes; P4 overview; PDF export (basic), ICS generation; basic notifications.
- **Phase 2**: More sources (full OpenRice/Agoda), ranking improvements, Google Calendar integration, multilingual PDF, push notifications.
- **Phase 3**: Advanced routing optimization, budget estimator, richer accessibility filters, A/B tests.

## 15. Risks & Mitigations
- Third-party API limits/changes → caching, retries, abstractions, fallbacks.
- Data quality variance → multi-source enrichment, confidence scoring.
- Legal/compliance constraints → attribution, license checks, T&C monitoring.
- Performance regressions → load testing, budgets, CDNs, code splitting.

## 16. Dependencies
- External APIs: HKO, Google Maps, OpenRice, Agoda.
- Infra: N8N runtime, storage/CDN, email/push service, PDF renderer.
- Auth providers: Google/Apple.

## 17. Open Questions
- OpenRice/Agoda official API access timelines and quotas?
- Preferred email/push provider stack?
- Required languages for PDF export beyond ZH/EN?
- Data retention policy durations for plan JSON and media?

## 18. Acceptance Criteria (Samples)
- Creating a plan stores inputs and returns `plan_id`.
- Generating itinerary fills all slots (as defined) with 3 valid options and opening-hours feasibility.
- Swiping updates `selected_option_id` and persists history.
- Export endpoint returns a working PDF link within 30 seconds.
- Calendar endpoint returns a valid ICS file or creates Google events.
- Weather changes within 72h of start date trigger a notification.


