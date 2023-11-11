/**************************************************************************************************************************************************************************** */
var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener("load", onload);

function onload(event) {
  initWebSocket();
  setDefaultStates();
}

function setDefaultStates() {
  doorState = false;
  mettreAJourEtatDeVerrouillage();
}

function getValues() {
  websocket.send("getValues");
}

function initWebSocket() {
  console.log("Trying to open a WebSocket connection…");
  websocket = new WebSocket(gateway);
  websocket.onopen = onOpen;
  websocket.onclose = onClose;
  websocket.onmessage = onMessage;
}

function onOpen(event) {
  console.log("Connection opened");
  getValues();
  websocket.send("getShutterState");
}

function onClose(event) {
  console.log("Connection closed");
  setTimeout(initWebSocket, 1000);
}

function sendRequest(route) {
  fetch(`/${route}`)
    .then((response) => response.text())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
}

/**************************************************************************************************************************************************************************** */
function updateSliderPWM(element) {
  var sliderNumber = element.id.charAt(element.id.length - 1);
  var sliderValue = document.getElementById(element.id).value;
  document.getElementById("sliderValue" + sliderNumber).innerHTML = sliderValue;
  console.log(sliderValue);
  websocket.send(sliderNumber + "s" + sliderValue.toString());
}

/**************************************************************************************************************************************************************************** */
var gazStateHIGH = true;

function onMessage(event) {
  console.log(event.data);
  var data = JSON.parse(event.data);

  // Mise à jour des sliders
  for (var i = 1; i <= 2; i++) {
    // Ici, je suppose que vous avez seulement 2 sliders. Ajustez si nécessaire.
    var key = "sliderValue" + i;
    if (data.hasOwnProperty(key)) {
      var value = data[key];
      document.getElementById("slider" + i).value = value;
      document.getElementById("sliderValue" + i).innerHTML = value;
    }
  }

  // Fonction pour mettre à jour les valeurs des capteurs de manière uniforme
  function updateSensorValue(sensorName, value, unit) {
    if (data.hasOwnProperty(sensorName)) {
      document.querySelector(".measures-state-data." + sensorName).textContent =
        parseFloat(data[sensorName]).toFixed(value) + " " + unit;
    }
  }

  // Mise à jour des données des capteurs
  updateSensorValue("temperature", 1, "°C");
  updateSensorValue("pression", 0, "hPa");
  updateSensorValue("bh1750", 1, "lux");
  updateSensorValue("ldr", 1, "lux");

  // Mise à jour de la valeur mq9
  if (data.hasOwnProperty("mq9")) {
    document.querySelector(
      ".gaz-analog-state"
    ).textContent = `CO : ${data.mq9} ppm`;
  }

  // Mettre à jour la variable gazStateHIGH
  if (data.hasOwnProperty("mq99")) {
    gazStateHIGH = data.mq99 === "1";
  }

  updateSymbol();
}

/**************************************************************************************************************************************************************************** */

// Cette fonction met à jour les symboles en fonction de l'état du gaz.
function updateSymbol() {
  var successSymbol = document.querySelector(".success-symbol");
  var errorSymbol = document.querySelector(".error-symbol");

  if (gazStateHIGH) {
    successSymbol.style.display = "inline";
    errorSymbol.style.display = "none";
  } else {
    successSymbol.style.display = "none";
    errorSymbol.style.display = "inline";
  }

  const element = document.querySelector(".gaz-digital-state");

  if (gazStateHIGH) {
    element.style.animation = "none";
  } else {
    element.style.animation = "warning 1s ease-in-out infinite";
  }
}

// Appelez la fonction updateSymbol une fois que le DOM est entièrement chargé
document.addEventListener("DOMContentLoaded", (event) => {
  updateSymbol();
});

/**************************************************************************************************************************************************************************** */
$(function () {
  $(".menu-link").click(function () {
    $(".menu-link").removeClass("is-active");
    $(this).addClass("is-active");
  });
});

$(function () {
  $(".main-header-link").click(function () {
    $(".main-header-link").removeClass("is-active");
    $(this).addClass("is-active");
  });
});

