### Software Requirements Specification (SRS) — Hong Kong Travel Planning Web Application

## 1. Introduction
- **Purpose**: Define functional and non-functional requirements for a Hong Kong travel planning web application orchestrated by an N8N AI Agent.
- **Scope**: End-to-end website-based trip planning from user inputs to AI itinerary generation, swipe-based curation, final overview, export/share, calendar sync, and post-trip feedback.
- **Definitions, Acronyms, Abbreviations**:
  - **HKO**: Hong Kong Observatory
  - **POI**: Point of Interest
  - **ICS**: iCalendar file format
  - **N8N**: Workflow automation platform
- **References**:
  - HKO DataOne APIs
  - Google Maps Places/Photos/Directions APIs
  - OpenRice developer resources (or compliant alternatives)
  - Agoda partner/affiliate APIs
- **Document Overview**: Sections cover system description, interfaces, features, data model, NFRs, security, and acceptance criteria.

## 2. Overall Description
- **Product Perspective**: Browser-based web application with N8N as orchestration layer integrating multiple third-party data sources; single-plan JSON as the contract between frontend, backend, and workflows.
- **Product Functions**:
  - Collect inputs (budget, dates, start/end places); fetch weather; build preferences; generate day-by-day time-slot itinerary with candidates; swipe-based selection; final overview; export/share; notifications; feedback.
- **User Classes and Characteristics**:
  - Tourist (food/shopping/culture), Business traveler (time-optimized), Family traveler (accessibility/kid-friendly).
- **Operating Environment**:
  - Web (modern evergreen browsers Chrome/Edge/Safari/Firefox), Responsive UI (mobile-first), Backend APIs (Node/Serverless), N8N runtime, External APIs (HKO/Google/OpenRice/Agoda), CDN for media.
- **Design and Implementation Constraints**:
  - Third-party API quotas, attribution/license compliance, PDPO/GDPR privacy, secret management, rate limiting, circuit breakers, CORS policy, browser storage limits for caching.
- **Assumptions and Dependencies**:
  - Availability of external APIs; stable internet; user OAuth providers; storage/CDN for images and PDFs.

## 3. External Interface Requirements
- **User Interfaces (Web)**:
  - Budget slider + presets (Low < 1000 HKD, Medium 1000–5000 HKD, High > 5000 HKD).
  - Date range picker (no past dates; auto-compute nights).
  - Start/End inputs with quick buttons (Airport, Hong Kong West Kowloon Station) and autocomplete via Google Places.
  - Single-question four-card UI with back/next and progress indicator.
  - Tinder-like swipe stack for candidates; card flip for details (images, menu/room, top reviews).
  - Day-by-day itinerary overview with map previews; inline edits for notes/time tweaks.
  - Export/share dialogs; calendar sync flow.
- **APIs (Backend)**:
  - **POST** `/plans` — create plan from inputs.
  - **POST** `/plans/{id}/answers` — append Q&A responses.
  - **POST** `/plans/{id}/generate` — generate/refresh itinerary.
  - **POST** `/plans/{id}/swipe` — record swipe and selection.
  - **GET** `/plans/{id}` — retrieve plan JSON.
  - **POST** `/plans/{id}/finalize` — finalize selections.
  - **POST** `/plans/{id}/export/pdf` — generate PDF.
  - **POST** `/plans/{id}/share` — email/social share.
  - **POST** `/plans/{id}/calendar` — export ICS / create Google events.
- **Hardware Interfaces**: Standard user devices (desktop, tablet, mobile). No proprietary hardware dependencies.
- **Software Interfaces**:
  - OAuth (Google/Apple), Google Maps Places/Photos/Directions, HKO forecast/nowcast, OpenRice/Agoda (or alternatives), Email service, Push notifications, Storage/CDN, PDF renderer.
- **Communications Interfaces**:
  - HTTPS REST; webhooks between N8N and backend; OAuth 2.0/OpenID Connect; SMTP/API for email; push service; HTTP/2 preferred.

## 4. System Features
- **Feature F1: Initial Input (P1)**
  - Inputs: budget level + min/max (HKD), date range (compute nights), start/end places (quick buttons + autocomplete).
  - On submit: create `plan_id`, store inputs, fetch HKO weather, derive outdoor/indoor weighting.
  - Validation: date range, locations validity, budget bounds.
