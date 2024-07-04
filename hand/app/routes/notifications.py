import logging
import os
from typing import Dict, List

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pywebpush import WebPushException, webpush

router = APIRouter(prefix="/api")


vapid_private_key = os.getenv("VAPID_PRIVATE_KEY")
vapid_email = os.getenv("VAPID_EMAIL")

subscriptions: List[Dict] = []


async def push(subscription, message):
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
async def send_notification(name):
    if not subscriptions:
        logging.error("No subscriptions found")
        return

    for subscription in subscriptions:
        await push(subscription, f"{name} has a question!")


@router.post("/save-subscription")
async def raise_hand_endpoint(request: Request):
    subscription = await request.json()
    subscriptions.append(subscription)
    # confirmation message
    await push(subscription, "Notifications successfully enabled")

    return JSONResponse(content={"message": "Subscription saved"}, status_code=200)
