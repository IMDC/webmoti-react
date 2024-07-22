import logging
import os
from typing import Dict, List

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pywebpush import WebPushException, webpush

router = APIRouter(prefix="/api")


vapid_private_key = os.getenv("VAPID_PRIVATE_KEY")
vapid_email = os.getenv("VAPID_EMAIL")

# this is stored in memory vs a db because we don't want subs to persist
subscriptions: List[Dict] = []


async def push(subscription: dict, message: str) -> None:
    try:
        webpush(
            subscription_info=subscription,
            data=message,
            vapid_private_key=vapid_private_key,
            vapid_claims={"sub": vapid_email},
        )
        logging.info(f"Web push sent for subscription: {subscription}")
    except WebPushException as e:
        logging.error(f"Web push failed for subscription {subscription}: {e}")


# this is async so it doesn't block
async def send_notification(name: str) -> None:
    if not subscriptions:
        logging.info("No subscriptions found")
        return

    for subscription in subscriptions:
        await push(subscription, f"{name} has a question!")


@router.post("/save-subscription")
async def save_subscription_endpoint(request: Request) -> JSONResponse:
    if vapid_private_key is None or vapid_email is None:
        raise HTTPException(status_code=500, detail="Missing env variable")

    subscription: dict = await request.json()
    subscriptions.append(subscription)
    # confirmation message
    await push(subscription, "Notifications successfully enabled")

    return JSONResponse(content={"message": "Subscription saved"}, status_code=200)
