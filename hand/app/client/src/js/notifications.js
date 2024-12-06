const notificationBtn = document.getElementById("notification-button");

let notificationsEnabled = false;

const checkPermission = () => {
  if (!("serviceWorker" in navigator)) {
    alert("Service worker not supported");
    return false;
  }

  if (!("Notification" in window)) {
    alert("Notifications not supported");
    return false;
  }

  return true;
};

const unregisterSw = async () => {
  // remove all sw from this domain
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
};

const registerSw = async () => {
  const registration = await navigator.serviceWorker.register(
    "/static/build/sw.js"
  );
  return registration;
};

const requestNotificationPerm = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notification not granted");
    return false;
  }
  return true;
};

const enableNotifications = async () => {
  if (!checkPermission()) {
    return;
  }

  const permissionGranted = await requestNotificationPerm();
  if (!permissionGranted) {
    return;
  }

  // old sw needs to be unregistered because server doesn't save subs
  await unregisterSw();
  await registerSw();

  notificationBtn.classList.remove("gray-filter");
  notificationBtn.classList.add("blue-filter");

  notificationsEnabled = true;
};

const disableNotifications = async () => {
  if (!checkPermission()) {
    return;
  }

  await unregisterSw();

  notificationBtn.classList.remove("blue-filter");
  notificationBtn.classList.add("gray-filter");

  notificationsEnabled = false;
};

const toggleNotifications = async () => {
  if (notificationsEnabled) {
    await disableNotifications();
  } else {
    await enableNotifications();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  notificationBtn.addEventListener("click", toggleNotifications);
});
