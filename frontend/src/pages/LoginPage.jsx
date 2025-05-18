import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase.config';
import axios from 'axios';
import '../styles/AuthPages.css';
import chandelierImg from '../assets/images/chandelier.jpg';
import googleLogo from '../assets/images/google.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      await axios.post('http://localhost:4000/api/user/login', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      navigate('/');
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrors({ general: 'Invalid email or password' });
      } else {
        console.error('Login error:', error);
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Kirim data user ke backend untuk disimpan di MongoDB jika belum ada
      await axios.post('http://localhost:4000/api/user/login', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      navigate('/');
    } catch (error) {
      console.error('Google login failed:', error);
      setErrors({ general: 'Google login failed' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={chandelierImg} alt="Chandelier" />
      </div>
      <div className="login-right">
        <div className="login-logo">👑</div>
        <h2 className="login-title">Login to Your Account</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>
          {errors.general && <small className="error-text">{errors.general}</small>}
          <button type="submit" className="login-button">LOGIN</button>
          <div className="divider">OR</div>
          <button type="button" className="google-login" onClick={handleGoogleLogin}>
            <img src={googleLogo} alt="Google Logo" />
          </button>
        </form>
        <p className="login-redirect">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;