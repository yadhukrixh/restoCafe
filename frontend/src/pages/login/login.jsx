import React, { useState } from 'react';
import './style.css';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      email,
      password,
    };

    try {
      const result = await axios.post('http://localhost:3000/login', formData);
      alert('Login successful:', result.data);
      // Handle successful login (e.g., redirect to another page)
    } catch (error) {
      if (error.response) {
        console.error('Login failed:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
      // Handle login error (e.g., display error message)
    }
  };

  return (
    <div className="container">
    <div className='form-inner'>
      <form className="form" onSubmit={handleSubmit}>
        <h2>WELCOME</h2>
        <label htmlFor="email" style={{ display: "none" }}>Email:</label>
        <input type="email" id="email" name="email" placeholder="Email" className="box" required onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password" style={{ display: "none" }}>Password:</label>
        <input type="password" id="password" name="password" placeholder="Password" className="box" required onChange={(e) => setPassword(e.target.value)} />
        <div className="extra">
          <div style={{ display: 'flex', flexDirection: "row" }}>
            <input type="checkbox" id="remember" name="remember" style={{ height: "12px", width: "12px" }} />
            <label htmlFor="remember">Remember</label>
          </div>
          <a href="/reset-password" className="forgot-password" style={{ textDecoration: "none", color: "white" }}>Forgot password?</a>
        </div>
        <input className="submit" type="submit" value="submit" />
      </form>
    </div>
      <div className="side" style={{}}>
        <img src="/images/resto-removebg-preview.png" alt="Photo" />
      </div>
    </div>
  );
};

export default Login;
