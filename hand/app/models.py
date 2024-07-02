from typing import Optional

from pydantic import BaseModel


class RaiseHandRequest(BaseModel):
    mode: str
    identity: Optional[str] = None
