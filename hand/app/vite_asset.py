import json
from pathlib import Path

VITE_ORIGIN = "http://localhost:5173"

_is_dev_mode = True


def set_asset_dev_mode(is_dev_mode):
    global _is_dev_mode
    _is_dev_mode = is_dev_mode


manifest = {}
manifest_path = Path(__file__).parent / "static/build/.vite/manifest.json"
if not _is_dev_mode:
    try:
        with open(manifest_path, "r") as manifest_file:
            manifest = json.load(manifest_file)
    except OSError as exception:
        raise OSError(
            f"Manifest file not found at {manifest_path}. Run `npm run build`."
        ) from exception


def dev_asset(file_path: str) -> str:
    return f"{VITE_ORIGIN}/{file_path}"


def prod_asset(file_path: str) -> str:
    try:
        return f"/static/assets/{manifest[file_path]['file']}"
    except KeyError:
        return ""


def asset(file_path: str) -> str:
    print(_is_dev_mode, file_path)

    if _is_dev_mode:
        # vite hmr client
        if file_path == "@vite/client":
            return f"{VITE_ORIGIN}/@vite/client"
        return dev_asset(file_path)

    # if not dev mode, vite hmr client src will be ""
    return prod_asset(file_path)
