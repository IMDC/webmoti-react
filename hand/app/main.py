import argparse
import logging
import os
import pathlib
import platform
import subprocess
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
from vite_asset import asset, set_asset_dev_mode, vite_hmr_client

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

# default is dev mode: vite hmr + uvicorn reload
APP_ENV = os.getenv("APP_ENV", "dev").lower()
IS_DEV_MODE = APP_ENV == "dev"
print(f"Dev mode: {IS_DEV_MODE}\n")
set_asset_dev_mode(IS_DEV_MODE)

# asset helper function
# this needs to be after calling set_asset_dev_mode
templates.env.globals["asset"] = asset
templates.env.globals["vite_hmr_client"] = vite_hmr_client


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse(request, "index.html")


@app.get("/queue", response_class=HTMLResponse)
async def queue(request: Request):
    return templates.TemplateResponse(request, "queue.html")


@app.get("/classroom", response_class=HTMLResponse)
async def classroom(request: Request):
    return templates.TemplateResponse(request, "classroom.html")


def run_vite(is_dev: bool = True):
    command = "dev"
    if not is_dev:
        command = "build"
    print(f"Running npm run {command}")

    kwargs = {
        "shell": True,
        "cwd": str(app_dir / "client"),
    }

    if is_dev:
        kwargs.update({"stdout": subprocess.DEVNULL, "stderr": subprocess.DEVNULL})

        # fully detach npm process
        if platform.system() == "Windows":
            kwargs.update({"creationflags": subprocess.CREATE_NEW_PROCESS_GROUP})
        else:
            kwargs.update({"start_new_session": True})

        subprocess.Popen(f"npm run {command}", **kwargs)
        print("Vite dev server will run in the background")
    else:
        subprocess.run(f"npm run {command}", **kwargs)


def run_dev():
    cwd = pathlib.Path.cwd()
    if cwd.parts[-2:] != ("hand", "app"):
        # note: if log file is in app dir, it will cause infinite loop with reload=True
        # also uvicorn reload_dir always includes cwd so need to change it to avoid log file
        # workaround is to change cwd to directory without log file inside:
        os.chdir(app_dir)
        print(f"Changed cwd to {app_dir}")

    run_vite()
    uvicorn.run(
        "__main__:app",
        port=PORT,
        log_config=LOGGING_CONFIG,
        reload=True,
        # TODO exclude vite client because of hmr (this doesn't work)
        # TODO maybe fix is to move /client outside of /app
        # reload_excludes=[str(app_dir / "client")],
    )


def run_prod(build: bool):
    if build:
        run_vite(is_dev=False)

    uvicorn.run(app, host="127.0.0.1", port=PORT, log_config=LOGGING_CONFIG)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--build",
        action="store_true",
        dest="build",
        help="Enable to run npm build. Only enable if vite project code has changed.",
    )
    parser.add_argument(
        "--build-only",
        action="store_true",
        dest="build_only",
        help="Enable to run npm build and exit.",
    )
    args = parser.parse_args()
    if args.build and args.build_only:
        parser.error("Don't use --build and --build-only together.")
    return args


def main():
    # TODO remove setup_handlers
    setup_handlers()
    args = parse_args()

    if args.build_only:
        run_vite(is_dev=False)
        return

    if IS_DEV_MODE:
        run_dev()
        return

    run_prod(args.build)


if __name__ == "__main__":
    main()
