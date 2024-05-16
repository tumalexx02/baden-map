// Query DOM elements
const floors_buttons = document.querySelectorAll(".map__floor");
const placeholder = document.querySelector(".map__placeholder");
const buttonsWrapper = document.querySelector(".map__buttons-wrapper");
const popup = document.querySelector(".popup")

// Variables to manage state
let isHighlighted = false;
let isMobile = window.innerWidth < 768;
let activeFloor;
let floors = [];

// Function to load and display SVG floors
async function loadAndDisplayFloors() {
  // Load each floor's SVG and append to the placeholder
  for (let i = 1; i <= 4; i++) {
    const response = await fetch(`svg/floor${i}.svg`);
    const text = await response.text();
    const svg = document.createElement("div");
    svg.innerHTML = text;
    const actualSvg = svg.querySelector("svg");
    placeholder.appendChild(actualSvg);
    floors.push(actualSvg);
  }

  // Initialize the display with the first floor
  setActiveFloorAndHeight(1);

  // Setup event listeners for floor buttons
  floors_buttons.forEach((floorbtn, index) => floorbtn.addEventListener("click", () => {
    hidePopup();
    turnOnHover();
    isHighlighted = false;
    updateButtons(index + 1);
    setActiveFloorAndHeight(index + 1);
    removeHighlight();
  }));

  updateButtons(1)

  // Setup hover events for color-coded locations
  document.querySelectorAll('.color-loc, g').forEach(function(paths) {
    paths.addEventListener('mouseenter', function() {
      if (!isHighlighted && !isMobile) {
        // showPopup(this);

        highlightOnHover(this);
      };
    });
  
    paths.addEventListener('click', function() {
      if (!isHighlighted && !isMobile) {
        showPopup(this);
        isHighlighted = true;
        if (element.tagName === 'path') {
          highlightLocation(element.parentNode.classList[0]);
        } else {
          highlightLocation(element.classList[0]);
        }
      }
    })

    paths.addEventListener('mouseleave', function() {
      if (!isHighlighted && !isMobile) {
          removeHighlight();
      } 
    });
  });

  // Event delegation for button clicks in the buttons wrapper
  buttonsWrapper.addEventListener('click', function(event) {
    if (event.target.classList.contains('map__button')) {
      removeHighlight()

      const buttons = this.querySelectorAll('.map__button');
      buttons.forEach(button => button.classList.remove('map__button_active'));
      event.target.classList.add('map__button_active');

      highlightLocation(event.target.getAttribute('id'))
    }
  });
}

// Function to handle location highlighting
function highlightLocation(id) {
  placeholder.querySelector('svg.active').querySelectorAll("path").forEach(path => {
    path.classList.remove('highlighted');
  })
  placeholder.querySelector('svg.active').querySelectorAll("g").forEach(g => {
    // hidePopup();
    !g.classList.contains('contour') && !g.classList.contains(id) && g.classList.add('faded');
  });
  
  // Switch between hover mode and highlighted mode
  if (id.includes('all')) {
    isHighlighted = false;
    removeHighlight();
    turnOnHover();
    hidePopup();
  } else {
    isHighlighted = true;
    turnOffHover();

    placeholder.querySelector(`g.${id}`).classList.add('highlighted');

    showPopup(placeholder.querySelector(`g.${id}`));
  }
}

function highlightOnHover(element) {
  if (element.tagName === "g") {
    element.classList.add('highlighted');
    placeholder.querySelector('.active').querySelectorAll("g").forEach(g => {
      !g.classList.contains('contour') && !g.classList.contains(element.classList[0]) && g.classList.add('faded');
    })
  } else {
    element.parentNode.classList.add('highlighted');
    placeholder.querySelector('.active').querySelectorAll("g").forEach(g => {
      !g.classList.contains('contour') && !g.classList.contains(element.parentNode.classList[0]) && g.classList.add('faded');
    })
  }
}

function removeHighlight() {
  placeholder.querySelector('.active').querySelectorAll("g").forEach(g => {
    !g.classList.contains('contour') && g.classList.remove('faded');
    !g.classList.contains('contour') && g.classList.remove('highlighted');
  })
}

// Function to activate a specific floor and adjust its appearance
function setActiveFloorAndHeight(floorNum) {
  floors.forEach(node => node.classList.remove("active"));
  const activeFloor = floors[floorNum - 1];
  activeFloor.classList.add("active");
  floors_buttons.forEach(btn => btn.classList.remove("map__floor_active"));
  floors_buttons[floorNum - 1].classList.add("map__floor_active");
  updatePlaceholderHeight();
}

