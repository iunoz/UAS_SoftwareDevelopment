import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Hide navbar on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-brand">
        <Link to="/" className="logo">DecorLighting</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
          Products
        </Link>
        <Link to="/categories" className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}>
          Categories
        </Link>
      </div>
      <div className="navbar-end">
        <Link to="/cart" className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}>
          Cart (0)
        </Link>
        <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>
          Register
        </Link>
        <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 