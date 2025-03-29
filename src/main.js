import './styles.css'

mapboxgl.accessToken = "pk.eyJ1IjoiYXJ0ZW1ua3RuIiwiYSI6ImNtN2t0eGJnMzAzcTAybnJ6eGIyNGVwZjQifQ.m31J0mxEu4qvB66LxdGkPg";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: [34.782, 32.085],
  zoom: 12.5,
});

map.setPadding({ left: 450 });

map.on("load", () => {
  console.log("Map loaded");
  map.addSource("polygons", {
    type: "vector",
    url: "mapbox://arfeo.alavi17w",
  });

  map.addLayer({
    id: "neighborhood_accessibility",
    type: "fill",
    source: "polygons",
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-opacity": 0.75,
      "fill-color": "#b5b8b8",
      "fill-outline-color": "#ffffff",
    },
    "source-layer": "neighborhood_accessibility-5oiesm",
  });

  let activeColumn;

  document.querySelectorAll(".switch-table-control").forEach(item => {
    const onClick = (e) => {
      const isActive = e.target.classList.contains("active");
      console.log("Clicked");

      activeColumn = undefined;

      document.querySelectorAll(".switch-table-control").forEach(i => {
        if (e.target.dataset.column === i.dataset.column && !isActive) {
          i.classList.add("active");

          activeColumn = i.dataset.column;
        } else {
          i.classList.remove("active");
        }
      });

      if (activeColumn) {
        map.setPaintProperty(
          "neighborhood_accessibility",
          "fill-color",
          [
            "case",
            [
              "all",
              [">=", ["get", activeColumn], 0], ["<=", ["get", activeColumn], 20]
            ],
            "#e5f3b2",
            [
              "all",
              [">", ["get", activeColumn], 20], ["<=", ["get", activeColumn], 40]
            ],
            "#aada95",
            [
              "all",
              [">", ["get", activeColumn], 40], ["<=", ["get", activeColumn], 60]
            ],
            "#5fb671",
            [
              "all",
              [">", ["get", activeColumn], 60], ["<=", ["get", activeColumn], 80]
            ],
            "#348550",
            [">", ["get", activeColumn], 80],
            "#20563e",
            "#fdfee7",
          ],
        );
      } else {
        map.setPaintProperty(
          "neighborhood_accessibility",
          "fill-color",
          "#b5b8b8",
        );
      }
    };

    item.addEventListener("click", onClick);
  });

  let popup; // Declare a single popup instance

  // Add a `mousemove` event to dynamically update the popup when hovering over a feature
  map.on("mousemove", "neighborhood_accessibility", (e) => {
    // Check if there are features under the mouse
    if (e.features.length > 0) {
      const feature = e.features[0];

      // Check if the feature has the `neighborhood_name` property
      if (feature.properties.neighborhood_name) {
        // If a popup already exists, update its content and position
        if (popup) {
          popup.setLngLat(e.lngLat).setHTML(`<strong>${feature.properties.neighborhood_name}</strong>`);
        } else {
          // Create a new popup if it doesn't exist
          popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
          })
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${feature.properties.neighborhood_name}</strong>`)
            .addTo(map);
        }
      }
    }
  });

  // Add a `mouseleave` event to remove the popup when the mouse leaves the layer
  map.on("mouseleave", "neighborhood_accessibility", () => {
    if (popup) {
      popup.remove();
      popup = null; // Reset the popup instance
    }
  });
});
