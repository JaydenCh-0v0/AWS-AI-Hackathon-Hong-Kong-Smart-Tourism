### Project TODOs — Hong Kong Travel Planning Web App (AI Agent)

**Current Status**: Demo functional with Poe API integration ✅
**Last Updated**: January 2025

## Demo Milestone (48h)
- [x] Mock data: POIs/restaurants/hotels, images, opening hours, ratings
- [x] Minimal Plan JSON: required fields only + sample instance
- [x] Frontend: P1 form (budget/dates/places + quick buttons)
- [x] Frontend: Q&A (6 questions, 4-card UI, progress)
- [x] Frontend: Itinerary page with 8 slots (Breakfast→Night→Accommodation)
- [x] Frontend: Swipe stack per slot (left remove/right keep) + details flip
- [x] Frontend: Overview page (selected options + time windows + static map)
- [x] Backend: Mock endpoints (POST /plans, /answers, GET /plans, /export/pdf, /calendar)
- [x] AI Agent: Poe API integration for travel card generation
- [x] Export: Generate ICS download; PDF returns placeholder URL
- [x] Acceptance: Verify selection persists and overview updates

## Stage 0 — Project Setup
- [x] Initialize repo structure and tooling (Node, package manager)
- [x] Select frontend stack (Vanilla JS) and state management (local)
- [x] Bootstrap web app (routing, layout, theming, i18n ZH/EN)
- [ ] Auth scaffolding (OAuth providers config placeholders)
- [x] Backend scaffolding (REST API skeleton, env/config, error handling)
- [ ] N8N environment setup (credentials vault, environments, baseline flows)

## Stage 1 — P1 Initial Input
- [x] UI: Budget selector (presets Low/Medium/High)
- [x] UI: Date range picker (no past dates, auto nights)
- [x] UI: Start/End place inputs + quick buttons (Airport, West Kowloon)
- [ ] Places autocomplete (Google Places) and validation
- [x] API: POST /plans (create plan, return plan_id)
- [x] HKO weather integration (9-day forecast)
- [x] Persist `inputs`, `context.weather`, `audit` event

## Stage 2 — P2 Expectation Q&A & Itinerary Generation
- [x] UI: Single-question with 4 answer cards, back/next, progress
- [x] API: POST /plans/{id}/answers (persist answers)
- [x] Preference model: basic implementation
- [x] Itinerary skeleton: day/time slots (Breakfast→Night→Accommodation)
- [x] Mock integrations: POIs, restaurants, hotels with images
- [x] Basic ranking & scoring (popularity, preference_match, weather_fit)
- [x] AI-powered option generation via Poe API
- [x] Persist `itinerary[*].slots[*].options` with images, reviews, transit

## Stage 3 — P3 Swipe-Based Finalization
- [x] UI: Tinder-like card stack per slot (left remove/right keep); flip for details
- [x] API: POST /plans/{id}/swipe (record swipe, update selection)
- [x] Auto-refill candidates when depleted
- [ ] Conflict checks: routing continuity, opening-hours feasibility
- [x] AI regeneration on demand
- [x] Persist `swipe_history`, `selected_option_id`

## Stage 4 — P4 Overview, Export & Calendar
- [x] UI: Day-by-day overview with selection summary
- [x] API: POST /plans/{id}/finalize (freeze final selection)
- [ ] PDF Export service and template (multilingual, QR/map/booking links)
- [x] API: POST /plans/{id}/export/pdf (placeholder URL)
- [ ] Share: POST /plans/{id}/share (email/social)
- [x] Calendar: POST /plans/{id}/calendar (ICS file download)
- [ ] N8N Flow D: Export pipeline (generate → upload → update links)

## Stage 5 — Notifications & Post-Trip Feedback
- [ ] Notification channels (email + web push)
- [ ] Weather/opening-hours change watchers (72h window)
- [ ] Post-trip survey (CSAT, NPS, comments)
- [ ] N8N Flow E: Triggers → reminders → logging

## Stage 6 — Data Model & Storage
- [ ] Finalize Plan JSON contract and versioning
- [ ] JSON Schema for validation (Draft 2020-12)
- [ ] Document DB collection, indexing strategy (plan_id, user_id, updated_at)
- [ ] Media CDN policy (images, PDFs), responsive sizes

## Stage 7 — Integrations & Abstractions
- [x] HKO API client (9-day forecast) with fallback
- [ ] Google Maps: Places/Photos/Directions wrappers, quotas, keys rotation
- [x] Poe API integration for AI-powered recommendations
- [x] Mock restaurant/hotel providers with realistic data
- [ ] Transit estimation & carbon footprint (optional)

## Stage 8 — Security & Compliance
- [ ] OAuth (Google/Apple) + JWT sessions (access/refresh)
- [ ] Secrets management (N8N Credentials, server vault), rotation policy
- [ ] Rate limiting, circuit breakers, input/output validation
- [ ] Privacy: PDPO/GDPR (export/delete data), consent management, attribution
- [ ] CSP, HTTPS-only, CSRF protection, audit logging

## Stage 9 — Non-Functional & Observability
- [ ] Performance budgets (P95 < 800ms API excl. third-party; TTI < 3s)
- [ ] Caching strategy (HTTP, CDN, server, client hints)
- [ ] Structured logs, metrics, tracing; dashboards & alerts
- [ ] Front-end RUM (Core Web Vitals), error reporting with sourcemaps
- [ ] Load tests and failover drills

## Stage 10 — QA & Acceptance
- [ ] Test plans: unit, integration, contract, e2e (P1–P4 funnels)
- [ ] Mock external APIs for repeatable tests
- [ ] Acceptance criteria verification (PDF link < 30s, ICS validity, notifications)
- [ ] Accessibility audits (WCAG 2.1 AA)

## Stage 11 — Release & Rollout
- [ ] CI/CD pipelines, staging/prod environments, IaC
- [ ] Feature flags for risky features (ranking, push notifications)
- [ ] Rollout plan, monitoring, rollback procedures
- [ ] Post-release analytics review and backlog grooming

## Current Status Summary (Updated)

### ✅ COMPLETED
- Full demo workflow (P1 → Weather → Q&A → Itinerary → Overview)
- 8-slot itinerary system (Breakfast through Accommodation)
- Poe API integration for AI-powered travel recommendations
- Swipe-based card selection with auto-refill
- HKO weather API integration (9-day forecast)
- Multi-day planning with day tabs
- ICS calendar export
- Chat agent with AI responses
- Responsive UI with theme support

### 🔄 IN PROGRESS
- **AI Agent Enhancement**: Currently using Poe API, need to implement real Hong Kong travel card generation
- **Real Data Integration**: Replace mock data with actual POI/restaurant/hotel APIs

### 🎯 IMMEDIATE PRIORITIES
1. **Enhance AI Travel Card Generation**
   - Implement proper Hong Kong POI database
   - Add real restaurant data (OpenRice integration)
   - Include actual hotel information
   - Improve AI prompts for better recommendations

2. **Data Quality Improvements**
   - Add opening hours, pricing, contact info
   - Include real photos and reviews
   - Add location coordinates for mapping
   - Implement distance/transit calculations

3. **User Experience Polish**
   - Add Google Places autocomplete
   - Implement conflict detection
   - Add map integration
   - Improve mobile responsiveness

### 📋 NEXT SPRINT GOALS - last update 20250929
- [ ] Replace mock data with real Hong Kong attractions
- [ ] Implement Google Places API for location search
- [ ] Add OpenRice integration for restaurant data
- [ ] Create proper AI prompts for Hong Kong-specific recommendations
- [ ] Add basic map visualization
- [ ] Implement user authentication