/**************************************************************************************************************************************************************************** */
const toggleButton = document.querySelector(".toggle-dark-light");
const darkLightContainer = document.querySelector(".dark-light");

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

darkLightContainer.addEventListener("click", () => {
  toggleButton.click();
});

toggleButton.addEventListener("click", () => {
  toggleButton.click();
});

/**************************************************************************************************************************************************************************** */
function mettreAJourVariable(minutes) {
  if (minutes % 2 === 0) {
    timeEven = true;
  } else {
    timeEven = false;
  }

  var alarmeImg = document.querySelector(".tor-state .alarme-image");
  var alarme = document.getElementById("alarme");

  if (timeEven) {
    alarmeImg.src = "media/alarme-on.png";
    alarme.classList.add("alarme-on");
    alarme.classList.remove("alarme-off");
  } else {
    alarmeImg.src = "media/alarme-off.png";
    alarme.classList.add("alarme-off");
    alarme.classList.remove("alarme-on");
  }
}

function updateTime() {
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");
  const now = new Date();

  const timeOptions = { hour: "numeric", minute: "numeric" };
  const dateOptions = { year: "numeric", month: "numeric", day: "numeric" };

  const formattedTime = now.toLocaleTimeString("fr-FR", timeOptions);
  const formattedDate = now.toLocaleDateString("fr-FR", dateOptions);

  timeElement.textContent = formattedTime;
  dateElement.textContent = formattedDate;

  const minutes = now.getMinutes();

  mettreAJourVariable(minutes);
}

setInterval(updateTime, 1000);
updateTime();

/**************************************************************************************************************************************************************************** */
document.addEventListener("DOMContentLoaded", function () {
  loadContent("Accueil");

  document.querySelectorAll(".menu-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      loadContent(e.target.textContent);
    });
  });
});

function loadContent(pageName) {
  var homeContent = document.getElementById("home-content");
  var settingsContent = document.getElementById("settings-content");

  if (pageName === "Accueil") {
    homeContent.style.display = "block";
    settingsContent.style.display = "none";
  } else if (pageName === "Réglages") {
    homeContent.style.display = "none";
    settingsContent.style.display = "block";
  }
}

/**************************************************************************************************************************************************************************** */
// Fonction pour basculer les couleurs des boutons
function toggleShutters(state, parentElement) {
  const buttonWrappers = parentElement.querySelectorAll(".button-wrapper");

  buttonWrappers.forEach((wrapper) => {
    if (state === "shutters-open") {
      wrapper.classList.remove("shutters-closed");
      wrapper.classList.add("shutters-open");
    } else {
      wrapper.classList.remove("shutters-open");
      wrapper.classList.add("shutters-closed");
    }
  });
  websocket.send(JSON.stringify({ shutterState: shutterState }));
}

/**************************************************************************************************************************************************************************** */
var initialMouse = 0;
var slideMovementTotal = 0;
var mouseIsDown = false;
var slider = $("#slider");
var timer;

function initializeSlider() {
  slider.css({ left: "-10px" });

  $(".slide-text").fadeTo(0, 1);

  slider.removeClass("unlocked");

  $("#locker").text("lock_outline");

  sendRequest("32/close");
}

$(document).ready(function () {
  initializeSlider();
});

// Fonction pour retourner le slider à son état initial avec l'animation appropriée
function returnToInitialState() {
  // Fade le texte du slider à 100% d'opacité en 300ms
  $(".slide-text").fadeTo(300, 1);

  // Anime le slider vers la position de départ en 300ms
  slider.animate({ left: "-10px" }, 300, function () {
    // Après animation, retire la classe "unlocked" et change l'icône du verrou
    slider.removeClass("unlocked");
    $("#locker").text("lock_outline");

    // Envoie la requête pour indiquer que le slider est fermé
    sendRequest("32/close");
  });
}

// Événement lors de l'appui sur le slider
slider.on("mousedown touchstart", function (event) {
  mouseIsDown = true;
  slideMovementTotal = $("#button-background").width() - $(this).width() + 10;
  initialMouse = event.clientX || event.originalEvent.touches[0].pageX;
});

