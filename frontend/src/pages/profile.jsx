import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './profile.css'; // Import your custom styles

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Used for navigation

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          setLoading(false);
          return;
        }
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = res.data.user || res.data;
        setFormData({
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
      } catch (error) {
        console.error('Error fetching profile:', error.response || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully!');
      const updatedUser = res.data.user || res.data;
      setFormData({
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    }
  };

  const goToDashboard = () => {
    if (formData.role === 'super_admin') {
      navigate('/super-admin');
    } else if (formData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/user');
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-left">
        <h2>Let’s get your profile in sync</h2>
        <p>Keep your information up to date to personalize your experience.</p>
      </div>
      <div className="profile-right">
        <h2 className="form-title">My Profile</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} disabled />

          <label>Role</label>
          <input type="text" name="role" value={formData.role} disabled />

          <div className="form-buttons">
            {message === 'Profile updated successfully!' ? (
              <button
                type="button"
                className="cancel-btn"
                onClick={goToDashboard}
              >
                Back to Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={goToDashboard}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">Save</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
