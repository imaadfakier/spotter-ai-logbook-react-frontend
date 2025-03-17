import React from "react";
import { Container, Table } from "react-bootstrap";
import "./DailyLogSheet.css";

const DailyLogSheet = ({ logEntries }) => {
  return (
    <Container>
      <h2 className="text-center mb-4">Daily Log Sheet</h2>
      <Table striped bordered hover className="center-table mb-5">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Duty Status</th>
            <th>Location</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {logEntries.map((entry, index) => (
            <tr key={index}>
              <td>{entry.timestamp}</td>
              <td>{entry.duty_status}</td>
              <td>{entry.location}</td>
              <td>{entry.remarks}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default DailyLogSheet;
