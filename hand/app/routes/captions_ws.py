import logging
import time
from asyncio import Lock
from typing import Dict, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.models import CaptionActionData, CaptionData

router = APIRouter(prefix="/api")


class ConnectionManager:
    """
    Manages websocket connections and if those connections have captions on.

    Attributes:
        active_connections (dict): Websocket key to boolean value indicating if
        captions are enabled for that connection.

        is_captions_on (bool): True if captions are on for at least one client
    """

    def __init__(self) -> None:
        self.active_connections: Dict[WebSocket, bool] = {}
        self.is_captions_on = False
        self._lock = Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self.active_connections[websocket] = False
            await self._update_caption_state()

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            del self.active_connections[websocket]
            # when client disconnects, they might be the only one with captions
            # on, so need to update state
            await self._update_caption_state()

    async def send_personal_message(self, message: dict, websocket: WebSocket) -> None:
        await websocket.send_json(message)

    async def broadcast(self, message: dict) -> None:
        for connection in self.active_connections.keys():
            await connection.send_json(message)

    async def update_caption_state(self) -> Optional[bool]:
        async with self._lock:
            return await self._update_caption_state()

    async def _update_caption_state(self) -> Optional[bool]:
        """
        Changes and returns the new state of the global `is_captions_on` boolean or
        `None` if no state change. Only use this if you have the lock aquired.
        """
        old_state = self.is_captions_on
        self.is_captions_on = any(self.active_connections.values())
        if old_state != self.is_captions_on:
            return self.is_captions_on
        return None

    async def set_websocket_caption_bool(
        self, websocket: WebSocket, new_value: bool
    ) -> Optional[bool]:
        """
        Sets caption state for a websocket and updates `is_captions_on`
        """
        async with self._lock:
            self.active_connections[websocket] = new_value
            return await self._update_caption_state()


manager = ConnectionManager()


async def handle_caption(identity: str, data: dict) -> None:
    caption_data = CaptionData(**data)
    # send to all clients
    await manager.broadcast(
        {
            "type": "caption",
            # this avoids overlapping caption ids for different users
            "captionId": f"{identity}{caption_data.id}",
            "transcript": caption_data.transcript,
            "identity": identity,
            "timestamp": round(time.time() * 1000),
        }
    )


async def handle_caption_action(
    websocket: WebSocket, identity: str, data: dict
) -> None:
    caption_action_data = CaptionActionData(**data)
    logging.info(f"{caption_action_data.action} captions for {identity}")
    is_starting_captions = caption_action_data.action == "start"
    new_caption_state = await manager.set_websocket_caption_bool(
        websocket, is_starting_captions
    )

    if new_caption_state is None:
        # no state change
        return

    logging.info(f"Changed captions to: {new_caption_state}")

    # if caption state change, tell all clients to start/stop recording
    action_type = "start" if new_caption_state else "stop"
    await manager.broadcast({"type": f"{action_type}_recording"})


@router.websocket("/ws/captions")
async def captions_websocket(websocket: WebSocket, identity: str) -> None:
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data["type"]

            if msg_type == "caption":
                await handle_caption(identity, data)
            elif msg_type == "caption_action":
                await handle_caption_action(websocket, identity, data)

    except WebSocketDisconnect:
        logging.info("WebSocket client disconnected")
        await manager.disconnect(websocket)
