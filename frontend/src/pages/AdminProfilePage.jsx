import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../firebase.config';
import { updatePassword } from 'firebase/auth';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/ProfilePage.css';

const AdminProfilePage = () => {
  const navigate = useNavigate();
  const { uid } = useParams();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No user logged in');
      await updatePassword(firebaseUser, password);
      setSuccess('Password changed successfully!');
      setPassword('');
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#222d52' }}>
      <AdminNavbar />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="profile-card admin-profile-page" style={{ minWidth: 340, maxWidth: 400, width: '100%', background: '#2e3a6c', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', padding: '2.5rem 2.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="profile-avatar" style={{ marginBottom: 18 }}>
            <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#e0c69a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
          </div>
          <h2 className="profile-name" style={{ color: '#e0c69a', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1.3rem', marginBottom: 8 }}>{user?.email || 'Admin'}</h2>
          {!showChangePassword ? (
            <>
              {user?.email === 'superadmin@gmail.com' ? (
                <button className="profile-action-btn logout" style={{ width: '100%', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 0', fontWeight: 600, fontFamily: 'Cinzel, serif', fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s', marginTop: 24 }} onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <>
                  <button className="profile-action-btn" style={{ width: '100%', background: '#e0c69a', color: '#2e3a6c', border: 'none', borderRadius: 8, padding: '0.7rem 0', fontWeight: 600, fontFamily: 'Cinzel, serif', marginTop: 24, marginBottom: 10, fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setShowChangePassword(true)}>
                    Change Password
                  </button>
                  <button className="profile-action-btn logout" style={{ width: '100%', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 0', fontWeight: 600, fontFamily: 'Cinzel, serif', fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s' }} onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
            </>
          ) : (
            <form onSubmit={handleChangePassword} style={{ width: '100%', marginTop: 18 }}>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="profile-input"
                required
                minLength={6}
                style={{ width: '100%', marginBottom: 16, background: '#222d52', color: '#e0c69a', border: '1.5px solid #e0c69a', borderRadius: 6, padding: '0.5rem 1rem', fontSize: '1rem', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="profile-action-btn" type="button" style={{ flex: 1, background: '#c0392b', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 0', fontWeight: 600, fontFamily: 'Cinzel, serif', fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setShowChangePassword(false)}>
                  Cancel
                </button>
                <button className="profile-action-btn" type="submit" disabled={loading} style={{ flex: 1, background: '#e0c69a', color: '#2e3a6c', border: 'none', borderRadius: 8, padding: '0.7rem 0', fontWeight: 600, fontFamily: 'Cinzel, serif', fontSize: '1.08rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                  {loading ? 'Changing...' : 'Save'}
                </button>
              </div>
              {error && (
                <div style={{ color: 'red', marginTop: 12, textAlign: 'center', fontWeight: 600, fontFamily: 'Cinzel, serif' }}>{error}</div>
              )}
              {success && (
                <div style={{ color: 'green', marginTop: 12, textAlign: 'center', fontWeight: 600, fontFamily: 'Cinzel, serif' }}>{success}</div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