- **Feature F2: Expectation Q&A (P2)**
  - Single question with four answer cards, progress/back/next.
  - Update preference weights in real time; persist answers.
  - Generate itinerary skeleton by day/time slots; fetch 3 candidates per slot (POI/restaurant/hotel); compute scores (preference match, popularity, weather fit, distance/time, opening-hours feasibility, cost).
- **Feature F3: Swipe-based Finalization (P3)**
  - Tinder-like interactions per slot: left remove, right keep; card flip shows details (images, menu/room, top 5 reviews).
  - Maintain swipe history and `selected_option_id`; auto-refill candidates; AI suggestions and conflict flags (routing, opening hours).
- **Feature F4: Overview & Export (P4)**
  - Day-by-day summary; edit notes/time tweaks; map preview.
  - Export PDF (multilingual, QR/map/booking links); share (email/social); calendar sync (ICS/Google).
  - Post-trip feedback prompt (CSAT, NPS, comments).

## 5. Non-Functional Requirements
- **Performance**:
  - P95 API latency < 800ms (excluding third-party calls); client TTI under 3s on 4G for key pages.
  - Itinerary generation < 10s for 3-day plans.
- **Reliability & Availability**:
  - 99.9% availability; retries with exponential backoff; cached fallbacks; graceful degradation for third-party outages.
- **Scalability**:
  - Horizontal scaling of API and N8N workers; CDN for media; cache hot results.
- **Security**:
  - OAuth login; JWT sessions; encrypted secrets; rate limiting; input validation; output encoding; audit logging; CSP and HTTPS-only.
- **Privacy & Compliance**:
  - PDPO/GDPR compliance; data export/delete; third-party content attribution; cookie consent.
- **Usability**:
  - Mobile-first responsive design; dark mode; intuitive swipes and clear progress feedback; perceived performance optimizations.
- **Internationalization & Accessibility**:
  - i18n (ZH/EN); ARIA labels; keyboard navigation; WCAG 2.1 AA contrast and focus management.
- **Observability**:
  - Structured logs, metrics, tracing; alerting thresholds; front-end RUM for Core Web Vitals.

## 6. Data Requirements
- **Plan JSON Contract (overview)**:
  - `plan_id`, `created_at`, `updated_at`, `version`, `user_profile_ref`.
  - `inputs` (budget/date_range/locations), `context.weather`, `constraints`.
  - `expectation_answers`, `preference_profile`.
  - `itinerary` (days → slots → options, selection, transit, scores).
  - `final_selection`, `exports`, `audit`.
