### Project TODOs — Hong Kong Travel Planning Web App (N8N AI Agent)

## Demo Milestone (48h)
- [ ] Mock data: POIs/restaurants/hotels, images, opening hours, ratings
- [ ] Minimal Plan JSON: required fields only + sample instance
- [ ] Frontend: P1 form (budget/dates/places + quick buttons)
- [ ] Frontend: Q&A (3 questions, 4-card UI, progress)
- [ ] Frontend: Itinerary page with 3 slots (Morning/Lunch/Afternoon)
- [ ] Frontend: Swipe stack per slot (left remove/right keep) + details flip
- [ ] Frontend: Overview page (selected options + time windows + static map)
- [ ] Backend: Mock endpoints (POST /plans, /answers, GET /plans, /export/pdf, /calendar)
- [ ] N8N: Flow A/B/D with mock nodes (weather, candidates, export link)
- [ ] Export: Generate ICS download; PDF returns placeholder URL
- [ ] Acceptance: Verify selection persists and overview updates

## Stage 0 — Project Setup
- [ ] Initialize repo structure and tooling (Node, package manager, lint, prettier)
- [ ] Select frontend stack (React/Vue) and state management (Redux/Pinia)
- [ ] Bootstrap web app (routing, layout, theming, i18n ZH/EN)
- [ ] Auth scaffolding (OAuth providers config placeholders)
- [ ] Backend scaffolding (REST API skeleton, env/config, error handling)
- [ ] N8N environment setup (credentials vault, environments, baseline flows)

## Stage 1 — P1 Initial Input
- [ ] UI: Budget selector (slider + presets Low/Medium/High)
- [ ] UI: Date range picker (no past dates, auto nights)
- [ ] UI: Start/End place inputs + quick buttons (Airport, West Kowloon)
- [ ] Places autocomplete (Google Places) and validation
- [ ] API: POST /plans (create plan, return plan_id)
- [ ] N8N Flow A: Inputs → HKO weather → init preferences → skeleton → write plan
- [ ] Persist `inputs`, `context.weather`, `audit` event

## Stage 2 — P2 Expectation Q&A & Itinerary Generation
- [ ] UI: Single-question with 4 answer cards, back/next, progress
- [ ] API: POST /plans/{id}/answers (persist answers)
- [ ] Preference model: update weights in real time
- [ ] Itinerary skeleton: day/time slots (Breakfast→Night→Accommodation)
- [ ] Integrations: Google Places (POIs), OpenRice (restaurants), Agoda (hotels) abstractions
- [ ] Ranking & scoring (prefs, popularity, weather fit, distance/time, opening-hours, cost)
- [ ] N8N Flow B: Answers → fetch sources → score/rank → write options
- [ ] Persist `itinerary[*].slots[*].options` with images, reviews, transit

## Stage 3 — P3 Swipe-Based Finalization
- [ ] UI: Tinder-like card stack per slot (left remove/right keep); flip for details
- [ ] API: POST /plans/{id}/swipe (record swipe, update selection)
- [ ] Auto-refill candidates when depleted
- [ ] Conflict checks: routing continuity, opening-hours feasibility
- [ ] N8N Flow C: Swipes → reorder/augment → conflict checks → suggestions
- [ ] Persist `swipe_history`, `selected_option_id`

## Stage 4 — P4 Overview, Export & Calendar
- [ ] UI: Day-by-day overview, map previews, notes/time tweaks
- [ ] API: POST /plans/{id}/finalize (freeze final selection)
- [ ] PDF Export service and template (multilingual, QR/map/booking links)
- [ ] API: POST /plans/{id}/export/pdf (generate & return URL)
- [ ] Share: POST /plans/{id}/share (email/social)
- [ ] Calendar: POST /plans/{id}/calendar (ICS file, Google Calendar events)
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
- [ ] HKO API client (forecast/nowcast) with caching and retries
- [ ] Google Maps: Places/Photos/Directions wrappers, quotas, keys rotation
- [ ] Restaurant provider abstraction (OpenRice or fallback aggregator)
- [ ] Hotel provider abstraction (Agoda or affiliate)
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


