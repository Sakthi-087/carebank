from fastapi import APIRouter

from app.models.schemas import AnalysisResponse
from app.services.coordinator import CoordinatorAgent

router = APIRouter(prefix="/analyze", tags=["analysis"])
coordinator = CoordinatorAgent()


@router.get("", response_model=AnalysisResponse)
async def analyze_finances() -> AnalysisResponse:
    return await coordinator.analyze()
