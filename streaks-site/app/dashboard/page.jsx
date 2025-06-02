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
  Modal,
  Form,
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
  const userId = localStorage.getItem("token");
  const [error, setError] = useState(null);
  const [showPrompt, setPrompt] = useState(false);
  const [newGoalName, setNewGoal] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handlePromptSubmit = async (goalData) => {
    try {
      const resultAction = await dispatch(createGoal(goalData));

      if (createGoal.rejected.match(resultAction)) {
        const error = resultAction.error;
        console.error("Error adding streak:", error);
        setError(`Failed to create streak: ${error.message}`);
      }
    } catch (error) {
      console.error("Error adding new streak:", error);
      setError("Failed to create streak. Please try again.");
    } finally {
      setPrompt(false);
      setNewGoal("");
    }
  };

  const handleAddGoal = () => {
    setNewGoal("");
    setPrompt(true);
  };

  const submitNewGoal = () => {
    if (newGoalName.trim().length === 0) {
      setError("Please enter a streak name");
      return;
    }

    handlePromptSubmit({
      name: newGoalName,
      startDate: new Date().toISOString(),
      userId: userId, 
    });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logout());
      router.push("/auth/login");
    } catch (err) {
      setError("Failed to log out. Please try again.");
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
                disabled={isLoggingOut}
                aria-label="Logout"
              >
                {isLoggingOut ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </Button>
              <Button
                variant="primary"
                onClick={handleAddGoal}
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
                      className={`streak-card p-3 border-bottom ${
                        goal.currentStreak > 0 ? "active" : ""
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">{goal.name}</h5>
                          <small className="text-muted">
                            Started{" "}
                            {new Date(goal.startDate).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="text-end">
                          <h4 className="mb-0">{goal.currentStreak}</h4>
                          <small className="text-muted">days</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* New Streak Modal */}
      <Modal show={showPrompt} onHide={() => setPrompt(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Streak</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Streak Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter a name for your new streak"
                value={newGoalName}
                onChange={(e) => setNewGoal(e.target.value)}
                autoFocus
              />
              <Form.Text className="text-muted">
                Give your streak a clear, motivating name
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPrompt(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitNewGoal}>
            Create Streak
          </Button>
        </Modal.Footer>
      </Modal>

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
