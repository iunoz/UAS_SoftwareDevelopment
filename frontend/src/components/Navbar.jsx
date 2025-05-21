import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import '../styles/Navbar.css';
import logo from '../assets/images/DecorLighting.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const uid = user?.uid;

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

    // Handler untuk klik ikon user
  const handleProfileClick = (e) => {
    if (!uid) {
      // Belum login, biarkan ke /login
      return;
    }
    // Sudah login, cek apakah path sudah mengandung uid
    const pathHasUid = location.pathname.startsWith(`/${uid}`);
    if (!pathHasUid) {
      e.preventDefault();
      navigate(`/${uid}/profile`);
    }
    // Jika sudah di path dengan uid, biarkan link berjalan normal
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-brand">
        <Link to={uid ? `/${uid}` : "/"} className="logo">
          <img src={logo} alt="DecorLighting Logo" className="logo-image" />
        </Link>
      </div>
      <div className="navbar-title">
        <Link to={uid ? `/${uid}` : "/"} className="title-link">
          DecorLighting
        </Link>
      </div>
      <div className="navbar-end">
        <Link to={uid ? `/${uid}/cart` : "/login"} className="nav-icon-link">
          <FaShoppingCart className="nav-icon" />
          <span className="cart-count">0</span>
        </Link>
        <Link to={uid ? `/${uid}/profile` : "/login"} className="nav-icon-link" onClick={handleProfileClick}>
          <FaUser className="nav-icon" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 