from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router
from app.routes.chat import router as chat_router

app = FastAPI(
    title="CareBank API",
    description="AI-powered financial wellness system with multi-agent analysis.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(chat_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "CareBank API is running."}
