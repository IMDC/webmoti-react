const eventSource = new EventSource("/api/queue");

eventSource.onmessage = (event) => {
  const queue = JSON.parse(event.data);

  document.getElementById("counter").textContent = queue.length;

  const headElement = document.getElementById("head");

  if (queue.length > 0) {
    const head = queue[0];
    headElement.textContent = head;
    headElement.style.textDecoration = `underline ${stringToColour(head)}`;
  } else {
    headElement.textContent = "";
  }
};

const stringToColour = (str) => {
  let hash = 0;
  str.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    // make all colours light for contrast
    const minBrightness = 75;
    value = Math.max(value, minBrightness);
    colour += value.toString(16).padStart(2, "0");
  }
  return colour;
};
