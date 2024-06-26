const eventSource = new EventSource("/api/queue");

const currentItems = new Map();

const addName = (name) => {
  const newItem = document.createElement("li");
  newItem.textContent = name;
  newItem.style.textDecoration = `underline ${stringToColour(name)}`;

  document.getElementById("queue").appendChild(newItem);
  // timeout needed so animation plays
  setTimeout(() => newItem.classList.add("show"), 10);
  currentItems.set(name, newItem);
};

const removeName = (name) => {
  const element = currentItems.get(name);
  if (!element) {
    return;
  }
  element.classList.remove("show");
  setTimeout(() => element.remove(), 400);
  currentItems.delete(name);
};

eventSource.onmessage = (event) => {
  const newQueue = new Set(JSON.parse(event.data));
  document.getElementById("counter").textContent = newQueue.size;

  // find added or removed items from queue update
  const additions = new Set([...newQueue].filter((x) => !currentItems.has(x)));
  const removals = new Set(
    [...currentItems.keys()].filter((x) => !newQueue.has(x))
  );

  for (const name of additions) {
    addName(name);
  }

  for (const name of removals) {
    removeName(name);
  }
};

const stringToColour = (stringInput) => {
  let stringUniqueHash = [...stringInput].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `hsl(${stringUniqueHash % 360}, 100%, 75%)`;
};
