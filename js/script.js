// Query DOM elements
const floors_buttons = document.querySelectorAll(".map__floor");
const placeholder = document.querySelector(".map__placeholder");
const buttonsWrapper = document.querySelector(".map__buttons-wrapper");

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

  // Setup hover events for color-coded locations
  document.querySelectorAll('.color-loc, g').forEach(function(paths) {
    paths.addEventListener('mouseenter', function() {
      if (!isHighlighted && !isMobile) {
        showPopup(this);

        highlightOnHover(this);
      };
    });
  
    paths.addEventListener('mouseleave', function(e) {
      const popup = placeholder.querySelector('.popup');
      if (!isHighlighted && !isMobile) {
        if ((!popup || !popup.contains(e.relatedTarget))) {
          hidePopup();
          removeHighlight();
        } else {
          popup.addEventListener('mouseleave', function() {
            hidePopup();
            removeHighlight();
          });
        }
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
    hidePopup(g);
    !g.classList.contains('contour') && !g.classList.contains(id) && g.classList.add('faded');
  });
  
  // Switch between hover mode and highlighted mode
  if (id.includes('all')) {
    isHighlighted = false;
    removeHighlight();
    turnOnHover();
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
    value.length > 12 && newButton.classList.add("lots-of-letters");
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
  const popup = document.createElement('div');
  popup.className = 'popup';
  if (element.tagName === 'path') {
    popup.id = element.parentNode.classList[0];
  } else {
    popup.id = element.classList[0];
  }
  placeholder.appendChild(popup);

  const response = await fetch(`jsons/popups.json`);
  const json = await response.json();
  const innerContent = Object.entries(json[popup.id]);

  const inside = `
    <div class="popup__info">
      ${innerContent[0][1]}
    </div>
    <div class="popup__img">
      <button class="popup__close">×</button>
      <img src="${innerContent[1][1]}" alt="${popup.id}-img">
    </div>
  `;

  popup.style.display = 'flex';
  // const inside = await `
  // <div class="popup__info">
  //     <div class="popup__p">
  //       <span>Бассейн:</span> 20 метров.
  //     </div>
  //     <br>
  //     <div class="popup__p">
  //       <span>Длина дорожки:</span> 10 метров.
  //     </div>
  //     <br>
  //     <div class="popup__p">
  //       На территории бассейна находится кафе, с возможностю купить коктейль или заказать чашку чая.
  //     </div>
  //     <a href="/" class="popup__button">Подробнее</a>
  //   </div>
  //   <div class="popup__img">
  //     <button class="popup__close">×</button>
  //     <img src="img/pool.png" alt="pool">
  //   </div>
  // `;

  popup.innerHTML = inside;

  let rect;
  let placeholderRect = document.querySelector(".map__placeholder").getBoundingClientRect();

  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;

  if (element.tagName === 'path') {
    rect = element.parentNode.getBoundingClientRect();
  } else {
    rect = element.getBoundingClientRect();
  }

  const rectMid = {
    w: rect.left + rect.width/2,
    h: rect.top + rect.height/2
  }

  if (isMobile) {
    popup.style.marginTop = `${placeholderRect.height + 30}px`;
    placeholder.style.height = `${placeholderRect.height + popupHeight*2 + 30}px`;
  } else {
    if (rectMid.w < (placeholderRect.width/2 + placeholderRect.left)) {
      const leftPoint = rectMid.w - placeholderRect.left + popupWidth/2;

      if ((leftPoint + placeholderRect.left + popupWidth) >= placeholderRect.right) {
        popup.style.left = `${leftPoint}px`;
      } else {
        popup.style.left = `${placeholder.left + placeholderRect.width - popupWidth}px`;
      }
    } else {

      const leftPoint = rectMid.w - placeholderRect.left - popupWidth/2;

      if ((leftPoint + placeholderRect.left - popupWidth/2) >= placeholderRect.left) {
        popup.style.left = `${leftPoint}px`;
      } else {
        popup.style.left = `${popupWidth/2}px`;
      }

    }

    if (rectMid.h < (placeholderRect.height/2 + placeholderRect.top)) {
      popup.style.top = `${rectMid.h - placeholderRect.top + popupHeight/2}px`;
    } else {
      popup.style.top = `${rectMid.h - placeholderRect.top - popupHeight/2}px`;
    }
  }

  popup.addEventListener('mouseenter', function() {
      highlightOnHover(element);
  });

  popup.querySelector('.popup__close').addEventListener('click', function() {
    hidePopup();
    !isHighlighted && removeHighlight();
    isMobile && updatePlaceholderHeight();
  });
}

// Function to hide any displayed popup
function hidePopup() {
  const popup = placeholder.querySelector('.popup');
  if (popup) {
    popup.remove();
    isMobile && updatePlaceholderHeight();
  }
}