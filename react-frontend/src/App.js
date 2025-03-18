import React, { useState } from "react";
import MapComponent from "./MapComponent";
import "./App.css";
import DailyLogSheet from "./DailyLogSheet";
import TripForm from "./TripForm";
import { Container, Row, Col } from "react-bootstrap";

function App() {
  const [logEntries, setLogEntries] = useState([]);
  const [tripDetails, setTripDetails] = useState(null);

  const handleFormSubmit = async (tripData) => {
    // Convert camelCase keys to snake_case
    const convertToSnakeCase = (obj) => {
      const newObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const snakeCaseKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
          newObj[snakeCaseKey] = obj[key];
        }
      }
      return newObj;
    };

    const apiUrl =
      "https://spotterailogbook-production.up.railway.app/api/trips/"; //Django server endpoint
    try {
      // First, check if trip exists
      const checkTripResponse = await fetch(`${apiUrl}check_existing/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(convertToSnakeCase(tripData)),
      });

      if (!checkTripResponse.ok) {
        return;
      }

      const checkTripData = await checkTripResponse.json();

      let tripId;

      if (checkTripData.exists) {
        tripId = checkTripData.trip.id;
        setTripDetails(checkTripData.trip);
        //SetLogs
        const logsDataResponse = await fetch(`${apiUrl}${tripId}/logs/`);
        if (!logsDataResponse.ok) {
          return;
        }
        let logsData = await logsDataResponse.json();

        if (!logsData || logsData.length === 0) {
          // Generate logs if they don't exist
          const generateLogsResponse = await fetch(
            `${apiUrl}${tripId}/generate_logs/`,
            {
              method: "POST",
            }
          );

          if (!generateLogsResponse.ok) {
            return;
          }

          // Fetch the newly generated logs
          const newLogsDataResponse = await fetch(`${apiUrl}${tripId}/logs/`);
          if (!newLogsDataResponse.ok) {
            return;
          }
          logsData = await newLogsDataResponse.json();
        }
        setLogEntries(logsData || []);
      } else {
        // First, create the trip in the backend
        const response = await fetch(`${apiUrl}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(convertToSnakeCase(tripData)),
        });

        if (!response.ok) {
          return;
        }

        const newTrip = await response.json();

        tripId = newTrip.id;

        setTripDetails(newTrip);

        // Then, generate logs for the trip
        const logsResponse = await fetch(`${apiUrl}${tripId}/generate_logs/`, {
          method: "POST",
        });

        if (!logsResponse.ok) {
          return;
        }

        // Finally, fetch the generated logs
        const logsDataResponse = await fetch(`${apiUrl}${tripId}/logs/`);
        if (!logsDataResponse.ok) {
          return;
        }

        const logsData = await logsDataResponse.json();
        setLogEntries(logsData);
      }
    } catch (error) {}
  };

  return (
    <Container>
      <h1 className="text-center mt-5">Trucker Logbook App</h1>
      <hr />
      <Row>
        <Col md={12} className="mt-4 mb-5">
          <TripForm onSubmit={handleFormSubmit} />
        </Col>
        {tripDetails && <hr />}
        <Col md={12}>
          {tripDetails && (
            <MapComponent
              tripId={tripDetails.id}
              // startLocation={tripDetails.start_location}
              // pickupLocation={tripDetails.pickup_location}
              // dropoffLocation={tripDetails.dropoff_location}
              logsData={logEntries} // Pass the logsData
            />
          )}
        </Col>
      </Row>
      {logEntries.length > 0 && <hr />}
      <Row>
        <Col className={tripDetails ? "mt-4" : ""}>
          {logEntries.length > 0 && <DailyLogSheet logEntries={logEntries} />}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
