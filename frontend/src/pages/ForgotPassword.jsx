import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const { uid } = useParams();

  // Ambil user dari localStorage
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  // Deteksi providerId dengan benar
  const providerId =
    user?.providerId ||
    (user?.providerData && user.providerData[0]?.providerId) ||
    user?.provider ||
    null;
  const isGoogleUser = providerId === 'google.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (isGoogleUser) {
      setInfo('Akun Google hanya bisa mengganti password melalui Google Account.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New Passwords and Confirm New Password do not match');
      return;
    }

    try {
      if (uid) {
        // User sudah login, gunakan uid
        await axios.put(`https://uassoftwaredevelopment-production.up.railway.app/api/user/${uid}/forgot-password`, {
          oldPassword,
          newPassword,
        });
      } else {
        // User belum login, gunakan email
        await axios.put(`https://uassoftwaredevelopment-production.up.railway.app/api/user/forgot-password`, {
          email,
          newPassword,
        });
      }
      setInfo('Password berhasil diubah. Silakan login kembali.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mengubah password');
    }
  };

  
  return (
    <div className="auth-container">
      <div className="auth-form-section">
        <div className="auth-header">
          <h2 className="auth-title">Change Password</h2>
        </div>

        {/* Hanya tampilkan form jika BUKAN user Google */}
        {!isGoogleUser ? (
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Jika belum login, tampilkan input email */}
            {!uid && (
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            )}

            {/* Jika sudah login, tampilkan input old password */}
            {uid && (
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Enter Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            )}

            {/* New Password */}
            <div className="input-group">
              <input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {error && <div className="error-text">{error}</div>}
            {info && <div className="info-text">{info}</div>}
            <button type="submit" className="submit-button">
              CHANGE PASSWORD
            </button>
          </form>
        ) : (
          // Jika user Google, tampilkan pesan khusus
          <div className="auth-footer">
            <p>
              You can only change your password through Google Account{' '}
              <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">
                here
              </a>
            </p>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            BACK TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;