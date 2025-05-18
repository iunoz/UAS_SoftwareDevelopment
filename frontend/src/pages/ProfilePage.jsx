import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPen } from 'react-icons/fa';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <Container className="profile-container text-center py-5">
        {/* Profile Image */}
        <div className="profile-image-section mb-4">
          <div className="profile-image-wrapper mx-auto">
            <div className="profile-image rounded-circle d-flex align-items-center justify-content-center">
              <FaUser className="profile-icon" />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="profile-nav mb-4">
          <Button variant="outline-primary" className="nav-btn active mx-2">
            Personal Info
          </Button>
          <Link to="/orders">
            <Button variant="outline-primary" className="nav-btn mx-2">
              Orders
            </Button>
          </Link>
        </div>

        {/* Profile Information */}
        <div className="profile-info">
          <div className="info-item">
            <div className="info-header">
              <FaUser className="info-icon" />
              <label>Name</label>
              <button className="edit-btn ms-2">
                <FaPen />
              </button>
            </div>
            <span>Kevin Ligma</span>
          </div>

          <div className="info-item">
            <div className="info-header">
              <FaEnvelope className="info-icon" />
              <label>Email</label>
              <button className="edit-btn ms-2">
                <FaPen />
              </button>
            </div>
            <span>Pikachu@gmail.com</span>
          </div>

          <div className="info-item">
            <div className="info-header">
              <FaMapMarkerAlt className="info-icon" />
              <label>Address</label>
              <button className="edit-btn ms-2">
                <FaPen />
              </button>
            </div>
            <span>Jalan Hahahihi RT 18 RW 06</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions mt-4">
          <Button variant="outline-primary" className="change-password-btn mb-2 w-100">
            CHANGE PASSWORD
          </Button>
          <Button variant="outline-danger" className="sign-out-btn w-100">
            SIGN OUT
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage; 