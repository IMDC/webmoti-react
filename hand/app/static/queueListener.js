const eventSource = new EventSource("/api/queue");

eventSource.onmessage = (event) => {
  const queue = JSON.parse(event.data);

  document.getElementById("counter").textContent = queue.length;

  const positions = [
    "head",
    "above",
    "upper-right",
    "right",
    "lower-right",
    "below",
    "lower-left",
    "left",
    "upper-left",
  ];

  for (const [idx, position] of positions.entries()) {
    const element = document.getElementById(position);

    if (queue.length > idx) {
      const name = queue[idx];
      element.textContent = name;
      element.style.textDecoration = `underline ${stringToColour(name)}`;
    } else {
      element.textContent = "";
    }
  }
};

const stringToColour = (stringInput) => {
  let stringUniqueHash = [...stringInput].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `hsl(${stringUniqueHash % 360}, 100%, 75%)`;
};
