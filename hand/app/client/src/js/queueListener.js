const eventSource = new EventSource("/api/queue");

const currentItems = new Map();

const queue = document.getElementById("queue");
const counter = document.getElementById("counter");
const spinner = document.getElementById("spinner");

// in ms
const animationTime = 400;

let timeoutId;

const updateQueueStyles = () => {
  // this keeps all styles in queue updated when an item is added/removed
  let index = 0;
  currentItems.forEach((element, name) => {
    element.className = "";
    // queue-3 and show-3 are the lowest ones
    const styleNumber = Math.min(index, 3);
    element.classList.add("queue-" + styleNumber, "show-" + styleNumber);

    if (index === 0) {
      element.style.color = stringToColour(name);
    }
    index++;
  });
};

const addName = (name) => {
  const newItem = document.createElement("li");
  newItem.textContent = name;

  queue.appendChild(newItem);
  currentItems.set(name, newItem);

  // timeout needed so animation plays
  setTimeout(() => {
    updateQueueStyles();
    // prevent font-size animation when item added
    newItem.classList.add("transition-no-size");

    setTimeout(() => {
      newItem.classList.remove("transition-no-size");
      newItem.style.transition = "all 0.4s ease-out";
    }, animationTime);
  }, 10);
};

const removeName = (name) => {
  const element = currentItems.get(name);
  if (!element) {
    return;
  }

  // hide current item
  const position = Array.from(currentItems.keys()).indexOf(name);
  element.classList.remove(`show-${position}`);

  // keep other items updated
  currentItems.delete(name);
  updateQueueStyles();

  // remove from page when animation finishes
  setTimeout(() => element.remove(), animationTime);
};

eventSource.onmessage = (event) => {
  const newQueue = new Set(JSON.parse(event.data));
  counter.textContent = newQueue.size;

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

eventSource.onopen = () => {
  // hide spinner when connected
  spinner.style.display = "none";
  queue.style.display = "block";
  counter.style.display = "block";
  // notificationBtn is used in notifications.js
  document.getElementById("notification-button").style.display = "block";
};

eventSource.onerror = () => {
  // show spinner and hide other elements
  spinner.style.display = "block";
  queue.style.display = "none";
  counter.style.display = "none";
  document.getElementById("notification-button").style.display = "none";
};

const stringToColour = (stringInput) => {
  let stringUniqueHash = [...stringInput].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `hsl(${stringUniqueHash % 360}, 100%, 75%)`;
};

const handleScroll = () => {
  clearTimeout(timeoutId);

  // scroll to the top after 2 min
  timeoutId = setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, 120000);
};

window.addEventListener("scroll", handleScroll);
