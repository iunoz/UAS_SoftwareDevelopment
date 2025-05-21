import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import '../styles/AdminNavbar.css';

const AdminNavbar = () => {
  const { uid } = useParams();

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
      </ul>
    </nav>
  );
};

export default AdminNavbar;