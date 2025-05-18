import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/AdminNavbar.css';

const AdminNavbar = () => {
  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">
        <h2>Admin Panel</h2>
      </div>
      <ul className="admin-navbar-links">
        <li>
          <NavLink to="/admindashboard" className={({ isActive }) => isActive ? 'active' : ''} end>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/productadmin" className={({ isActive }) => isActive ? 'active' : ''} end>
            Products
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''} end>
            Orders
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;