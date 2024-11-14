import logging
import pathlib
from contextlib import asynccontextmanager

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# load env variables before setting them in the modules below
load_dotenv()


from core.constants import PORT  # noqa: E402
from core.logger import LOGGING_CONFIG  # noqa: E402
from core.utils import setup_handlers  # noqa: E402
from routes.captions_ws import router as captions_router  # noqa: E402
from routes.notifications import router as notifications_router  # noqa: E402
from routes.push_to_talk import router as push_to_talk_router  # noqa: E402
from routes.queue_sse import router as queue_router  # noqa: E402
from routes.raisehand import router as raisehand_router  # noqa: E402
from routes.raisehand_ws import router as raisehand_ws_router  # noqa: E402
from routes.schedule import router as schedule_router  # noqa: E402
from routes.tts import router as tts_router  # noqa: E402


@asynccontextmanager
async def lifespan(_: FastAPI):
    logging.info("\n")
    logging.info("--- Starting hand server ---\n")

    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routers = (
    raisehand_router,
    queue_router,
    notifications_router,
    raisehand_ws_router,
    tts_router,
    captions_router,
    schedule_router,
    push_to_talk_router,
)

for router in routers:
    app.include_router(router)


dir_path = pathlib.Path(__file__).parent

app.mount("/static", StaticFiles(directory=(dir_path / "static")), name="static")
templates = Jinja2Templates(directory=(dir_path / "templates"))


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse(request, "index.html")


@app.get("/queue", response_class=HTMLResponse)
async def queue(request: Request):
    return templates.TemplateResponse(request, "queue.html")


@app.get("/classroom", response_class=HTMLResponse)
async def push_to_talk(request: Request):
    return templates.TemplateResponse(request, "push_to_talk.html")


if __name__ == "__main__":
    setup_handlers()
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_config=LOGGING_CONFIG)

    # uncomment below for faster dev (auto reload)
    # note: if log file is in app dir, it will cause infinite loop with reload=True
    # also uvicorn reload_dir always includes cwd so need to change it to avoid log file
    # workaround:
    # import os

    # os.chdir("hand/app")
    # uvicorn.run("__main__:app", port=PORT, log_config=LOGGING_CONFIG, reload=True)