- **Minimal JSON Schema Stub**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TravelPlan",
  "type": "object",
  "required": ["plan_id", "created_at", "inputs", "itinerary"],
  "properties": {
    "plan_id": {"type": "string"},
    "created_at": {"type": "string", "format": "date-time"},
    "updated_at": {"type": "string", "format": "date-time"},
    "version": {"type": "string"},
    "user_profile_ref": {
      "type": "object",
      "properties": {
        "user_id": {"type": "string"},
        "locale": {"type": "string"},
        "timezone": {"type": "string"}
      }
    },
    "inputs": {
      "type": "object",
      "required": ["budget", "date_range", "locations"],
      "properties": {
        "budget": {
          "type": "object",
          "required": ["level", "currency"],
          "properties": {
            "level": {"enum": ["low", "medium", "high"]},
            "currency": {"const": "HKD"},
            "min": {"type": "number"},
            "max": {"type": "number"}
          }
        },
        "date_range": {
          "type": "object",
          "required": ["start_date", "end_date"],
          "properties": {
            "start_date": {"type": "string", "format": "date"},
            "end_date": {"type": "string", "format": "date"},
            "nights": {"type": "integer", "minimum": 0}
          }
        },
        "locations": {
          "type": "object",
          "required": ["start_place", "end_place"],
          "properties": {
            "start_place": {"type": "string"},
            "end_place": {"type": "string"}
          }
        }
      }
    },
    "context": {"type": "object"},
    "expectation_answers": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["question_id", "selected_choice_id"],
        "properties": {
          "question_id": {"type": "string"},
          "selected_choice_id": {"type": "string"},
          "selected_at": {"type": "string", "format": "date-time"}
        }
      }
    },
    "preference_profile": {"type": "object"},
    "itinerary": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["day_index", "date", "slots"],
        "properties": {
          "day_index": {"type": "integer", "minimum": 1},
          "date": {"type": "string", "format": "date"},
          "start_anchor": {"type": "string"},
          "slots": {"type": "array"}
        }
      }
    },
    "final_selection": {"type": "object"},
    "exports": {"type": "object"},
    "audit": {
      "type": "array",
      "items": {"type": "object"}
    }
  }
}
```

## 7. System Architecture
- **Frontend (Website)**: React/Vue, state management (Redux/Pinia), map component, responsive design, i18n, service worker for caching (optional), accessibility.
- **Backend**: REST API (Node/Serverless), persistence (document DB for plan JSON), storage/CDN, auth service, PDF service.
- **Orchestration**: N8N workflows for initialization, Q&A enrichment, swipe handling, export, notifications.
- **Integrations**: HKO, Google Maps, OpenRice, Agoda, email/push, PDF service.

## 8. Security Requirements
- OAuth (Google/Apple), JWT with short-lived access + refresh tokens.
- Secrets in N8N credentials/secure vault; IP allowlists for admin endpoints.
- Input validation, output encoding, HTTPS-only, CSP; rate limits per user/IP; CSRF protection for web.
- Audit trail for key events; PII minimization and encryption at rest/in transit.

## 9. Business Rules
- Opening-hours feasibility must overlap with slot time window.
- `max_walk_minutes` enforced; route continuity from previous selection.
- Weather-based weighting: outdoor preference on sunny days; indoor on rainy days.
- Budget guidance: warn when daily/total estimates exceed user budget.

## 10. Constraints and Validation Rules
- Dates cannot be in the past; `end_date >= start_date`.
- Locations must resolve via Places API; fallbacks with manual confirmation.
- Each slot must maintain at least 1 candidate; auto-refill on depletion.
- Images must have CDN-safe URLs and alt texts; lazy-loading on web.

## 11. Quality Attributes
- **Availability**: 99.9% with graceful degradation.
- **Maintainability**: modular workflows and APIs; feature-flagged experiments.
- **Testability**: mockable data sources; contract tests for plan JSON; e2e flows; front-end integration tests.

## 12. Logging, Monitoring, and Alerts
- Structured logs with `plan_id` correlation; metrics (latency, error rates, candidate fill rates).
- Tracing across backend and N8N nodes; front-end error reporting (Sourcemaps).
- Alerts on API error spikes, third-party failures, PDF/export failures.

## 13. Internationalization & Accessibility
- ZH/EN language packs; locale-aware dates/times and numbering; right-to-left readiness not required.
- ARIA roles, keyboard focus order, contrast compliance (WCAG AA), reduced motion setting.

## 14. Deployment and Migration
- CI/CD with staged environments; infra as code; secrets managed per environment.
- Data migrations for plan JSON `version` field; backward-compatible readers.
- Browser cache invalidation strategy (HTTP caching, content hashing).

## 15. Acceptance Criteria (Samples)
- Creating a plan returns `plan_id` and persists inputs.
- Generating itinerary populates all defined slots with 3 candidates each and valid opening-hours overlap.
- Swipes update `selected_option_id` and append to `swipe_history` per slot.
- Export returns a valid downloadable PDF link within 30 seconds.
- Calendar endpoint provides a valid ICS file or successfully creates Google events.
- Weather changes within 72 hours of start date trigger a notification.

## 16. Appendices
- **A. N8N Workflows**:
  - Flow A: Inputs → HKO → init preferences → skeleton itinerary → write plan.
  - Flow B: Answers → update weights → fetch sources → score/rank → write options.
  - Flow C: Swipes → reorder/augment → conflict checks → suggestions.
  - Flow D: Export → PDF → upload → update URLs.
  - Flow E: Notifications → weather/opening-hours changes → reminders.
- **B. Data Dictionary**:
  - Keys, types, and descriptions for plan JSON fields (see schema stub).
- **C. Risks & Mitigations**:
  - API quota/changes → caching, retries, fallbacks.
  - Data quality variability → multi-source enrichment, confidence scoring.
  - Legal/compliance → attribution, T&C monitoring, content filters.


