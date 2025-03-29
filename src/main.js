import './styles.css'
import mapboxgl from 'mapbox-gl';


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
            "step",
            ["get", activeColumn],
            "#fdfee7", // Default color for values below the first step
            20, "#e5f3b2", // 0-20%
            40, "#aada95", // 20-40%
            60, "#5fb671", // 40-60%
            80, "#348550", // 60-80%
            100, "#20563e" // 80-100%
          ]
        );
      } else {
        map.setPaintProperty(
          "neighborhood_accessibility",
          "fill-color",
          "#b5b8b8", // Default color when no column is active
        );
      }
    };

    item.addEventListener("click", onClick);
  });

  let popup; // Declare a single popup instance

  map.on("mousemove", "neighborhood_accessibility", (e) => {
    if (e.features.length > 0) {
      const feature = e.features[0];

      // Check if the feature has a neighborhood name
      if (feature.properties.neighborhood_name) {
        // Determine the content of the popup based on the state of activeColumn
        const popupContent = activeColumn
          ? `
            <div style="font-family: Inter, sans-serif; font-size: 12px; color: #333; padding: 10px; border-radius: 8px; background: #ffffff;">
              <strong style="color:rgb(0, 67, 45);">Neighborhood:</strong> ${feature.properties.neighborhood_name}<br>
              <strong style="color:rgb(0, 67, 45);">Accessibility (%):</strong> ${feature.properties[activeColumn] || "N/A"}%
            </div>
          `
          : `
            <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 10px; border-radius: 8px; background: #ffffff;">
              <strong style="color:rgb(0, 67, 45);">Neighborhood:</strong> ${feature.properties.neighborhood_name}
            </div>
          `;

        // Update or create the popup
        if (popup) {
          popup.setLngLat(e.lngLat).setHTML(popupContent);
        } else {
          popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
          })
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
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
  document.getElementById("zoom-in").addEventListener("click", () => {
    map.zoomIn(); // Увеличить масштаб
  });

  document.getElementById("zoom-out").addEventListener("click", () => {
    map.zoomOut(); // Уменьшить масштаб
  });
});