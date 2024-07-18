import logging
import pathlib
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from google.cloud.speech_v1 import (
    RecognitionConfig,
    SpeechAsyncClient,
    StreamingRecognitionConfig,
    StreamingRecognizeRequest,
)
from google.oauth2 import service_account

router = APIRouter(prefix="/api")

creds_path = pathlib.Path(__file__).parent / "webmoti-sa.json"
credentials = service_account.Credentials.from_service_account_file(str(creds_path))

# https://cloud.google.com/speech-to-text/docs/speech-to-text-requests#streaming-recognition


@router.websocket("/ws/stt")
async def stt_websocket(websocket: WebSocket, identity: str):
    await websocket.accept()

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

    async def request_generator():
        # first message must contain a streaming_config message and not audio_content
        yield StreamingRecognizeRequest(streaming_config=streaming_config)

        while True:
            data = await websocket.receive_bytes()

            # if not data:
            #     # TODO handle timeout (client initiated bytes?)
            #     break

            yield StreamingRecognizeRequest(audio_content=data)

    # to avoid backtracking and inaccurate responses
    STABILITY_THRESHOLD = 0.8

    caption_id = 0

    try:
        stream = await speech_client.streaming_recognize(requests=request_generator())
        async for response in stream:
            for result in response.results:

                # is_final has stability of 0.0
                if result.stability > STABILITY_THRESHOLD or result.is_final:
                    transcript = result.alternatives[0].transcript
                    # print(transcript, result.is_final, result.stability)

                    await websocket.send_json(
                        {
                            "caption_id": caption_id,
                            "transcript": transcript,
                            "identity": identity,
                            "timestamp": int(time.time()),
                        }
                    )

                    if result.is_final:
                        # caption segment is complete
                        caption_id += 1

    except WebSocketDisconnect:
        logging.info("WebSocket client disconnected")
