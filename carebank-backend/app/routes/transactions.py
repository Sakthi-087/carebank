from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.auth import get_current_user
from app.core.config import get_settings
from app.models.schemas import (
    CsvUploadResponse,
    FraudFinding,
    ManualTransactionRequest,
    ManualTransactionResponse,
    UserContext,
)
from app.services.fraud import FraudDetectionService
from app.services.supabase import SupabaseService

router = APIRouter(tags=["transactions"])
security = HTTPBearer(auto_error=False)
fraud_service = FraudDetectionService()


async def enrich_and_insert_transactions(
    *,
    service: SupabaseService,
    access_token: str,
    rows: list[dict[str, object]],
) -> tuple[int, list[FraudFinding]]:
    history = await service.fetch_transaction_history(access_token)
    fraud_summary: list[FraudFinding] = []
    enriched_rows: list[dict[str, object]] = []

    for row in rows:
        fraud_result = fraud_service.detect_fraud(history, row)
        enriched_row = {
            **row,
            "fraud_risk": fraud_result["risk"],
            "fraud_flags": fraud_result["flags"],
        }
        enriched_rows.append(enriched_row)
        history.append(enriched_row)

        if fraud_result["risk"] in {"Medium", "High"}:
            fraud_summary.append(
                FraudFinding(
                    description=str(row.get("description") or "Imported transaction"),
                    amount=round(abs(float(row.get("amount") or 0)), 2),
                    risk=fraud_result["risk"],
                    flags=[str(flag) for flag in fraud_result["flags"]],
                )
            )

    inserted_count = await service.insert_transactions(access_token, enriched_rows)
    return inserted_count, fraud_summary


@router.post("/transactions/upload-csv", response_model=CsvUploadResponse)
async def upload_transactions_csv(
    file: UploadFile = File(...),
    user: UserContext = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> CsvUploadResponse:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload a CSV file.")

    service = SupabaseService(get_settings())
    raw_bytes = await file.read()

    try:
        content = raw_bytes.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CSV file must be UTF-8 encoded.") from exc

    rows, errors = service.parse_csv_upload(content, user)
    inserted_count, fraud_summary = await enrich_and_insert_transactions(
        service=service,
        access_token=credentials.credentials,
        rows=rows,
    )

    return CsvUploadResponse(
        inserted_count=inserted_count,
        skipped_count=len(errors),
        errors=errors,
        fraud_summary=fraud_summary,
    )


@router.post("/transactions/manual", response_model=ManualTransactionResponse)
async def create_manual_transaction(
    payload: ManualTransactionRequest,
    user: UserContext = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> ManualTransactionResponse:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")

    service = SupabaseService(get_settings())
    row = service.build_manual_transaction_row(payload, user)
    inserted_count, fraud_summary = await enrich_and_insert_transactions(
        service=service,
        access_token=credentials.credentials,
        rows=[row],
    )
    return ManualTransactionResponse(inserted_count=inserted_count, fraud_summary=fraud_summary)
