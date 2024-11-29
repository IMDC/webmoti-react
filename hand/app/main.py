import argparse
import logging
import os
import pathlib
import subprocess
import threading
from contextlib import asynccontextmanager

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from core.constants import PORT
from core.logger import LOGGING_CONFIG
from core.utils import setup_handlers
from vite_asset import asset, set_asset_dev_mode

# load env variables before setting them in the modules below
load_dotenv()

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


app_dir = pathlib.Path(__file__).parent

app.mount("/static", StaticFiles(directory=(app_dir / "static")), name="static")
templates = Jinja2Templates(directory=(app_dir / "templates"))

# asset helper function
templates.env.globals["asset"] = asset


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse(request, "index.html")


@app.get("/queue", response_class=HTMLResponse)
async def queue(request: Request):
    return templates.TemplateResponse(request, "queue.html")


@app.get("/classroom", response_class=HTMLResponse)
async def push_to_talk(request: Request):
    return templates.TemplateResponse(request, "push_to_talk.html")


def run_vite(command: str):
    print("[vite] Starting Vite server...")
    subprocess.Popen(
        f"npm run {command}",
        shell=True,
        cwd=str(app_dir / "client"),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        # fully detach on windows
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
    )
    print("[vite] Vite server started.")


def run_dev():
    cwd = pathlib.Path.cwd()
    if cwd.parts[-2:] != ("hand", "app"):
        # note: if log file is in app dir, it will cause infinite loop with reload=True
        # also uvicorn reload_dir always includes cwd so need to change it to avoid log file
        # workaround is to change cwd to directory without log file inside:
        os.chdir(app_dir)
        print(f"Changed cwd to {app_dir}")

    set_asset_dev_mode(True)

    # TODO exclude vite from reload
    run_vite("dev")
    uvicorn.run("__main__:app", port=PORT, log_config=LOGGING_CONFIG, reload=True)


def run_prod():
    run_vite("build")
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_config=LOGGING_CONFIG)


def parse_args():
    parser = argparse.ArgumentParser(description="Set production mode.")
    parser.add_argument(
        "--prod",
        action="store_true",
        dest="prod",
        help="Enable production mode to build. Disable for code reloading.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    # TODO remove setup_handlers
    setup_handlers()
    args = parse_args()

    # dev mode: vite hmr + uvicorn reload
    DEV_MODE = not args.prod
    print(f"Dev mode: {DEV_MODE}\n")
    if DEV_MODE:
        run_dev()
    else:
        run_prod()