// Événement lors du relâchement du clic ou du toucher
$(document.body, "#slider").on("mouseup touchend", function (event) {
  if (!mouseIsDown) return;
  mouseIsDown = false;

  var currentMouse = event.clientX || event.changedTouches[0].pageX;
  var relativeMouse = currentMouse - initialMouse;

  // Si le mouvement n'est pas suffisant, retour à l'état initial
  if (relativeMouse < slideMovementTotal) {
    returnToInitialState();
    return;
  }

  // Déverrouillage du slider
  slider.addClass("unlocked");
  $("#locker").text("lock_open");
  sendRequest("32/open");

  // Initialisation du timer pour retour automatique à l'état initial après 10s
  timer = setTimeout(returnToInitialState, 10000);

  // Événement lors du clic/tap sur un slider déverrouillé
  setTimeout(function () {
    slider.on("click tap", function (event) {
      if (!slider.hasClass("unlocked")) return;
      clearTimeout(timer); // Annulation du timer si retour manuel à l'état initial
      returnToInitialState(); // Retour à l'état initial
      slider.off("click tap"); // Désactivation de l'événement
    });
  }, 0);
});

// Événement lors du mouvement de la souris ou du toucher
$(document.body).on("mousemove touchmove", function (event) {
  if (!mouseIsDown) return;

  var currentMouse = event.clientX || event.originalEvent.touches[0].pageX;
  var relativeMouse = currentMouse - initialMouse;
  var slidePercent = 1 - relativeMouse / slideMovementTotal;

  // Fade le texte du slider en fonction du mouvement
  $(".slide-text").fadeTo(0, slidePercent);

  // Positionnement du slider en fonction du mouvement de la souris ou du toucher
  if (relativeMouse <= 0) {
    slider.css({ left: "-10px" });
  } else if (relativeMouse >= slideMovementTotal + 10) {
    slider.css({ left: slideMovementTotal + "px" });
  } else {
    slider.css({ left: relativeMouse - 10 });
  }
});

/**************************************************************************************************************************************************************************** */
var doorState = true;

function mettreAJourEtatDeVerrouillage() {
  if (doorState) {
    $(".lockStatusButton").fadeOut(500, function () {
      $(".unlockStatusButton").fadeIn(500);
    });
  } else {
    $(".unlockStatusButton").fadeOut(500, function () {
      $(".lockStatusButton").fadeIn(500);
    });
  }
}

// Mettre à jour l'état initial
mettreAJourEtatDeVerrouillage();

// Écouteur d'événement pour le changement d'état du slider
$("#slider").on("DOMSubtreeModified", function () {
  if ($(this).hasClass("unlocked")) {
    doorState = true;
  } else {
    doorState = false;
  }
  mettreAJourEtatDeVerrouillage();
});

/**************************************************************************************************************************************************************************** */

document.addEventListener("DOMContentLoaded", function () {
  const openButtons = document.querySelectorAll(
    ".shutter-section .status-button.open"
  );
  const closeButtons = document.querySelectorAll(
    ".shutter-section .status-button.close"
  );

  var shutterState = true;

  function toggleShutters(state, parentElement) {
    const buttonWrappers = parentElement.querySelectorAll(".button-wrapper");
    const openButton = parentElement.querySelector(".status-button.open");
    const closeButton = parentElement.querySelector(".status-button.close");

    if (state === "shutters-open") {
      buttonWrappers.forEach((wrapper) => {
        wrapper.classList.remove("shutters-closed");
        wrapper.classList.add("shutters-open");
      });
      openButton.setAttribute("disabled", "disabled");
      closeButton.removeAttribute("disabled");
    } else {
      buttonWrappers.forEach((wrapper) => {
        wrapper.classList.remove("shutters-open");
        wrapper.classList.add("shutters-closed");
      });
      closeButton.setAttribute("disabled", "disabled");
      openButton.removeAttribute("disabled");
    }
  }

  function toggleMovingClass() {
    $(".door").toggleClass("moving", shutterState);
  }

  function watchToggleChange() {
    toggleMovingClass();
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (button.hasAttribute("disabled")) return;
      toggleShutters("shutters-open", button.closest(".section-cmd"));
      shutterState = !shutterState;
      watchToggleChange();
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (button.hasAttribute("disabled")) return;
      toggleShutters("shutters-closed", button.closest(".section-cmd"));
      shutterState = !shutterState;
      watchToggleChange();
    });
  });

  $(".door").click(function () {
    $(this).toggleClass("moving");
  });

  watchToggleChange();
});

