# CareBank — AI-Powered Financial Wellness System

CareBank is a production-style proof of concept that combines a FastAPI backend, a React + Vite frontend, and a lightweight multi-agent AI orchestration layer for financial wellness insights.

## Features

- Transaction analysis from JSON sample data
- Multi-agent backend for spending, health scoring, alerts, and recommendations
- Coordinator agent that aggregates outputs into a unified response
- Generative AI layer using OpenRouter or OpenAI-compatible chat completions with a graceful fallback
- Fintech-inspired responsive dashboard with charts and chat assistant

## Project structure

- `carebank-backend/` — FastAPI API and agent services
- `carebank-frontend/` — React dashboard and chat UI

## Run the backend

```bash
cd carebank-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`.

### Optional AI configuration

Set either OpenRouter or OpenAI-compatible environment variables before starting the backend:

```bash
export OPENROUTER_API_KEY=your_key_here
export LLM_PROVIDER=openrouter
export LLM_BASE_URL=https://openrouter.ai/api/v1
export LLM_MODEL=openai/gpt-4o-mini
```

If no API key is provided, CareBank automatically returns a deterministic fallback explanation and chat response.

## Run the frontend

```bash
cd carebank-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and calls the backend at `http://localhost:8000` by default.

To override the API URL:

```bash
echo 'VITE_API_URL=http://localhost:8000' > .env
```

## API endpoints

### `GET /analyze`
Returns:

- `spending`
- `financial_health`
- `alerts`
- `recommendations`
- `ai_explanation`

### `POST /chat`
Accepts:

```json
{
  "message": "Why did I spend more this month?"
}
```

Returns a contextual assistant response grounded in the same financial analysis.
