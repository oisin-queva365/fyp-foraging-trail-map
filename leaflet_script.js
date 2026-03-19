// Photo carousel
var photoIdx = 0;
var photos = document.querySelectorAll("#photo-strip img");
var dots = document.querySelectorAll(".photo-dot");
function showPhoto(n) {
  photos[photoIdx].classList.remove("active");
  dots[photoIdx].classList.remove("active");
  photoIdx = (n + photos.length) % photos.length;
  photos[photoIdx].classList.add("active");
  dots[photoIdx].classList.add("active");
}
document.getElementById("prev-photo").addEventListener("click", function () {
  showPhoto(photoIdx - 1);
});
document.getElementById("next-photo").addEventListener("click", function () {
  showPhoto(photoIdx + 1);
});
dots.forEach(function (d) {
  d.addEventListener("click", function () {
    showPhoto(+d.dataset.idx);
  });
});

function closePanel() {
  document.getElementById("trail-panel").classList.remove("open");
}

// Map
var map = L.map("map").setView([51.683019, -8.562775], 11.5);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
}).addTo(map);
L.control.scale({ imperial: true, metric: true }).addTo(map); // t

var overlaysControl = L.control.groupedLayers(null, {}, {}).addTo(map);

var plantsGroup = L.layerGroup();
var rubusGroup = L.layerGroup();
var urticaGroup = L.layerGroup();
var betavelarisGroup = L.layerGroup();
var alliumTriquetrumGroup = L.layerGroup();
var ulexGroup = L.layerGroup();
var alliumUrsinumGroup = L.layerGroup();
var taraxacumGroup = L.layerGroup();
var allTrailsGroup = L.layerGroup(); //trail group to hold all trails for easy toggling of all trails on/off but allowing individual trail toggles in the control

fetch(
  "https://raw.githubusercontent.com/oisin-queva365/fyp-foraging-trail-map/refs/heads/main/All_Trails.json",
)
  .then((r) => r.json())
  .then(function (data) {
    // Group trails into separate layers by name
    var trailLayers = {};
    L.geoJSON(data, {
      style: function (feature) {
        return {
          color: feature.properties.color || "#1F661F",
          weight: 4,
        };
      },
      onEachFeature: function (feature, layer) {
        var baseColor = feature.properties.color || "#1F661F";

        // Create white border line (drawn first, so it appears underneath)
        var borderLine = L.polyline(layer.getLatLngs(), {
          color: "#FFFFFF",
          weight: 7,
          interactive: false,
          lineCap: "round",
          lineJoin: "round",
        });

        layer.on("click", function () {
          openPanel(feature.properties); // populate sidebar from properties
        });
        layer.on("mouseover", function () {
          layer.setStyle({ color: "#EEBC1D", weight: 6 });
          borderLine.setStyle({ weight: 8 });
        });
        layer.on("mouseout", function () {
          layer.setStyle({ color: baseColor, weight: 4 });
          borderLine.setStyle({ weight: 7 });
        });

        var name = feature.properties.name;
        if (!trailLayers[name]) trailLayers[name] = L.layerGroup();
        // Add border first so it renders underneath
        trailLayers[name].addLayer(borderLine);
        trailLayers[name].addLayer(layer);
        allTrailsGroup.addLayer(borderLine);
        allTrailsGroup.addLayer(layer);
      },
    });

    // Add each trail as its own toggle in the overlay control
    overlaysControl.addOverlay(allTrailsGroup, "All Trails", "Trails");
    allTrailsGroup.addTo(map);
    Object.keys(trailLayers).forEach(function (name) {
      trailLayers[name].addTo(map);
      overlaysControl.addOverlay(trailLayers[name], name, "Trails");
    });
  });
// function to populate sidebar content and open it based on clicked trail's properties
function openPanel(props) {
  document.getElementById("display-title").textContent = props.name;
  document.getElementById("display-distance").textContent = props.distance;
  document.getElementById("display-desc").textContent = props.description;
  document.getElementById("visit-link").href = props.url;
  document.getElementById("trail-panel").classList.add("open");
}

//Giving plants custom icons based on their name using the iNaturalist API and a mapping of plant names to icon URLs

