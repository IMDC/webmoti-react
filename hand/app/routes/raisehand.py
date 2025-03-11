from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from core.hand import process_hand_request
from core.models import RaiseHandRequest

router = APIRouter(prefix="/api")


@router.post("/raisehand")
async def raise_hand_endpoint(request: RaiseHandRequest) -> JSONResponse:
    error = await process_hand_request(request)
    if error is not None:
        raise HTTPException(status_code=400, detail=error)

    return JSONResponse(content={"message": "OK"}, status_code=200)
