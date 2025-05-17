import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">E-Shop</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/products" className="nav-link">Products</Link>
        <Link to="/categories" className="nav-link">Categories</Link>
      </div>
      <div className="navbar-end">
        <Link to="/cart" className="nav-link">
          Cart (0)
        </Link>
        <Link to="/login" className="nav-link">
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 