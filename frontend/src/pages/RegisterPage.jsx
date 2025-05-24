import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase.config';
import axios from 'axios';
import '../styles/RegisterPage.css';
import chandelierImg from '../assets/images/chandelier.jpg';
import googleLogo from '../assets/images/google.png';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      return setErrors({ confirmPassword: 'Passwords do not match' });
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });
      const idToken = await userCredential.user.getIdToken();

      // Ambil data user dari backend
      const response = await axios.post('http://localhost:4000/api/user/register', {
        fname: firstName,
        lname: lastName,
      }, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const { user } = response.data;
      // Register: selalu sessionStorage, tidak pernah rememberMe
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('role', user.role);

      
      // Redirect sesuai role
      if (user.role === 'admin') {
        navigate(`/${user.uid}/admindashboard`);
      } else {
        navigate(`/${user.uid}`);
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: 'Email Already Registered' });
      } else {
        console.error(error);
      }
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const fullName = result.user.displayName || '';
      const [fname, ...lnameArr] = fullName.split(' ');
      const lname = lnameArr.join(' ');

      // Ambil data user dari backend
      const response = await axios.post('http://localhost:4000/api/user/register', {
        fname: fname || '',
        lname: lname || '',
      }, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const { user } = response.data;
      // Tambahkan providerId dari Firebase user
      const providerId = result.user.providerData[0]?.providerId;
      const userData = { ...user, providerId };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', user.role);

      // Redirect sesuai role
      if (user.role === 'admin') {
        navigate(`/${user.uid}/admindashboard`);
      } else {
        navigate(`/${user.uid}`);
      }
    } catch (error) {
      console.error('Google registration failed:', error);
      setErrors({ general: 'Google registration failed. Please try again.' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={chandelierImg} alt="Chandelier" />
      </div>
      <div className="login-right">
        <div className="login-logo">👑</div>
        <h2 className="login-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-row">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <small className="error-text">{errors.email}</small>}
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
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Your Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
          </div>
          {errors.general && <small className="error-text">{errors.general}</small>}
          <button type="submit" className="login-button">CREATE</button>
          <div className="divider">OR</div>
          <button type="button" className="google-login" onClick={handleGoogleRegister}>
            <img src={googleLogo} alt="Google Logo" />
          </button>
        </form>
        <p className="login-redirect">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;