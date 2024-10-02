const floors_buttons = document.querySelectorAll(".map__floor");
const placeholder = document.querySelector(".map__placeholder");
const buttonsWrapper = document.querySelector(".map__buttons-wrapper");

let isHighlighted = false;
let isMobile = window.innerWidth < 768;
let activeFloor;
let floors = [];
let colorlocs = [];
let labels = [];

async function loadAndDisplayFloors() {
  for (let i = 0; i <= 4; i++) {
    const response = await fetch(`svg/floor${i}.svg`);
    const text = await response.text();
    const svg = document.createElement("div");
    svg.innerHTML = text;
    const actualSvg = svg.querySelector("svg");
    placeholder.appendChild(actualSvg);
    floors.push(actualSvg);
  }

  setActiveFloorAndHeight(1);

  floors_buttons.forEach((floorbtn, index) =>
    floorbtn.addEventListener("click", () => {
      isHighlighted = false;
      setActiveFloorAndHeight(index + 1);
    }),
  );

  colorlocs.forEach((cl) => {
    cl.addEventListener("mouseenter", function () {
      if (!isMobile) {
        highlightLocation(cl);
      }
    });

    cl.addEventListener("mouseleave", function () {
      if (!isMobile) {
        removeHighlight(cl);
      }
    });
  });
}

function highlightLocation(cl) {
  const id = cl.id;
  const label = labels.querySelector(`#${id}-label`);
  label.classList.add("active");
}

function removeHighlight(cl) {
  const id = cl.id;
  const label = labels.querySelector(`#${id}-label`);
  label.classList.remove("active");
}

function setActiveFloorAndHeight(floorNum) {
  floors.forEach((node) => node.classList.remove("active"));
  activeFloor = floors[floorNum - 1];
  activeFloor.classList.add("active");
  labels = activeFloor.querySelector("#labels");
  colorlocs = document.querySelectorAll(".colorloc");
  floors_buttons.forEach((btn) => btn.classList.remove("map__floor_active"));
  floors_buttons[floorNum - 1].classList.add("map__floor_active");
}

function updatePlaceholderHeight() {
  const activeSvg = document.querySelector(".active");
  if (activeSvg) {
    const height = activeSvg.getBoundingClientRect().height;
    placeholder.style.height = `${height}px`;
  }
}

window.addEventListener("resize", () => {
  isMobile = window.innerWidth < 768;
  placeholder
    .querySelectorAll("path")
    .forEach((path) => path.classList.remove("highlighted"));
  isHighlighted = false;
  removeHighlight();
  hidePopup();
  const buttons = buttonsWrapper.querySelectorAll(".map__button");
  buttons.forEach((button) => button.classList.remove("map__button_active"));
  buttons[0].classList.add("map__button_active");
});

document.addEventListener("DOMContentLoaded", () => {

})

loadAndDisplayFloors().then(() => {
  const aparts = document.querySelectorAll('.apartments-colorloc');
  aparts.forEach(a => a.addEventListener('click', () => {
    window.location.assign('https://badenlandapart.ru/estate/apartamenty/')
  }))
});
