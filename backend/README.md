# HeartHealth Backend

FastAPI service powering the Holistic Nutrition Hub: profile state, daily nutrition log, DASH-diet classification, Open Food Facts lookups, and a clinical-grade LLM advisor (Anthropic Claude).

## Run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env -> paste your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

The frontend reads `VITE_API_URL` (defaults to `http://localhost:8000`).

## Endpoints

| Method | Path                          | Purpose                                  |
|--------|-------------------------------|------------------------------------------|
| GET    | `/api/profile`                | Read full user state (profile, life-stage, biometrics, daily nutrition) |
| PUT    | `/api/profile`                | Patch any part of the state              |
| GET    | `/api/nutrition/today`        | Today's totals + meals + DASH plate fill |
| POST   | `/api/nutrition/log`          | Log a meal (manual or from a barcode)    |
| GET    | `/api/nutrition/barcode/{code}` | Look up a barcode (OFF + LLM fallback) |
| POST   | `/api/chat`                   | Multi-turn chat with the clinical advisor|
| DELETE | `/api/chat/history`           | Reset chat history                       |

## In-memory state

For hackathon speed, profile + meal log + chat history live in `state.py` as a single-user in-memory store. Restarting the server clears everything. Swap to SQLite/Postgres later by replacing `store` with a repository.
