import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [city, setCity] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAbout(user.about || '');
      setCity(user.city || '');
    }
  }, [user]);

  const avatarUrl = user?.profileImage
    ? `/api/avatars/${user.profileImage}`
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), about: about.trim(), city: city.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }
      updateUser(data);
      setSuccess('Profile updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setError('');
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      const res = await fetch('/api/auth/profile/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }
      updateUser(data);
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccess('Photo updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">Profile</h1>
      <p className="profile-subtitle">Edit your name, about, and city. Upload a profile photo.</p>

      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      <div className="profile-layout">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="profile-avatar-img" />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                {user?.name?.slice(0, 2).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <label className="profile-avatar-label">
            <span className="btn btn-ghost btn-sm">Choose photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              className="profile-avatar-input"
            />
          </label>
          {avatarFile && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAvatarUpload}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? 'Uploading…' : 'Upload photo'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </label>
          <label>
            About
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="A short bio"
              rows={3}
            />
          </label>
          <label>
            City
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Your city"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
