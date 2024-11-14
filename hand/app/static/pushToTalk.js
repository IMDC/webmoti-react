let peer;
let audioTrack;

async function initializeConnection() {
  // get local audio stream
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioTrack = stream.getAudioTracks()[0];
  // start with audio disabled
  audioTrack.enabled = false;

  // start connection with stream
  peer = new SimplePeer({
    initiator: true,
    trickle: false,
    stream: stream,
  });

  peer.on("signal", async (data) => {
    if (data.type === "offer") {
      const response = await fetch("/api/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const answer = await response.json();
      peer.signal(answer);
    }
  });
}

function setupPushToTalk(buttonId) {
  const button = document.getElementById(buttonId);

  function toggleAudio(enable) {
    if (audioTrack) audioTrack.enabled = enable;
    button.classList.toggle("btn-active", enable);
  }

  button.addEventListener("mousedown", () => toggleAudio(true));
  button.addEventListener("mouseup", () => toggleAudio(false));

  // mobile devices
  button.addEventListener("touchstart", () => toggleAudio(true));
  button.addEventListener("touchend", () => toggleAudio(false));
}

window.addEventListener("load", () => {
  initializeConnection();
  setupPushToTalk("talkButton");
});
