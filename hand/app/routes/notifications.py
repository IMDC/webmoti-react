import logging
import os
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pywebpush import WebPushException, webpush

router = APIRouter(prefix="/api")

load_dotenv()

vapid_private_key = os.getenv("VAPID_PRIVATE_KEY")
vapid_email = os.getenv("VAPID_EMAIL")

subscriptions: List[Dict] = []


def send_notification(name):
    if not subscriptions:
        logging.error("No subscriptions found")
        return

    for subscription in subscriptions:
        try:
            webpush(
                subscription_info=subscription,
                data=f"{name} has a question!",
                vapid_private_key=vapid_private_key,
                vapid_claims={"sub": vapid_email},
            )
            logging.info(f"Web push sent for subscription: {subscription}")
        except WebPushException as e:
            logging.error(f"Web push failed for subscription {subscription}: {e}")


@router.post("/save-subscription")
async def raise_hand_endpoint(request: Request):
    subscription = await request.json()
    subscriptions.append(subscription)

    return JSONResponse(content={"message": "Subscription saved"}, status_code=200)
