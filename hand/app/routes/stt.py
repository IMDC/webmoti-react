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

            # TODO if len(data) == 60, send "0"
            # OR if == 0, send "0"

            if data == b"ENDCONN":
                logging.info("Close connection message received")
                break

            yield StreamingRecognizeRequest(audio_content=data)

    # to avoid backtracking and inaccurate responses
    STABILITY_THRESHOLD = 0.8

    caption_id = 0
    is_first_result = True

    # api reference: https://goo.gl/tjCPAU

    try:
        stream = await speech_client.streaming_recognize(requests=request_generator())
        async for response in stream:
            if not response.results:
                continue

            # TODO
            # The `results` list is consecutive. For streaming, we only care about
            # the first result being considered, since once it's `is_final`, it
            # moves on to considering the next utterance.
            # result = response.results[0]
            # if not result.alternatives:
            #     continue

            for result in response.results:

                # is_final has stability of 0.0
                # also always use first result to minimize delay
                if (
                    result.stability > STABILITY_THRESHOLD
                    or result.is_final
                    or is_first_result
                ):
                    transcript = result.alternatives[0].transcript
                    # print(transcript, result.is_final, result.stability)

                    await websocket.send_json(
                        {
                            "captionId": caption_id,
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

    except WebSocketDisconnect:
        logging.info("WebSocket client disconnected")
