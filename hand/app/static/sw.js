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
  const response = await fetch(
    "https://jmn2f42hjgfv.connect.remote.it/api/save-subscription",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    }
  );

  return response.json();
};

self.addEventListener("activate", async () => {
  const sub = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      "BGtqvdLvqK_85Tf61yiByRqhf4zXEuG39BSpcoRecp2zaxXeN6wpCTxUGGsaaCtc1JZdv7Qa52JhWUlwI5fHVws"
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
