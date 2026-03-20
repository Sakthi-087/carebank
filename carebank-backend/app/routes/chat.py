from fastapi import APIRouter

from app.models.schemas import ChatRequest, ChatResponse
from app.services.coordinator import CoordinatorAgent

router = APIRouter(prefix="/chat", tags=["chat"])
coordinator = CoordinatorAgent()


@router.post("", response_model=ChatResponse)
async def chat_with_assistant(payload: ChatRequest) -> ChatResponse:
    response = await coordinator.chat(payload.message)
    return ChatResponse(**response)