// Function to disable hover effects
function turnOffHover() {
  placeholder.querySelectorAll("svg").forEach(svg => svg.style.pointerEvents = 'none');
}

// Function to enable hover effects
function turnOnHover() {
  placeholder.querySelectorAll("svg").forEach(svg => svg.style.pointerEvents = 'auto');
}

// Function to update the height of the placeholder based on the active SVG
function updatePlaceholderHeight() {
  const activeSvg = document.querySelector(".active");
  if (activeSvg) {
    const height = activeSvg.getBoundingClientRect().height;
    placeholder.style.height = `${height}px`;
  }
}

// Event listener for window resize to update layout
window.addEventListener('resize', () => {
  isMobile = window.innerWidth < 768
  placeholder.querySelectorAll("path").forEach(path => path.classList.remove('highlighted'))
  updatePlaceholderHeight();
  isHighlighted = false;
  removeHighlight();
  hidePopup();
  const buttons = buttonsWrapper.querySelectorAll('.map__button');
  buttons.forEach(button => button.classList.remove('map__button_active'));
  buttons[0].classList.add('map__button_active');
});

// Initial call to load floor data and set up the UI
loadAndDisplayFloors();

// Function to update floor-specific buttons
async function updateButtons(floorNum) {
  buttonsWrapper.innerHTML = "";
  const response = await fetch(`jsons/floors/floor${floorNum}.json`);
  const json = await response.json();
  const allButton = createButton(`all-${floorNum}`, "Все");
  allButton.classList.add("map__button_active")
  buttonsWrapper.appendChild(allButton);

  for (const [key, value] of Object.entries(json)) {
    const newButton = createButton(key, value);
    value.length > 10 && newButton.classList.add("lots-of-letters");
    buttonsWrapper.appendChild(newButton);
  }
}

// Function to create a button element
function createButton(id, title) {
  const button = document.createElement('button');
  button.className = 'map__button';
  button.id = id;
  button.innerHTML = `<span>${title}</span>`;
  return button
}

// Function to show popup for the hovered element
async function showPopup(element) {
  
  let newId;
  if (element.tagName === 'path') {
    newId = element.parentNode.classList[0];
  } else {
    newId = element.classList[0];
  }
  
  if (!isThisPopup(newId)) {
    updateActiveButton(newId);
  }
  popup.id = newId

  fetch(`jsons/popups.json`)
    .then(response => response.json())
    .then(json => {
      !isThisPopup(newId) && popup.classList.add("popup_hidden");

      const innerContent = Object.entries(json[popup.id]);

      const imgElement = popup.querySelector(".popup__img img");
      const infoElement = popup.querySelector(".popup__info");

      console.log(newId.slice(0, -2))

      imgElement.setAttribute("src", newId.includes('office') || newId.includes('park') || newId.includes('apart') || newId.includes('shops') ? `img/popups/${newId.slice(0, -2)}.webp` : `img/popups/${popup.id}.webp`);

      imgElement.onload = () => {
        infoElement.innerHTML = innerContent[0][1];
        popup.classList.remove("popup_hidden");
      }
    })
    .catch((error) => {
      console.log(error)
    })
  };
  // if (element.tagName === 'path') {
  //   popup.id = element.parentNode.classList[0];
  // } else {
  //   popup.id = element.classList[0];
  // }

  // const response = await fetch(`jsons/popups.json`);
  // const json = await response.json();
  // const innerContent = Object.entries(json[popup.id]);

  // popup.querySelector(".popup__img").querySelector("img").setAttribute("src", `img/popups/${popup.id}.webp`)
  // popup.querySelector(".popup__info").innerHTML = innerContent[0][1]

  // popup.addEventListener('mouseenter', function() {
  //     highlightOnHover(element);
  // });


popup.querySelector('.popup__close').addEventListener('click', function() {
  hidePopup();
  isMobile && updatePlaceholderHeight();
});

// Function to hide any displayed popup
function hidePopup() {
  popup.classList.add('popup_hidden')
  popup.id = ""
  isHighlighted = false
  removeHighlight();
  turnOnHover();
  const buttons = buttonsWrapper.querySelectorAll('.map__button');
  buttons.forEach(button => button.classList.remove('map__button_active'));
  buttons[0].classList.add('map__button_active');
}

function isThisPopup(id) {
  return id === popup.id
}

function updateActiveButton(newId) {
  const buttons = buttonsWrapper.querySelectorAll('.map__button');
  buttons.forEach(button => button.classList.remove('map__button_active'));
  buttonsWrapper.querySelector(`#${newId}`).classList.add('map__button_active');
}