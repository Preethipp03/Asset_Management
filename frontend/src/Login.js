import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:5000/auth/login', form);
    const token = res.data.token;
    localStorage.setItem('token', token);
    setError(null);

    const decoded = jwtDecode(token);
    // redirect based on role
    if (decoded.role === 'super_admin') {
      navigate('/super-admin');
    } else if (decoded.role === 'admin') {
      navigate('/admin');
    } else if (decoded.role === 'user') {
      navigate('/user');
    } else {
      navigate('/'); // fallback or show error
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Login failed');
  }
};


  return (
    <div>
      <h2>Login</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
