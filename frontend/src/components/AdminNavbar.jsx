import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import '../styles/AdminNavbar.css';

const AdminNavbar = () => {
  const { uid } = useParams();
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
    </nav>
  );
};

export default AdminNavbar;