/**************************************************************************************************************************************************************************** */
document.addEventListener("DOMContentLoaded", function () {
  // Sélectionne les boutons "Ouvrir" et "Fermer"
  const openButtons = document.querySelectorAll(
    ".gate-section .status-button.open"
  );
  const closeButtons = document.querySelectorAll(
    ".gate-section .status-button.close"
  );

  // Ajoute les écouteurs d'événements aux boutons "Ouvrir"
  openButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Vérifie si le bouton est inactif
      if (button.closest(".section-cmd").classList.contains("shutters-open")) {
        return; // Sort de la fonction si le bouton est inactif
      }
      toggleShutters("shutters-open", button.closest(".section-cmd"));
    });
  });

  // Ajoute les écouteurs d'événements aux boutons "Fermer"
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Vérifie si le bouton est inactif
      if (
        button.closest(".section-cmd").classList.contains("shutters-closed")
      ) {
        return; // Sort de la fonction si le bouton est inactif
      }
      toggleShutters("shutters-closed", button.closest(".section-cmd"));
    });
  });
});

/**************************************************************************************************************************************************************************** */
let intervalId = null;

// Sélection des éléments
const videoElement = document.querySelector(".video-bg video");
const changeVideoButton = document.querySelector(".swipe");
const intervalSelect = document.getElementById("intervalSelect");

// Récupère l'intervalle enregistré du localStorage, ou utilise 5min par défaut
const savedInterval = localStorage.getItem("videoInterval")
  ? parseInt(localStorage.getItem("videoInterval"))
  : 300000;
intervalSelect.value = savedInterval;

// Tableau des vidéos
const videos = [
  "https://homesync.fr/media-hub/videos/7036079f920185bdaa45e14feebff148.mp4",
  "https://homesync.fr/media-hub/videos/95b8e4022dbcfd3aa3579227cc21ac94.mp4",
  "https://homesync.fr/media-hub/videos/a5f2c27d503f0d12432fa8ff6924d0bb.mp4",
  "https://homesync.fr/media-hub/videos/a82d85ee2c24858be380a22bec38a01f.mp4",
  "https://homesync.fr/media-hub/videos/20bd97fa484720f243c4516f00b0cd7c.mp4",
  "https://homesync.fr/media-hub/videos/1c5b2036c2826a674db6cb6d1bc7d296.mp4",
  "https://homesync.fr/media-hub/videos/34cc21069875701d388e61256c6b1316.mp4",
  "https://homesync.fr/media-hub/videos/70d7f5f5f6e39d709915cd419c3b0e1c.mp4",
  "https://homesync.fr/media-hub/videos/1998cc046c8f83c622c3c09b73e47234.mp4",
  "https://homesync.fr/media-hub/videos/9c3717363c2b2e4613e4312643a3603e.mp4",
  "https://homesync.fr/media-hub/videos/f0a5812c4f467014bdaba3445b2a6d52.mp4",
  "https://homesync.fr/media-hub/videos/339b7148deb69b83ebb184e830b7e037.mp4",
  "https://homesync.fr/media-hub/videos/998d82852cc1dc7a78f9ba0fdce730b3.mp4",
  "https://homesync.fr/media-hub/videos/e07727a73da26efcdc8860dead75434a.mp4",
  "https://homesync.fr/media-hub/videos/3279e26a63e5d5313fbc9342d7d73930.mp4",
  "https://homesync.fr/media-hub/videos/88f371d2c6759dc27aa11bad0c7f0383.mp4",
  "https://homesync.fr/media-hub/videos/7457d9fb2eabdfb30e99d198cb22f7bd.mp4",
  "https://homesync.fr/media-hub/videos/b51916a692dea56cb0923c1e121dca85.mp4",
];

