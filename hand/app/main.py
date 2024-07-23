import pathlib

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

load_dotenv()


from core.constants import PORT
from core.logger import LOGGING_CONFIG
from core.utils import setup_handlers
from routes.notifications import router as notifications_router
from routes.queue_sse import router as queue_router
from routes.raisehand import router as raisehand_router
from routes.raisehand_ws import router as raisehand_ws_router
from routes.stt import router as stt_router
from routes.tts import router as tts_router

app = FastAPI()

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
    stt_router,
)

for router in routers:
    app.include_router(router)


dir_path = pathlib.Path(__file__).parent

app.mount("/static", StaticFiles(directory=(dir_path / "static")), name="static")
templates = Jinja2Templates(directory=(dir_path / "templates"))


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    setup_handlers()
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_config=LOGGING_CONFIG)
