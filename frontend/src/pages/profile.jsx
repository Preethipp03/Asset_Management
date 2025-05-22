import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
        console.log('Profile API response:', res.data);

        // Adjust here if your backend returns user data at res.data or res.data.user
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
      // Update formData with latest returned data
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

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      {message && <p className="mb-4 text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            name="name"
            className="w-full border rounded p-2"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border rounded p-2"
            value={formData.email}
            disabled
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Role</label>
          <input
            type="text"
            name="role"
            className="w-full border rounded p-2"
            value={formData.role}
            disabled
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