// Charge l'index de la vidéo depuis le localStorage ou utilise 0 par défaut
let currentVideoIndex = localStorage.getItem("currentVideoIndex")
  ? parseInt(localStorage.getItem("currentVideoIndex"))
  : 0;

// Fonction pour changer la vidéo
function changeVideo() {
  videoElement.classList.add("video-fade");

  setTimeout(() => {
    currentVideoIndex = (currentVideoIndex + 1) % videos.length; // Incrémente l'index ou revient à 0
    localStorage.setItem("currentVideoIndex", currentVideoIndex); // Sauvegarde dans localStorage
    videoElement.src = videos[currentVideoIndex]; // Met à jour la source
  }, 1000); // 1 seconde pour correspondre à la durée de la transition CSS

  videoElement.oncanplay = () => {
    videoElement.play(); // Joue la vidéo quand elle est prête
    videoElement.classList.remove("video-fade"); // Retire la classe pour remettre l'opacité à 1
  };
}

// Fonction pour mettre à jour l'intervalle
function updateInterval() {
  const intervalValue = parseInt(intervalSelect.value);

  // Sauvegarde l'intervalle dans le localStorage
  localStorage.setItem("videoInterval", intervalValue);

  if (intervalId !== null) {
    clearInterval(intervalId);
  }

  if (intervalValue !== -1) {
    intervalId = setInterval(changeVideo, intervalValue);
  }
}

// Écouteurs d'événement
changeVideoButton.addEventListener("click", changeVideo);
intervalSelect.addEventListener("change", updateInterval);

// Initialisation
videoElement.src = videos[currentVideoIndex];
videoElement.play();
updateInterval();

/**************************************************************************************************************************************************************************** */
//mode admin
var ws = new WebSocket("ws://" + location.hostname + ":80/ws");
var isAdminMode = false;

// Pour la limitation de taux
var lastAttemptTime = null;
var attemptCount = 0;

// Pour l'expiration de la session admin
var adminTimeout = null;

ws.onopen = function () {
  fetchUsers();
};

ws.onmessage = function (event) {
  if (event.data === "updateUsers") {
    fetchUsers();
  } else if (event.data === "Admin Mode is ON") {
    document.body.classList.add("admin-mode"); // Ajoute la classe CSS
    isAdminMode = true;
    document.body.style.backgroundColor = "blue";
    document.getElementById("adminButton").innerHTML = "Exit Admin Mode";
    adminContent.style.display = "block"; // Affiche le contenu admin
    setAdminExpiration();
  } else if (event.data === "Admin Mode is OFF") {
    document.body.classList.remove("admin-mode"); // Retire la classe CSS
    isAdminMode = false;
    document.body.style.backgroundColor = "white";
    document.getElementById("adminButton").innerHTML = "Enter Admin Mode";
    adminContent.style.display = "none"; // Cache le contenu admin
  }
};

function fetchUsers() {
  fetch("/getUsers")
    .then((response) => response.json())
    .then((data) => {
      var userList = document.getElementById("userList");
      userList.innerHTML = "";

      // Convertis l'objet data en un tableau de paires clé-valeur
      var dataArray = Object.entries(data);

      // Trie le tableau par les valeurs (noms des utilisateurs) en ordre alphabétique
      dataArray.sort((a, b) => a[1].localeCompare(b[1]));

      // Boucle sur le tableau trié pour créer les éléments HTML
      dataArray.forEach(([uid, name]) => {
        userList.innerHTML += `<div><input type="checkbox" id="${uid}" name="${uid}"><label for="${uid}">${uid} : ${name}</label></div>`;
      });

      updateButtonState();
    });
}

function checkRateLimit() {
  var currentTime = new Date().getTime();
  if (lastAttemptTime && currentTime - lastAttemptTime < 30000) {
    // 30 secondes
    attemptCount++;
    if (attemptCount > 3) {
      alert("Trop de tentatives. Veuillez attendre un moment.");
      return false;
    }
  } else {
    attemptCount = 1;
    lastAttemptTime = currentTime;
  }
  return true;
}

function setAdminExpiration() {
  if (adminTimeout) clearTimeout(adminTimeout);
  adminTimeout = setTimeout(function () {
    fetch("/exitAdmin");
    alert("Session administrateur expirée");
  }, 300000); // expire après 5 minutes
}

