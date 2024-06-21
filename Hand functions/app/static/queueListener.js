const eventSource = new EventSource("/api/queue");

eventSource.onmessage = function (event) {
  const queue = JSON.parse(event.data);

  document.getElementById("counter").textContent = queue.length;

  if (queue.length > 0) {
    document.getElementById("head").textContent = queue[0];
  } else {
    document.getElementById("head").textContent = "";
  }
};
