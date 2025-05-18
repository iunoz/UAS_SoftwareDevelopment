import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import '../styles/Navbar.css';
import logo from '../assets/images/DecorLighting.png';

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
        <Link to="/" className="logo">
          <img src={logo} alt="DecorLighting Logo" className="logo-image" />
        </Link>
      </div>
      <div className="navbar-title">
        <Link to="/" className="title-link">
          DecorLighting
        </Link>
      </div>
      <div className="navbar-end">
        <Link to="/cart" className="nav-icon-link">
          <FaShoppingCart className="nav-icon" />
          <span className="cart-count">0</span>
        </Link>
        <Link to="/login" className="nav-icon-link">
          <FaUser className="nav-icon" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 