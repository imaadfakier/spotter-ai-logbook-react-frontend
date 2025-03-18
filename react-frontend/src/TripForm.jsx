import React, { useState } from "react";
import { Form, Button, Container, Card } from "react-bootstrap";
import moment from "moment";
import "bootstrap/dist/css/bootstrap.min.css";

const TripForm = ({ onSubmit }) => {
  const [startLocation, setStartLocation] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [currentCycleHours, setCurrentCycleHours] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // For loader

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validation
    if (!startLocation || !pickupLocation || !dropoffLocation || !startDate) {
      alert("Please fill out all fields.");
      return;
    }

    const formattedDate = moment(startDate).format("YYYY-MM-DD");
    setIsSubmitting(true); // Show loader
    onSubmit({
      startLocation,
      pickupLocation,
      dropoffLocation,
      currentCycleHours,
      startDate: formattedDate,
    }).finally(() => {
      setIsSubmitting(false); // Hide loader after routing process is done
    });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Card
        className="p-4 shadow-lg"
        style={{
          width: "40rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "10px",
        }}
      >
        <Card.Body>
          <h2 className="text-center text-muted mb-4">Enter Trip Details</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-muted">Start Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter start location"
                value={startLocation}
                className="p-3 text-dark"
                onChange={(e) => setStartLocation(e.target.value)}
                disabled={isSubmitting} // Disable when submitting
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted">Pickup Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter pickup location"
                value={pickupLocation}
                className="p-3 text-dark"
                onChange={(e) => setPickupLocation(e.target.value)}
                disabled={isSubmitting} // Disable when submitting
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted">Dropoff Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter dropoff location"
                value={dropoffLocation}
                className="p-3 text-dark"
                onChange={(e) => setDropoffLocation(e.target.value)}
                disabled={isSubmitting} // Disable when submitting
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted">
                Current Cycle Hours
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter current cycle hours"
                value={currentCycleHours}
                className="p-3 text-dark"
                onChange={(e) =>
                  setCurrentCycleHours(parseFloat(e.target.value))
                }
                disabled={isSubmitting} // Disable when submitting
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-muted">Start Date</Form.Label>
              <Form.Control
                type="date"
                placeholder="Enter start date"
                value={startDate}
                className="p-3 text-dark"
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSubmitting} // Disable when submitting
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 p-3"
              disabled={isSubmitting}
            >
              Generate Logs
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TripForm;
