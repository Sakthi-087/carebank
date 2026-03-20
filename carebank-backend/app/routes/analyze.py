from fastapi import APIRouter

from app.models.schemas import AnalysisResponse
from app.services.coordinator import CoordinatorAgent

router = APIRouter(tags=["analysis"])
coordinator = CoordinatorAgent()


@router.get("/analyze", response_model=AnalysisResponse)
async def analyze_finances() -> AnalysisResponse:
    return await coordinator.analyze()
