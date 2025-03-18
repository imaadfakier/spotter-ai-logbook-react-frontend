import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "./MapComponent.css";

// Fix for Leaflet icon path (Method 1)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapComponent = ({ logsData, tripId }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Rate Limiting - COMMENTED OUT
  // const [requestCount, setRequestCount] = useState(0);
  // const MAX_REQUESTS_PER_MINUTE = 10; // Adjust as needed
  // const [isRateLimited, setIsRateLimited] = useState(false);

  // Retry Mechanism - COMMENTED OUT
  // const MAX_RETRIES = 3;

  useEffect(() => {
    const createMap = async () => {
      if (!mapRef.current) return;

      const existingMap = L.DomUtil.get("map");
      if (!existingMap?._leaflet_id) {
        const map = L.map(mapRef.current, {
          center: [40.7128, -74.006],
          zoom: 6,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        if (logsData != null && logsData.length > 0) {
          const startLog = logsData[0]; // First
          const pickupLog = logsData[logsData.length - 3]; // Third from last
          const dropoffLog = logsData[logsData.length - 1]; // Last

          if (!startLog || !pickupLog || !dropoffLog) {
            return;
          }

          const startCoords = [startLog.latitude, startLog.longitude];
          const pickupCoords = [pickupLog.latitude, pickupLog.longitude];
          const dropoffCoords = [dropoffLog.latitude, dropoffLog.longitude];

          // Create custom icons
          const startIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png", // green
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

          const pickupIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png", // blue
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

          const dropoffIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png", // red
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

          // Add start, pickup, and dropoff markers
          const startMarker = L.marker(startCoords, { icon: startIcon })
            .addTo(map)
            .bindPopup(
              `${startLog.location}<br>Duty Status: ${startLog.duty_status}<br>Remarks: ${startLog.remarks}`
            );

          const pickupMarker = L.marker(pickupCoords, { icon: pickupIcon })
            .addTo(map)
            .bindPopup(
              `${pickupLog.location}<br>Duty Status: ${pickupLog.duty_status}<br>Remarks: ${pickupLog.remarks}`
            );

          const dropoffMarker = L.marker(dropoffCoords, { icon: dropoffIcon })
            .addTo(map)
            .bindPopup(
              `${dropoffLog.location}<br>Duty Status: ${dropoffLog.duty_status}<br>Remarks: ${dropoffLog.remarks}`
            );

          // Open popup on mouseover, close on mouseout
          startMarker.on("mouseover", function () {
            this.openPopup();
          });
          startMarker.on("mouseout", function () {
            this.closePopup();
          });

          pickupMarker.on("mouseover", function () {
            this.openPopup();
          });
          pickupMarker.on("mouseout", function () {
            this.closePopup();
          });

          dropoffMarker.on("mouseover", function () {
            this.openPopup();
          });
          dropoffMarker.on("mouseout", function () {
            this.closePopup();
          });

          // Add intermediate location markers (NO ROUTING)
          logsData.forEach((log, index) => {
            if (index !== 0 && index !== 9 && index !== 10) {
              // Exclude start, pickup, and dropoff locations
              const intermediateMarker = L.marker([log.latitude, log.longitude])
                .addTo(map)
                .bindPopup(
                  `${log.location}<br>Duty Status: ${log.duty_status}<br>Remarks: ${log.remarks}`
                );

              intermediateMarker.on("mouseover", function () {
                this.openPopup();
              });
              intermediateMarker.on("mouseout", function () {
                this.closePopup();
              });
            }
          });

          // Create Routing Control (ONLY START, PICKUP, DROPOFF)
          // Rate Limiting - COMMENTED OUT
          // if (requestCount >= MAX_REQUESTS_PER_MINUTE || isRateLimited) {
          //   setIsRateLimited(true);
          //   return;
          // }

          // Retry Mechanism - COMMENTED OUT
          // if (retryCount >= MAX_RETRIES) {
          //   return;
          // }

          // Function to fetch route from the backend
          const fetchRoute = async (
            startCoords,
            pickupCoords,
            dropoffCoords
          ) => {
            try {
              const start = startCoords.join(",");
              const pickup = pickupCoords.join(",");
              const dropoff = dropoffCoords.join(",");

              const response = await fetch(
                `https://spotterailogbook-production.up.railway.app/api/get-osrm-route/?start=${start}&via=${pickup}&end=${dropoff}`
              );
              const data = await response.json();

              // Ensure routes exist and then directly extract waypoints
              if (data.waypoints && data.waypoints.length > 0) {
                const waypoints = data.waypoints; // Extract the waypoints array

                // Ensure the waypoints array contains the expected 3 locations
                if (waypoints && waypoints.length === 3) {
                  const coordinates = waypoints.map((wp) =>
                    L.latLng(wp.location[1], wp.location[0])
                  ); // Reverse lat/lng

                  return coordinates; // Return the extracted coordinates
                } else {
                  return [];
                }
              } else {
                return [];
              }
            } catch (error) {
              return [];
            }
          };

          // Function to update the route on the map
          const updateRouteOnMap = async () => {
            const routeCoordinates = await fetchRoute(
              startCoords,
              pickupCoords,
              dropoffCoords
            );

            if (routeCoordinates.length > 0) {
              // Use the new waypoints directly in the Routing Control
              L.Routing.control({
                waypoints: [
                  L.latLng(startCoords), // Start coordinates
                  L.latLng(pickupCoords), // Pickup coordinates
                  L.latLng(dropoffCoords), // Dropoff coordinates
                ],
                routeWhileDragging: false,
                showAlternatives: false,
                serviceUrl: "http://router.project-osrm.org/route/v1",
              }).addTo(map);
            } else {
            }
          };

          // Trigger route generation (can be called in response to user interaction)
          updateRouteOnMap();

          //  setRequestCount(requestCount + 1);
        }

        mapInstance.current = map;
      } else {
      }
    };

    createMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [logsData]);

  // Effect to handle rate limiting - COMMENTED OUT
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRequestCount(0); // Reset every minute
  //     setIsRateLimited(false); // Re-enable requests
  //   }, 60000); // Every minute

  //   return () => clearInterval(interval);
  // }, [isRateLimited, requestCount]);

  return <div id="map" ref={mapRef} style={{ height: "500px" }}></div>;
};

export default MapComponent;
