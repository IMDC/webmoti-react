import logging
import pathlib
import time
from asyncio import CancelledError
from typing import AsyncGenerator, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from google.api_core.exceptions import OutOfRange
from google.cloud.speech_v1 import (
    RecognitionConfig,
    SpeechAsyncClient,
    StreamingRecognitionConfig,
    StreamingRecognizeRequest,
)
from google.oauth2 import service_account

router = APIRouter(prefix="/api")

creds_path = pathlib.Path(__file__).parents[1] / "webmoti-sa.json"
credentials = service_account.Credentials.from_service_account_file(str(creds_path))

START_MSG = b"STARTSPEECH"
STOP_MSG = b"STOPSPEECH"
PAUSE_MSG = b"PAUSESPEECH"

# to avoid backtracking and inaccurate responses
STABILITY_THRESHOLD = 0.8


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket) -> None:
        await websocket.send_json(message)

    async def broadcast(self, message: dict) -> None:
        for connection in self.active_connections:
            await connection.send_json(message)


manager = ConnectionManager()


async def run_stt(websocket: WebSocket, identity: str) -> None:
    # client needs to be defined here so in same event loop?
    speech_client = SpeechAsyncClient(credentials=credentials)

    streaming_config = StreamingRecognitionConfig(
        config=RecognitionConfig(
            encoding=RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=16000,
            language_code="en-US",
            enable_automatic_punctuation=True,
        ),
        interim_results=True,
    )

    async def request_generator() -> AsyncGenerator[StreamingRecognizeRequest, None]:
        # first message must contain a streaming_config message and not audio_content
        yield StreamingRecognizeRequest(streaming_config=streaming_config)

        # is_paused = False

        while True:
            data = await websocket.receive_bytes()

            # TODO if len(data) == 60, send "0"
            # OR if == 0, send "0"

            if data == STOP_MSG:
                logging.info("Stopping speech to text...")
                break
            # elif data == START_MSG:
            #     is_paused = False
            # elif data == PAUSE_MSG:
            #     is_paused = True

            # if is_paused:
            #     logging.info("Pausing speech to text")
            #     # send dummy data to keep connection alive
            #     # (if data is empty for 10 seconds it will timeout)
            #     data = b"0"
            #     # slow down stream
            #     await asyncio.sleep(0.5)

            yield StreamingRecognizeRequest(audio_content=data)

    caption_id = 0
    is_first_result = True

    # https://cloud.google.com/speech-to-text/docs/speech-to-text-requests#streaming-recognition

    stream = await speech_client.streaming_recognize(requests=request_generator())

    try:
        async for response in stream:
            if not response.results:
                continue

            # The `results` list is consecutive. For streaming, we only care about
            # the first result being considered, since once it's `is_final`, it
            # moves on to considering the next utterance.
            result = response.results[0]
            if not result.alternatives:
                continue

            # is_final has stability of 0.0
            # also always use first result to minimize delay
            if not (
                result.stability > STABILITY_THRESHOLD
                or result.is_final
                or is_first_result
            ):
                continue

            transcript = result.alternatives[0].transcript

            # sometimes transcript is empty
            if not transcript:
                continue

            await manager.broadcast(
                {
                    "type": "caption",
                    # this avoids overlapping caption ids for different users
                    "captionId": f"{identity}{caption_id}",
                    "transcript": transcript,
                    "identity": identity,
                    "timestamp": round(time.time() * 1000),
                }
            )

            if is_first_result:
                is_first_result = False

            if result.is_final:
                # caption segment is complete
                caption_id += 1
                is_first_result = True
    except CancelledError:
        # websocket disconnected
        raise WebSocketDisconnect()


@router.websocket("/ws/stt")
async def stt_websocket(websocket: WebSocket, identity: str) -> None:
    await manager.connect(websocket)

    try:
        auto_restart = False

        while True:
            logging.info("Waiting to start speech to text")

            while True:
                if auto_restart:
                    auto_restart = False
                    break

                # wait until START_MSG before starting stt
                data = await websocket.receive_bytes()
                if data == START_MSG:
                    logging.info("Starting speech to text")
                    await manager.broadcast({"type": "start"})
                    break

            try:
                await run_stt(websocket, identity)
            except WebSocketDisconnect:
                raise
            except OutOfRange:
                # exceeded maximum allowed stream duration of 305 seconds
                auto_restart = True
            except Exception:
                await manager.send_personal_message(
                    message={
                        "type": "error",
                        "message": "Speech to text stopped because of error",
                    },
                    websocket=websocket,
                )
                logging.exception("Speech to text error")
    except WebSocketDisconnect:
        logging.info("WebSocket client disconnected")
        manager.disconnect(websocket)
