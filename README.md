# Credence — Government Lender Officer Dashboard

Full-stack officer-facing dashboard for the Credence street-vendor credit
scheme platform. Frontend is a fully functional React app that talks to a
real FastAPI backend, with automatic fallback to demo data if no backend is
running — so it's explorable either way.

## Structure

```
credence/
├── frontend/     React + Vite dashboard
└── backend/      FastAPI + SQLAlchemy API, JWT-protected, tested
```

## Running the backend

```
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # edit DATABASE_URL if using Postgres
python seed.py                # populates demo data
uvicorn app.main:app --reload --port 8000
```
Docs at http://localhost:8000/docs. Uses SQLite by default (zero setup);
point `DATABASE_URL` at Postgres for production.

Run tests:
```
pytest tests/ -v
```
15 tests covering auth (OTP + rate limiting), application decisions,
merchant approval, verification submission, and pagination.

## Running the frontend

```
cd frontend
npm install
npm run dev
```
Opens at http://localhost:5173. If the backend at `http://localhost:8000`
is reachable, the dashboard logs in and operates against real data. If not,
every feature still works against realistic in-memory demo data — a small
"Showing demo data" banner explains why.

Set `VITE_API_URL` in a `.env` file in `frontend/` to point at a different
backend URL (e.g. a deployed instance).

## What's implemented

**Backend**
- OTP login: real hashed, time-limited, single-use codes stored in a DB
  table, with rate limiting (3 requests / 10 min per number). No SMS
  provider is wired in — the code is returned as `demo_code` in the
  response so the flow works end-to-end without one. Swap this for
  MSG91/Twilio in `app/routers/auth.py` to go live.
- JWT auth enforced on every protected route (`Depends(get_current_officer)`).
- Role-based access control on write actions (`Depends(auth.require_role("officer"))`).
- `POST /api/verifications` — the actual tap/scan submission endpoint a
  merchant's NFC/QR reader would call, checking merchant verification
  status and category match. Intentionally not behind officer auth, since
  the caller is reader hardware, not a logged-in officer.
- Pagination (`limit`/`offset`) on applications, merchants, and
  verifications list endpoints.
- Conflict checks — can't re-decide an already-decided application, can't
  re-approve an already-verified merchant.
- Alembic migration scaffolding (`alembic/`, `alembic.ini`).
- Test suite (`tests/`) covering the above.

**Frontend**
- OTP login wired to the real backend, with local-demo fallback if it's
  unreachable.
- All list views (applications, loans, merchants, verifications) load from
  the API on login, with loading spinners and a dismissible error banner
  if a request fails.
- Every action (approve/reject application, freeze/unfreeze loan, approve
  merchant, add merchant, edit amount tiers, toggle remote-mode) writes
  through to the backend when connected, with optimistic local updates
  either way so the UI never blocks.
- Hash-based routing (`#applications`, `#merchants`, etc.) — back/forward
  and page refresh preserve the active section.
- Notifications and profile dropdowns, Escape-key closes any open
  drawer/modal/dropdown, focus-visible outlines, `aria-label`s on
  icon-only buttons.
- Responsive: sidebar collapses to icon-only under 780px width.
- CSV export (applications/analytics) and invoice download generate real
  files client-side.

## API endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/otp/request | none (rate-limited) | Send OTP, returns `demo_code` |
| POST | /api/auth/otp/verify | none | Verify OTP, returns JWT |
| GET | /api/auth/me | officer | Current officer profile |
| GET | /api/applications | officer | Paginated list, `?band=` filter |
| GET | /api/applications/{id} | officer | Get one |
| POST | /api/applications/{id}/decision | officer | Approve/reject/more-info |
| GET | /api/loans | officer | List loans |
| POST | /api/loans/{id}/toggle-freeze | officer | Freeze/unfreeze |
| GET | /api/merchants | officer | Paginated list |
| POST | /api/merchants | officer | Register merchant (pending) |
| POST | /api/merchants/{id}/approve | officer | Approve merchant |
| GET | /api/verifications | officer | Paginated list |
| POST | /api/verifications | none (reader-device auth in prod) | Submit a tap/scan event |
| GET | /api/scheme-config | officer | Get config |
| PATCH | /api/scheme-config | officer | Update tiers/categories/remote-mode |
| GET | /api/billing/invoices | officer | List invoices |

## Known remaining gaps (honest list)

- No real SMS provider — OTP code is returned in the API response, not texted.
- No refresh-token flow — JWT just expires after `ACCESS_TOKEN_EXPIRE_MINUTES`.
- Reader-device auth for `POST /api/verifications` is a placeholder (open
  endpoint) — production would need per-device API keys.
- No CI pipeline wired up for the test suite (tests exist and pass locally).
- Frontend has no automated tests yet, only the backend does.
