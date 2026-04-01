import logging

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.auth import get_current_user
from app.core.config import get_settings
from app.models.schemas import AnalysisResponse, UserContext
from app.services.coordinator import CoordinatorAgent
from app.services.supabase import SupabaseService

router = APIRouter(tags=["analysis"])
coordinator = CoordinatorAgent()
security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)


@router.get("/analyze", response_model=AnalysisResponse)
async def analyze_finances(
    user: UserContext = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AnalysisResponse:
    service = SupabaseService(get_settings())
    transactions = await service.fetch_transactions(credentials.credentials if credentials else "")
    logger.info("Analyze route loaded transactions: count=%s user_id=%s", len(transactions), user.id)
    return await coordinator.analyze(transactions)
