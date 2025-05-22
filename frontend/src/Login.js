import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faTimes } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [disclaimerClosed, setDisclaimerClosed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


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

      if (decoded.role === 'super_admin') navigate('/super-admin');
      else if (decoded.role === 'admin') navigate('/admin');
      else if (decoded.role === 'user') navigate('/user');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    setDisclaimerAccepted(true);
  };

  const handleDisclaimerClose = () => {
    setShowDisclaimer(false);
    setDisclaimerClosed(true);
  };

  const handleNonNavigatingLinkClick = (e) => {
    e.preventDefault();
    console.log('Action for this link should be implemented!');
  };

  return (
    <>
      {showDisclaimer && (
        <div className="disclaimer-modal">
          <div className="disclaimer-box">
            <button className="disclaimer-close" onClick={handleDisclaimerClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="disclaimer-right">
             <h2>Authorized Access Only</h2>
                <p>
                Access to this system is restricted to designated employees.
                Sharing login credentials or accessing data beyond your scope of authorization is strictly prohibited.
                </p>

              <button onClick={handleDisclaimerAccept} className="got-it-button">
                Agree
              </button>
              
            </div>
          </div>
        </div>
      )}

      {!showDisclaimer && disclaimerAccepted && (
        <div className="login-page-container">
          <div className="login-header">
  <img src="/rprocess_logo.png" alt="Company Logo" className="rprocess" />
</div>

          <div className="login-content-wrapper">
            <div className="login-illustration-panel">
              <img src="/login1.jpg" alt="Login Illustration" className="illustration-image" />
            </div>
            <div className="login-form-panel">
              <div className="login-form-container">
                <h1>LOGIN</h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                  <div className="input-group">
                    <FontAwesomeIcon icon={faEnvelope} className="icon-email" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter Your Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="login-input"
                    />
                  </div>
                  <div className="input-group">
                    <FontAwesomeIcon icon={faLock} className="icon-password" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter Your Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="login-input"
                    />
                  </div>
                  <div className="form-options">
                    <label className="show-password-toggle">
                    <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                    /> Show Password
                    </label>
                    <button
                      type="button"
                      onClick={handleNonNavigatingLinkClick}
                      className="forgot-password-button"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" className="login-button">
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showDisclaimer && disclaimerClosed && (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.3rem',
            color: '#e74c3c',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <p>
            Access denied. You must accept the disclaimer to proceed to the login form.
          </p>
        </div>
      )}
    </>
  );
};

export default Login;
