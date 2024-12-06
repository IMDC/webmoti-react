const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const saveSubscription = async (subscription) => {
  const response = await fetch(import.meta.env.VITE_SAVE_SUB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  // show notification if save subscription fails
  if (!response.ok) {
    self.registration.showNotification("WebMoti", {
      body: `${response.status} error - Failed to save subscription`,
    });
  }

  return response.json();
};

self.addEventListener("activate", async () => {
  const sub = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      import.meta.env.VITE_NOTIF_APP_KEY
    ),
  });

  await saveSubscription(sub);
});

self.addEventListener("push", (e) => {
  self.registration.showNotification("WebMoti", {
    body: e.data.text(),
    // vibrate for 500ms, pause for 200ms 3 times
    vibrate: [500, 200, 500, 200, 500],
    // the tag makes new notifications replace old ones
    tag: "webmoti",
  });
});
