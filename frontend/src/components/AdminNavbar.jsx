import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminNavbar.css';

const AdminNavbar = () => {
  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">
        <h2>Admin Panel</h2>
      </div>
      <ul className="admin-navbar-links">
        <li>
          <Link to="/admindashboard" className="active">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin/products">Products</Link>
        </li>
        <li>
          <Link to="/admin/orders">Orders</Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;