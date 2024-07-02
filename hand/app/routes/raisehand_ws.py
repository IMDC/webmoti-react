import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.hand import process_hand_request, raise_hand
from models import RaiseHandRequest

router = APIRouter(prefix="/api")


@router.websocket("/ws/raisehand")
async def raise_hand_websocket(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            json_data = await websocket.receive_text()
            try:
                request = RaiseHandRequest.model_validate_json(json_data)
            except ValueError as e:
                await websocket.send_json({"error": str(e), "status": "error"})
                continue

            mode_enum, error = await process_hand_request(request)
            if error is not None:
                await websocket.send_json({"error": error, "status": "error"})
                continue

            await raise_hand(mode_enum)
            await websocket.send_json({"message": "OK", "status": "success"})

    except WebSocketDisconnect:
        logging.info("Client disconnected")
