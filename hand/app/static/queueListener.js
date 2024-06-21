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

const stringToColour = (stringInput) => {
  let stringUniqueHash = [...stringInput].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `hsl(${stringUniqueHash % 360}, 100%, 75%)`;
};
