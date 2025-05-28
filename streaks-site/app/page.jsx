"use client"

import { Container, Row, Col, Button } from "react-bootstrap";
import Link from "next/link";

export default function Home() {
  return (
    <Container fluid>
      {" "}
      {/* Creates a full-width container */}
      <Row className="min-vh-100 align-items-center">
        {" "}
        {/* Creates a full-height row */}
        <Col md={8} className="mx-auto text-center">
          {" "}
          {/* Takes up 8/12 columns on medium screens and up */}
          <h1 className="display-4">Welcome to Streaks</h1>
          <p className="lead">Track your daily habits</p>
          <Link href="./auth/register">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
}
