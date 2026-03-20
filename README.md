# CareBank — AI-Powered Financial Wellness System

CareBank is a clean full-stack proof of concept that demonstrates agentic AI for financial analysis and a generative AI layer for natural-language explanations.

## Stack

- **Backend:** Python, FastAPI
- **Frontend:** React (Vite), Tailwind CSS, Recharts
- **AI:** OpenRouter or OpenAI-compatible API with a deterministic fallback mode

## Features

- Multi-agent backend: spending, health, alerts, advisory, coordinator
- `GET /analyze` endpoint aligned with the dashboard UI
- `POST /chat` endpoint for contextual financial Q&A
- Fintech dark-light hybrid dashboard with KPI cards, chart, alerts, recommendations, explanation, and chat
- INR-oriented demo data across two months to support trend detection

## Backend structure

```text
carebank-backend/
  app/
    main.py
    routes/
      analyze.py
      chat.py
    services/
      coordinator.py
      spending.py
      health.py
      alerts.py
      advisory.py
      llm.py
    models/
      schemas.py
  data/
    transactions.json
```

## Run the backend

```bash
cd carebank-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

### Optional LLM configuration

```bash
export OPENROUTER_API_KEY=your_key_here
export LLM_PROVIDER=openrouter
export LLM_BASE_URL=https://openrouter.ai/api/v1
export LLM_MODEL=openai/gpt-4o-mini
```

If no API key is configured, the app uses built-in fallback explanations and chat responses.

## Run the frontend

```bash
cd carebank-frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173`.

To point the frontend at a different API:

```bash
echo 'VITE_API_URL=http://localhost:8000' > .env
```

## API example

### `GET /analyze`

```json
{
  "financial_health": {
    "score": 89,
    "status": "Good",
    "risk_indicator": "Low"
  },
  "spending": {
    "Food": 4150,
    "Shopping": 2500,
    "Travel": 1220,
    "Bills": 3900,
    "total": 11770,
    "change_vs_last_month": 18.29,
    "largest_category": "Food"
  },
  "alerts": [
    "Shopping spending increased by 14% versus last month",
    "Food category is nearing your recommended monthly budget limit"
  ],
  "recommendations": [
    "Reduce shopping budget by ₹2000 and batch non-essential purchases weekly",
    "Set food budget cap at ₹3000/month and track dining separately from groceries"
  ],
  "ai_explanation": "Your financial health is GOOD (Score: 89)..."
}
```

### `POST /chat`

```json
{
  "message": "Why did I spend more this month?"
}
```
