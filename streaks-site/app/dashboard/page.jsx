"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  fetchGoals,
  createGoal,
  selectAllGoals,
  selectDashboardStatus,
} from "./dashboardSlice";
import { logout } from "../auth/authSlice";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const dispatch = useDispatch();
  const goals = useSelector(selectAllGoals);
  const status = useSelector(selectDashboardStatus);
  const router = useRouter();
  const [error, setError] = useState(null);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  //fetchGoals will grab data from dashboardSlice state
  //Need a useState to handle showPrompt and newGoalName and helper function (handlePromptSubmit + handleAddGoal)
  // handlePromptSubmit will dispatch createGoal make showPrompt false, and setGoal name to ""
  //handleAddGoal will setShowPrompt to true

  //For logout, user clicks logout button, a handler function will delete token
  //Clear authentication state (reducer)
  //Route to login page

  const handleLogout = () => {
    dispatch(logout());
    router.push("./auth/login");
  };

  // Stats cards data
  const statsCards = [
    { title: "Active Streaks", value: goals.length, variant: "primary" },
    { title: "Longest Streak", value: "0", variant: "success" },
    { title: "Total Goals", value: goals.length, variant: "info" },
  ];

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchGoals());
      console.log("Data fetched: ", fetchGoals);
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  return (
    <Container fluid className="p-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <header className="mb-4">
        <Row>
          <Col className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6">My Streaks</h1>
              <p className="text-muted">Track your daily progress</p>
            </div>
            <div>
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  /* Add New Streak handler */
                }}
                aria-label="Add new streak"
              >
                Add New Streak
              </Button>
            </div>
          </Col>
        </Row>
      </header>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        {statsCards.map((card, index) => (
          <Col md={4} key={index}>
            <Card
              className="shadow-sm h-100 stats-card"
              role="region"
              aria-label={`${card.title} Statistics`}
            >
              <Card.Body className="text-center">
                <Card.Title className="text-muted mb-3">
                  {card.title}
                </Card.Title>
                <h2 className={`display-4 text-${card.variant} mb-0`}>
                  {card.value}
                </h2>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Streaks List */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Current Streaks</h5>
            </Card.Header>
            <Card.Body>
              {status === "loading" ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading streaks...</span>
                  </Spinner>
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <p className="mb-0">No streaks added yet</p>
                  <small>Click "Add New Streak" to get started</small>
                </div>
              ) : (
                <div className="streaks-list">
                  {/* Streaks will be mapped here */}
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="streak-card p-3 border-bottom"
                    >
                      {/* Placeholder for streak items */}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .stats-card {
          transition: transform 0.2s ease;
        }
        .stats-card:hover {
          transform: translateY(-2px);
        }
        .streak-card {
          border-left: 4px solid transparent;
        }
        .streak-card.active {
          border-left-color: var(--bs-primary);
        }
      `}</style>
    </Container>
  );
};

export default Dashboard;
