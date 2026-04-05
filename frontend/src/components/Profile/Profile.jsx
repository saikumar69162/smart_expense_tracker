import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currency: 'GBP',
    timezone: 'Asia/Kolkata'
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        currency: user.currency || 'GBP',
        timezone: user.timezone || 'Asia/Kolkata'
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authService.updateProfile({
        name: profileForm.name.trim(),
        currency: profileForm.currency,
        timezone: profileForm.timezone
      });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      window.alert('New password and confirm password must match');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="mt-1 text-gray-500">View and update your account details</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Profile Details</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={profileForm.email}
                className="input-field bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={profileForm.currency}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, currency: e.target.value }))}
                className="input-field"
              >
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Timezone</label>
              <select
                value={profileForm.timezone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, timezone: e.target.value }))}
                className="input-field"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="Europe/London">Europe/London</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <button type="submit" disabled={savingProfile} className="btn-primary disabled:opacity-50">
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="input-field"
                minLength="6"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="input-field"
                minLength="6"
                required
              />
            </div>

            <button type="submit" disabled={changingPassword} className="btn-primary disabled:opacity-50">
              {changingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
