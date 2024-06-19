import pathlib

import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from routes.raisehand import router as raisehand_router
from utils import setup_gpio, setup_handlers, setup_logging

# dev:
# cd '..\Hand functions\app\'
# fastapi dev main.py
app = FastAPI()
app.include_router(raisehand_router)


static_path = pathlib.Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=static_path), name="static")


@app.get("/", response_class=FileResponse)
async def root():
    return FileResponse(static_path / "index.html")


if __name__ == "__main__":
    # setup_gpio()
    # setup_logging()
    setup_handlers()

    uvicorn.run(app, host="127.0.0.1", port=8000)