document
  .getElementById("exitAdminModeButton")
  .addEventListener("click", function () {
    if (isAdminMode) {
      if (adminTimeout) clearTimeout(adminTimeout);
      fetch("/exitAdmin");
    }
    document.querySelector(".admin-on").style.display = "none";
    document.querySelector(".admin-off").style.display = "flex";
    clearInput();
  });

document.getElementById("deleteButton").addEventListener("click", function () {
  var checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
  var uidsToDelete = [];

  for (var i = 0; i < checkboxes.length; i++) {
    uidsToDelete.push(checkboxes[i].id);
  }

  fetch("/deleteUsers", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "uids=" + uidsToDelete.join(","),
  }).then((response) => {
    if (response.ok) {
      fetchUsers();
    }
  });
});

document.getElementById("updateButton").addEventListener("click", function () {
  var checkboxes = document.querySelectorAll("input[type=checkbox]:checked");

  if (checkboxes.length !== 1) {
    alert("Sélectionnez un seul utilisateur pour la modification.");
    return;
  }

  var uidToUpdate = checkboxes[0].id;
  var newName = prompt("Entrez le nouveau nom pour l'utilisateur:");

  if (newName === null || newName === "") {
    return;
  }

  fetch("/updateUserName", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "uid=" + uidToUpdate + "&newName=" + newName,
  }).then((response) => {
    if (response.ok) {
      fetchUsers();
    }
  });
});

function updateButtonState() {
  var checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
  var updateButton = document.getElementById("updateButton");

  if (checkboxes.length >= 2) {
    updateButton.setAttribute("disabled", "disabled");
  } else {
    updateButton.removeAttribute("disabled");
  }
}

document
  .getElementById("userList")
  .addEventListener("change", function (event) {
    if (event.target.tagName === "INPUT" && event.target.type === "checkbox") {
      updateButtonState();
    }
  });

document.addEventListener("DOMContentLoaded", function (event) {
  ws.onmessage = function (event) {
    var message = event.data;
    if (message.startsWith("Last Five Users: ")) {
      // Met à jour l'affichage des 5 derniers utilisateurs
      var lastFiveUsersArray = message
        .substr("Last Five Users: ".length)
        .split(","); // Supposant que les noms d'utilisateurs sont séparés par des virgules
      var userHistoryDiv = document.getElementById("userHistory");
      userHistoryDiv.innerHTML = ""; // vider le contenu actuel
      lastFiveUsersArray.forEach((user) => {
        userHistoryDiv.innerHTML += `<div>${user}</div>`;
      });
    }
  };
});

function clickEvent(first, last) {
  if (first.value.length) {
    document.getElementById(last).focus();
  }
}

function onLastInputKeyUp() {
  // Si le dernier input a une valeur, déplacez le focus sur le bouton de confirmation
  if (document.getElementById("fourth").value.length) {
    document.getElementById("confirmButton").focus();
  }
}
async function checkPIN() {
  var pin =
    document.getElementById("first").value +
    document.getElementById("second").value +
    document.getElementById("third").value +
    document.getElementById("fourth").value;

  if (pin === "0000") {
    document.querySelector(".admin-on").style.display = "flex";
    document.querySelector(".admin-off").style.display = "none";
  } else {
    showDialog();
    clearInput();
    document.getElementById("first").focus();
  }
}

function showDialog() {
  document.getElementById("errorDialog").style.display = "flex";
  document.getElementById("overlay").style.display = "block";
}

function closeDialog() {
  document.getElementById("errorDialog").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

document.getElementById("OKButton").addEventListener("click", closeDialog);
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    closeDialog();
  }
});

function clearInput() {
  document.getElementById("first").value = "";
  document.getElementById("second").value = "";
  document.getElementById("third").value = "";
  document.getElementById("fourth").value = "";
}

document.getElementById("confirmButton").addEventListener("click", function () {
  clearInput();
});

function showCharacter(input) {
  input.type = "text";
  setTimeout(() => {
    input.type = "password";
  }, 200);
}