var seasonColours = {
  spring: { bg: "#d4edda", text: "#276221", label: "Spring" },
  summer: { bg: "#fff3cd", text: "#856404", label: "Summer" },
  autumn: { bg: "#ffe5cc", text: "#7a3e00", label: "Autumn" },
  winter: { bg: "#cce5ff", text: "#004085", label: "Winter" },
};
//this
function renderSeasons(seasons) {
  if (!seasons || seasons.length === 0) return "Unknown";
  return seasons
    .map(function (s) {
      var c = seasonColours[s] || { bg: "#eee", text: "#333", label: s };
      return `<span style="
      background:${c.bg};
      color:${c.text};
      padding:2px 8px;
      border-radius:12px;
      font-size:11px;
      font-weight:600;
      margin-right:4px;
      display:inline-block;
    ">${c.label}</span>`;
    })
    .join("");
}
//the plantData includes relevant metadata for each plant such as a description, URL, and seasonal information used to enhance the popups and make the map more informative and engaging for users.
var plantData = {
  rubus: {
    icon: "icon/001-location.png",
    commonName: "Blackberry",
    description:
      "Found in hedgerows and woodland edges. Berries ripen late summer.",
    url: "https://oisinqueva.cloud/blackberry/",
    image: "plant_photos/blackberry.jpg",
    pickingSeason: ["autumn"],
    floweringSeason: ["summer", "autumn"],
  },
  urtica: {
    icon: "icon/002-map-pin.png",
    name: "Stinging Nettle",
    description:
      "Extremely common around Ireland,especially in nitrogen-rich soils. Young leaves edible in spring and during the regrowth period in Autumn with the seeds.",
    url: "https://oisinqueva.cloud/nettle/",
    image: "plant_photos/nettle.jfif",
    pickingSeason: ["spring", "autumn"],
    floweringSeason: ["summer"],
  },
  "beta vulgaris": {
    icon: "icon/003-location-1.png",
    commonName: "Sea Beet",
    description:
      "Found in large clumps along coastal areas like salt marshes or old sea walls, sandy places and grasslands.",
    url: "https://oisinqueva.cloud/sea-beet/",
    image: "plant_photos/sea-beet.jpg",
    pickingSeason: ["spring", "autumn"],
    floweringSeason: ["summer", "autumn"],
  },
  "allium triquetrum": {
    icon: "icon/004-map.png",
    commonName: "Three-cornered Leek",
    description:
      "Found commonly all over Ireland especially on roadsides and is known as a nuisance invasive species. It has strong garlic smell and flavour similar to wild garlic but with a more delicate taste.",
    url: "https://oisinqueva.cloud/three-cornered-leek/",
    image: "plant_photos/three-cornered-leek.jpg",
    pickingSeason: ["spring"],
    floweringSeason: ["spring"],
  },
  ulex: {
    icon: "icon/005-pin.png",
    commonName: "Gorse",
    description:
      "Spiky shrub with bright yellow flowers with a light coconut scent.",
    url: "https://oisinqueva.cloud/gorse/",
    image: "plant_photos/gorse.jpg",
    pickingSeason: ["spring", "summer", "autumn", "winter"],
    floweringSeason: ["spring", "summer"],
  },
  "allium ursinum": {
    icon: "icon/010-search.png",
    commonName: "Wild Garlic",
    description:
      "Found in damp woodlands. Leaves have a strong garlic smell, stonger than its cousin the three-cornered leek and a good substitute for garlic.",
    url: "https://oisinqueva.cloud/wild-garlic/",
    image: "plant_photos/wild-garlic.jpg",
    pickingSeason: ["spring", "summer"],
    floweringSeason: ["spring", "summer"],
  },
  taraxacum: {
    icon: "icon/008-location-4.png",
    commonName: "Dandelion",
    description:
      "Common on the roadside, in grasslands and disturbed areas. roots(Winter),Leaves(early Spring) and flowers(Sping/early Summer) are all edible.",
    url: "https://oisinqueva.cloud/dandelion/",
    image: "plant_photos/dandelion.jpg",
    pickingSeason: ["Winter", "spring", "autumn"],
    floweringSeason: ["spring", "summer", "autumn"],
  },
  default: {
    icon: "icon/009-pin-1.png",
    name: "Unknown Plant",
    description: "No information available.",
    url: "#",
  },
};

// function to select appropriate plant data based on plant name, using simple substring matching to handle name variations (e.g. "Rubus fruticosus" should match "rubus")
function getPlantData(plantName) {
  var lower = plantName.toLowerCase();
  var plant = plantData["default"];
  var matchedKey = "default";

  for (var key in plantData) {
    if (lower.startsWith(key.toLowerCase())) {
      plant = plantData[key];
      matchedKey = key;
      break;
    }
  }
  return { key: matchedKey, plant: plant };
}

