import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
//simport React, { useState } from 'react'; // remove useEffect here

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query params from URL (token & email)
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const email = queryParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Send email, token, and new password to backend
      const res = await axios.post('http://172.16.0.36:3000/auth/ResetPassword', {
        email,
        token,
        newPassword: password,
      });

      setMessage(res.data.message || 'Password reset successful!');
      setError('');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
      setMessage('');
    }
  };

  if (!token || !email) {
    return <p>Invalid password reset link.</p>;
  }

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
