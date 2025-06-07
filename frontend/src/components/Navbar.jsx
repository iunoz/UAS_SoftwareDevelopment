import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import '../styles/Navbar.css';
import logo from '../assets/images/DecorLighting.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, fetchCartCount } = useCart();
  
  // Ambil user dari localStorage/sessionStorage sesuai rememberMe
  const rememberMe = localStorage.getItem('rememberMe');
  const user = rememberMe
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : JSON.parse(sessionStorage.getItem('user') || '{}');
  const uid = user?.uid;

  // Fetch cart count setiap kali route berubah
  useEffect(() => {
    fetchCartCount();
    // eslint-disable-next-line
  }, [location.pathname]);
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
  
  // Hide navbar on specific pages
  const hideNavbarPaths = [
    '/login',
    '/register',
    'order-receipt',
    'product-detail'
  ];
  
  if (hideNavbarPaths.some(path => location.pathname.includes(path))) {
    return null;
  }

  // Handler untuk klik ikon user
  const handleProfileClick = (e) => {
    if (!uid) {
      // Belum login, biarkan ke /login
      e.preventDefault();
      navigate('/login');
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
          {uid && cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
        <Link to={uid ? `/${uid}/profile` : "/login"} className="nav-icon-link" onClick={handleProfileClick}>
          <FaUser className="nav-icon" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 