fetch(
  "https://api.inaturalist.org/v1/observations?nelat=51.770038912246214&nelng=-8.43883555476566&swlat=51.560499036509036&swlng=-8.81237071101566&radius=2&taxon_id=51884,1449268,56152,79643,55505,47602,771653,765394,10904968&per_page=50",
)
  .then((r) => r.json())
  .then(function (data) {
    data.results.forEach(function (obs) {
      if (!obs.location) return;

      var coords = obs.location.split(",");
      var name = obs.taxon.preferred_common_name || obs.taxon.name || "Unknown";
      var lat = parseFloat(coords[0]).toFixed(5);
      var lng = parseFloat(coords[1]).toFixed(5);
      var match = getPlantData(obs.taxon.name);
      var description =
        obs.description && obs.description.trim() !== ""
          ? obs.description
          : match.description;
      var imageUrl =
        obs.photos && obs.photos.length > 0
          ? obs.photos[0].url.replace("square", "medium")
          : match.plant.image; // fall back to your local plant_photos folder if no iNat photo

      var popupHtml = `
        <div style="width:200px">
          ${imageUrl ? `<img src="${imageUrl}" style="width:100%;border-radius:4px;margin-bottom:6px">` : ""}
          <strong>${name}</strong>
          ${match.plant.description ? `<p style="font-size:12px;margin:6px 0">${match.plant.description}</p>` : ""}
        </div>

        <div style="margin-top:8px">
          <div style="font-size:11px;text-transform:capitalize;letter-spacing:0.5px;margin-bottom:3px;font-weight:bold">Best Picking Season</div>
          ${renderSeasons(match.plant.pickingSeason)}
        </div>

        <div style="margin-top:8px">
          <div style="font-size:11px;text-transform:capitalize;letter-spacing:0.5px;margin-bottom:3px;font-weight:bold">Flowering Season</div>
          ${renderSeasons(match.plant.floweringSeason)}
        </div>
        <div style="margin-top:8px;font-size:11px">
          ${lat}, ${lng}<br>
          ${match.plant.url ? `<a href="${match.plant.url}" target="_blank"class="visit-link"id="visit-link" style="font-size:12px">Learn more</a>` : ""}
        </div>
      `;

      var marker = L.marker([coords[0], coords[1]], {
        icon: L.icon({
          iconUrl: match.plant.icon,
          iconSize: [20, 20],
          iconAnchor: [14, 28],
          popupAnchor: [0, -30],
          iconOpacity: 0.8,
        }),
      }).bindPopup(popupHtml);

      plantsGroup.addLayer(marker);
      if (match.key === "rubus") {
        rubusGroup.addLayer(marker);
      } else if (match.key === "urtica") {
        urticaGroup.addLayer(marker);
      } else if (match.key === "beta vulgaris") {
        betavelarisGroup.addLayer(marker);
      } else if (match.key === "allium triquetrum") {
        alliumTriquetrumGroup.addLayer(marker);
      } else if (match.key === "ulex") {
        ulexGroup.addLayer(marker);
      } else if (match.key === "allium ursinum") {
        alliumUrsinumGroup.addLayer(marker);
      } else if (match.key === "taraxacum") {
        taraxacumGroup.addLayer(marker);
      }
    });
    overlaysControl.addOverlay(plantsGroup, "All Plants", "Plants");
    overlaysControl.addOverlay(rubusGroup, "Blackberry", "Plants");
    overlaysControl.addOverlay(urticaGroup, "Stinging Nettle", "Plants");
    overlaysControl.addOverlay(betavelarisGroup, "Sea Beet", "Plants");
    overlaysControl.addOverlay(
      alliumTriquetrumGroup,
      "Three-cornered Leek",
      "Plants",
    );
    overlaysControl.addOverlay(ulexGroup, "Gorse", "Plants");
    overlaysControl.addOverlay(alliumUrsinumGroup, "Wild Garlic", "Plants");
    overlaysControl.addOverlay(taraxacumGroup, "Dandelion", "Plants");

    var plantGroups = [
      rubusGroup,
      urticaGroup,
      betavelarisGroup,
      alliumTriquetrumGroup,
      ulexGroup,
      alliumUrsinumGroup,
      taraxacumGroup,
    ];
    plantGroups.forEach(function (group) {
      group.addTo(map);
      plantsGroup.addTo(map);
    });
  });

// Add legend for plant icons to make the map more user-friendly and informative by showing which icon corresponds to which plant.
var legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend");
  div.innerHTML = "<h3>Plant Legend</h3>";
  for (var key in plantData) {
    if (key === "default") continue;
    var plantName = plantData[key].name || plantData[key].commonName;
    div.innerHTML +=
      '<img src="' +
      plantData[key].icon +
      '" style="width:20px;height:20px;vertical-align:middle;margin-right:5px;"> ' +
      plantName +
      "<br>";
  }
  return div;
};
legend.addTo(map);
