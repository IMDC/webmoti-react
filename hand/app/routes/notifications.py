import logging
from typing import Dict, List

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pywebpush import WebPushException, webpush

router = APIRouter(prefix="/api")


VAPID_PRIVATE_KEY = "j5Hx9cqP4fQ-ndfaCMDf24ahwikMob_udqHHWSY2fEU"
VAPID_PUBLIC_KEY = "BGtqvdLvqK_85Tf61yiByRqhf4zXEuG39BSpcoRecp2zaxXeN6wpCTxUGGsaaCtc1JZdv7Qa52JhWUlwI5fHVws"
VAPID_EMAIL = "mailto:webmoti2@gmail.com"

subscriptions: List[Dict] = []


def send_notification(name):
    if not subscriptions:
        logging.error("No subscriptions found")
        return

    try:
        webpush(
            subscription_info=subscriptions[0],
            data=f"{name} has a question!",
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_EMAIL},
        )
        logging.info("Message sent to push service successfully")
    except WebPushException as e:
        logging.error(f"Web push failed: {e}")


@router.post("/save-subscription")
async def raise_hand_endpoint(request: Request):
    subscription = await request.json()
    subscriptions.append(subscription)

    return JSONResponse(content={"message": "Subscription saved"}, status_code=200)


@router.get("/send-notification")
async def raise_hand_endpoint():
    send_notification("Bob")
    return JSONResponse(content={"message": "Message sent!"}, status_code=200)
