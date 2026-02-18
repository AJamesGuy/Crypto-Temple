import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { settingsAPI } from '../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const { token, logout, user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await settingsAPI.updateProfile(profile.username, profile.email);
      if (data.user) {
        setSuccess('Profile updated successfully');
        updateUser(data.user);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.new_password !== passwords.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await settingsAPI.changePassword(
        passwords.current_password,
        passwords.new_password
      );
      if (data.message) {
        setSuccess('Password changed successfully');
        setPasswords({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetBalance = async () => {
    if (!window.confirm('Are you sure? This will reset your balance to $10,000 and clear all holdings.')) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await settingsAPI.resetBalance();
      if (data.cash_balance) {
        setSuccess('Balance reset to $10,000');
        updateUser({ cash_balance: 10000 });
      } else {
        setError(data.message || 'Failed to reset balance');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    const password = window.prompt('Enter your password to confirm account deletion:');
    if (!password) return;

    if (!window.confirm('This will permanently delete your account and all data. This cannot be undone.')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await settingsAPI.deleteAccount(password);
      logout();
      navigate('/login');
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 px-6 py-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === 'profile'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === 'security'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === 'account'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Account
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Edit Profile</h2>
            <form onSubmit={updateProfile} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="max-w-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Change Password</h2>
            <form onSubmit={changePassword} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwords.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwords.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwords.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Reset Balance</h2>
            <p className="text-gray-400 mb-6">Reset your balance to $10,000 and clear all cryptocurrency holdings</p>
            <button
              onClick={resetBalance}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              {loading ? 'Resetting...' : 'Reset Balance'}
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Delete Account</h2>
            <p className="text-gray-400 mb-6">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button
              onClick={deleteAccount}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;