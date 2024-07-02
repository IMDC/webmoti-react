from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from constants import Mode
from core.hand import process_hand_request, raise_hand
from models import RaiseHandRequest

router = APIRouter(prefix="/api")


@router.get("/raisehand")
async def wave_hand_endpoint():
    raise_hand(Mode.WAVE)
    return {"status": "Hand waved"}


@router.post("/raisehand")
async def raise_hand_endpoint(request: RaiseHandRequest):
    mode_enum, error = await process_hand_request(request)

    if error is not None:
        raise HTTPException(status_code=400, detail=error)

    await raise_hand(mode_enum)
    return JSONResponse(content={"message": "OK"}, status_code=200)
