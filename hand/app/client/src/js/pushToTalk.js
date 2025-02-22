import { Room, RoomEvent } from "livekit-client";

const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;

const pttButton = document.getElementById("talk-button");
const connectButton = document.getElementById("connect-button");
const buttonText = connectButton.querySelector("#button-text");
const connectSpinner = connectButton.querySelector(".connect-spinner");
const micOnIcon = document.getElementById("mic-on-icon");
const micOffIcon = document.getElementById("mic-off-icon");

let isConnected = false;

let token;

const room = new Room({
  // don't sub to other participants tracks
  autoSubscribe: false,
  adaptiveStream: false,
  publishDefaults: {
    audioPreset: {
      maxBitrate: 64000,
      priority: "medium",
    },
    dtx: true,
    red: true,
    stopMicTrackOnMute: true,
  },
});

async function getToken(id) {
  const response = await fetch("/api/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id }),
  });

  if (!response.ok) {
    console.error("Failed to fetch token");
    return null;
  }

  const data = await response.json();

  return data.token;
}

function checkToken() {
  if (token == null) {
    alert("Error authenticating");
    return false;
  }
  return true;
}

async function prepareConnection() {
  console.log("Preparing connection...");
  let userId = crypto.randomUUID();

  token = await getToken(userId);
  if (!checkToken()) return;

  room.prepareConnection(livekitUrl, token);

  // don't listen to track sub events (no audio playback needed)
  room.on(RoomEvent.Disconnected, handleDisconnect);
}

async function joinRoom() {
  await room.connect(livekitUrl, token);
  buttonText.textContent = "Disconnect";
  micOffIcon.classList.remove("hidden");
  console.log("Connected to classroom");
}

async function leaveRoom() {
  await room.disconnect(true);
  console.log("Left classroom");
}

function handleDisconnect() {
  console.log("Disconnected from classroom");
  pttButton.classList.add("hidden");
  micOnIcon.classList.add("hidden");
  micOffIcon.classList.add("hidden");
  buttonText.textContent = "Connect";
}

function setupPushToTalk() {
  async function toggleAudio(enable) {
    // TODO (fix this)
    // if (enable && !(await checkMic())) return;
    await room.localParticipant.setMicrophoneEnabled(enable);
    pttButton.classList.toggle("btn-active", enable);

    micOnIcon.classList.toggle("hidden", !enable);
    micOffIcon.classList.toggle("hidden", enable);
  }

  // listeners for pc and mobile
  pttButton.addEventListener("mousedown", () => toggleAudio(true));
  pttButton.addEventListener("mouseup", () => toggleAudio(false));
  pttButton.addEventListener("touchstart", () => toggleAudio(true));
  pttButton.addEventListener("touchend", () => toggleAudio(false));
}

async function requestAudioPerms() {
  const micPermission = await navigator.permissions.query({
    name: "microphone",
  });
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

  // in firefox, it says permission is granted when it's not
  if (micPermission.state !== "granted" || isFirefox) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // stop mic recorder to remove red mic icon
      stream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.error(e);
      if (e.name === "NotAllowedError") {
        alert("Microphone permission is blocked");
        return false;
      }
    }
  }

  return true;
}

async function checkMic() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const hasMic = devices.some((device) => device.kind === "audioinput");
  if (!hasMic) {
    alert("No microphone found");
    return false;
  }
  return true;
}

function setupConnectBtn() {
  async function toggleConnection() {
    if (!isConnected && !(await checkMic())) return;
    // need to get mic permission before publishing track because of livekit bug
    if (!isConnected && !(await requestAudioPerms())) return;
    if (!checkToken()) return;

    if (!isConnected) {
      // only show spinner on join since leave is very quick
      connectSpinner.classList.remove("hidden");
      await joinRoom();
      connectSpinner.classList.add("hidden");
    } else {
      await leaveRoom();
    }

    isConnected = !isConnected;
    pttButton.classList.toggle("hidden", !isConnected);
  }

  connectButton.addEventListener("click", () => toggleConnection());
}

function isFirefoxMobile() {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("firefox") && /android|iphone|ipad|ipod/.test(userAgent)
  );
}

function displayFirefoxWarning() {
  connectButton.style.display = "none";
  const warning = document.createElement("h1");
  warning.textContent =
    "Firefox for mobile isn't currently supported. Please try again using another browser.";
  warning.classList.add("center", "center-transform");
  document.body.appendChild(warning);
}

window.addEventListener("load", () => {
  if (isFirefoxMobile()) {
    // TODO fix this
    // the issue is that firefox for mobile (maybe just android) only
    // saves permissions if you press "remember this decision".
    // if the user doesn't press that, it will hang when push to
    // talk button is pressed (mic permission is needed before pressing it)
    displayFirefoxWarning();
  } else {
    setupConnectBtn();
    setupPushToTalk();
    prepareConnection();
  }
});
