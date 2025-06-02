import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import '../styles/AdminNavbar.css';

const AdminNavbar = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  // Ambil user dari localStorage/sessionStorage
  const user =
    JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  const isSuperAdmin = user?.email === 'superadmin@gmail.com';

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">
        <h2>Admin Panel</h2>
      </div>
      <ul className="admin-navbar-links">
        <li>
          <NavLink to={`/${uid}/admindashboard`} className={({ isActive }) => isActive ? 'active' : ''} end>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to={`/${uid}/productadmin`} className={({ isActive }) => isActive ? 'active' : ''} end>
            Products
          </NavLink>
        </li>
        <li>
          <NavLink to={`/${uid}/adminorders`} className={({ isActive }) => isActive ? 'active' : ''} end>
            Orders
          </NavLink>
        </li>
        {isSuperAdmin && (
          <li>
            <NavLink to={`/${uid}/setrole`} className={({ isActive }) => isActive ? 'active' : ''} end>
              Set Role
            </NavLink>
          </li>
        )}
      </ul>
      <div className="admin-navbar-footer" style={{ marginTop: 'auto', padding: '1.5rem 0 0 0', borderTop: '1px solid #415b75', textAlign: 'center' }}>
        <button
          className="admin-profile-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e0c69a', fontSize: 28, marginBottom: 8 }}
          title="Admin Profile"
          onClick={() => navigate(`/${uid}/adminprofile`)}
        >
          <svg width="1.7em" height="1.7em" viewBox="0 0 24 24" fill="none" stroke="#e0c69a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
        </button>
        <div style={{ color: '#e0c69a', fontSize: '0.95rem', fontFamily: 'Cinzel, serif' }}>{user?.email || 'Admin'}</div>
      </div>
    </nav>
  );
};

export default AdminNavbar;