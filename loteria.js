const dialog = document.querySelector(".tile-dialog");
const form = dialog.querySelector(".tile-form");
const heading = dialog.querySelector("#dialog-title");
const field = dialog.querySelector(".clue-field");
const clue = dialog.querySelector("#clue");
const options = dialog.querySelector(".person-options");
const people = [...options.querySelectorAll("button")];
const confirm = dialog.querySelector(".confirm-tile");
const error = dialog.querySelector(".storage-error");
const tiles = [...document.querySelectorAll(".tiles button")];
const storagePrefix = "cordoba-2027:casillero:";

let activeNumber;
let selectedPerson;

function readTile(number) {
  try {
    const tile = JSON.parse(localStorage.getItem(storagePrefix + number));
    return typeof tile?.clue === "string" && tile.clue.trim() ? tile : null;
  } catch {
    return null;
  }
}

function renderTile(button, number) {
  const tile = readTile(number);
  const owner = people.find((person) => person.dataset.person === tile?.owner)?.dataset.person;
  button.dataset.owner = owner ?? "";
  button.textContent = owner?.[0] ?? number;
  const details = tile ? `: ${tile.clue}` : "";
  button.setAttribute("aria-label", `Casillero ${number}${details}${owner ? `, encontrado por ${owner}` : ""}`);
}

function renderSelection(foundBy) {
  options.dataset.selected = selectedPerson ?? "";
  for (const person of people) {
    const chosen = person.dataset.person === selectedPerson;
    person.inert = Boolean(selectedPerson) && !chosen;
    person.setAttribute("aria-pressed", String(person.dataset.person === (selectedPerson ?? foundBy)));
  }
}

function openTile(number) {
  const tile = readTile(number);
  activeNumber = number;
  selectedPerson = null;
  dialog.dataset.mode = tile ? "assign" : "create";
  heading.textContent = tile ? tile.clue : "Que hay\nque encontrar?";
  field.hidden = Boolean(tile);
  clue.value = "";
  options.hidden = !tile;
  renderSelection(tile?.owner);
  confirm.hidden = true;
  error.hidden = true;
  dialog.showModal();
}

tiles.forEach((button, index) => {
  const number = index + 1;
  renderTile(button, number);
  button.addEventListener("click", () => openTile(number));
});

clue.addEventListener("input", () => {
  confirm.hidden = !clue.value.trim();
  error.hidden = true;
});

for (const person of people) {
  person.addEventListener("click", () => {
    const tile = readTile(activeNumber);
    selectedPerson = selectedPerson === person.dataset.person ? null : person.dataset.person;
    renderSelection(tile?.owner);
    confirm.hidden = !selectedPerson;
    error.hidden = true;
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (confirm.hidden) return;

  const tile = dialog.dataset.mode === "create"
    ? { clue: clue.value.trim() }
    : { clue: heading.textContent, owner: selectedPerson };

  try {
    localStorage.setItem(storagePrefix + activeNumber, JSON.stringify(tile));
  } catch {
    error.hidden = false;
    return;
  }

  renderTile(tiles[activeNumber - 1], activeNumber);
  dialog.close();
});

dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

window.addEventListener("storage", (event) => {
  if (event.key === null || event.key.startsWith(storagePrefix)) {
    tiles.forEach((button, index) => renderTile(button, index + 1));
  }
});
