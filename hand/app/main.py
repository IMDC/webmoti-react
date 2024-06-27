import pathlib

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from constants import PORT
from routes.notifications import router as notifications_router
from routes.queue_sse import router as queue_router
from routes.raisehand import router as raisehand_router
from utils import setup_handlers, setup_logging

app = FastAPI()

app.include_router(raisehand_router)
app.include_router(queue_router)
app.include_router(notifications_router)

dir_path = pathlib.Path(__file__).parent

app.mount("/static", StaticFiles(directory=(dir_path / "static")), name="static")
templates = Jinja2Templates(directory=(dir_path / "templates"))


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    setup_logging()
    setup_handlers()
    uvicorn.run(app, host="127.0.0.1", port=PORT)
