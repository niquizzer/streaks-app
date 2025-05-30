"use client"

import { Container, Form, Button, Card } from "react-bootstrap";
import { useDispatch } from "react-redux"; 
import { useState } from "react";
import { loginUser } from "../authSlice";
import { useRouter } from "next/navigation";

const Login = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await dispatch(loginUser(formData));
        if(result?.payload?.token){
            router.push("/dashboard");
        }
    } 

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    return(
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Card className="shadow-sm" style={{ width: "400px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Login</Card.Title>
          <Form onSubmit={handleLogin}>
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
              Login
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
    );
}

export default Login;