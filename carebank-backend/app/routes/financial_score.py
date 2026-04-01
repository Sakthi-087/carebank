import logging

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.auth import get_current_user
from app.core.config import get_settings
from app.models.schemas import FinancialScoreResponse, UserContext
from app.services.scoring import FinancialScoringEngine
from app.services.supabase import SupabaseService

router = APIRouter(tags=["score"])
security = HTTPBearer(auto_error=False)
scoring_engine = FinancialScoringEngine()
logger = logging.getLogger(__name__)


@router.get("/financial-score", response_model=FinancialScoreResponse)
async def get_financial_score(
    user: UserContext = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> FinancialScoreResponse:
    service = SupabaseService(get_settings())
    transactions = await service.fetch_transactions(credentials.credentials if credentials else "")
    logger.info("Financial-score route loaded transactions: count=%s user_id=%s", len(transactions), user.id)
    return scoring_engine.calculate(transactions)
