import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './Login.scss';
import swal from 'sweetalert2';
import ip from "../../../ip-config/ip";
import NavBar from "../../../components/NavBar/NavBar";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    let isValid = true;
    const errors = {};

    if (!email) {
      isValid = false;
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      isValid = false;
      errors.email = "Email is invalid";
    }

    if (!password) {
      isValid = false;
      errors.password = "Password is required";
    } else if (password.length < 6) {
      isValid = false;
      errors.password = "Password must be at least 6 characters long";
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${ip}/api/Authentication/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.flag) {
          console.log(data)
          console.log("Login Successful:", data.message);
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('name', data.name);
          localStorage.setItem('image', data.image);
          localStorage.setItem('id', data.userID);
          localStorage.setItem('email', data.email);
          const user = {
            'id': data.id,
            'username': data.name,
            'email': data.email,
            'role': data.role,
            'image': data.image,
          }
          localStorage.setItem('currentUser', JSON.stringify(user))
          swal.fire({
            title: "Login Success.",
            icon: "success",
            toast: true,
            timer: 3000,
            position: "top-right",
            timerProgressBar: true,
            showConfirmButton: false,
            showCloseButton: true,
          });
          navigate('/')
        } else {
          swal.fire({
            title: "Email or Password didn't matched.",
            icon: "error",
            toast: true,
            timer: 3000,
            position: "top-right",
            timerProgressBar: true,
            showConfirmButton: false,
            showCloseButton: true,
          });
          console.error("Login Failed:", data.message);
        }
      } else {
        const errorData = await response.json();
        console.error("Error logging in:", errorData.message || "An unknown error occurred");
      }
    } catch (error) {
      console.error("Network error:", error.message);
    }
  };


  return (
    <>
      <NavBar />
      <section className="login">
        <form onSubmit={handleSubmit}  >
          <h2>Login</h2>
          <div className="email">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
          </div>

          <div className="password">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div style={{ color: "red" }}>{errors.password}</div>}
          </div>

          <button type="submit">Login</button>
          <p className="link">Do not have an account? <span onClick={() => navigate('/register')}> Register </span></p>
        </form>
      </section>
    </>
  );
};

export default Login;
