from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.services.coordinator import CoordinatorAgent

router = APIRouter(tags=["chat"])
coordinator = CoordinatorAgent()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(payload: ChatRequest) -> ChatResponse:
    response = await coordinator.chat(payload.message)
    return ChatResponse(**response)
