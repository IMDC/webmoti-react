const checkPermission = () => {
  if (!("serviceWorker" in navigator)) {
    alert("Service worker not supported");
  }

  if (!("Notification" in window)) {
    alert("Notifications not supported");
  }
};

const registerSw = async () => {
  const registration = await navigator.serviceWorker.register("/static/sw.js");
  return registration;
};

const requestNotificationPerm = async () => {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    alert("Notification not granted");
  }
};

const main = async () => {
  checkPermission();
  requestNotificationPerm();
  await registerSw();
};
