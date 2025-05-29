"use client";

import { registerUser } from "../authSlice";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";

const Register = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(formData));
    if(result?.payload?.token){
        Router.push("../auth/login");
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Card className="shadow-sm" style={{ width: "400px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Create Account</Card.Title>
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Register
              </Button>
              <Link
                className="d-flex align-items-center justify-content-center"
                href="../auth/login"
              >
                Already have an account?
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
