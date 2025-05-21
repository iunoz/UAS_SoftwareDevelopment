import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPen } from 'react-icons/fa';
import axios from 'axios';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { uid } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/${uid}`);
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setError('Failed to fetch user data');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data');
        setLoading(false);
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [uid]);

  const handleChangePassword = () => {
    navigate(`/${uid}/forgot-password`);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleAddressUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:4000/api/user/${uid}/update-address`, {
        address: newAddress
      });
      
      if (response.data.success) {
        setUser(prev => ({ ...prev, address: newAddress }));
        setShowAddressModal(false);
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address');
    }
  };

  if (loading) {
    return (
      <div className="profile-page d-flex justify-content-center align-items-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page d-flex justify-content-center align-items-center">
        <div className="text-danger">{error}</div>
      </div>
    );
  }

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
          <Link to={`/${uid}/orders`}>
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
            </div>
            <span>{user?.fname} {user?.lname}</span>
          </div>

          <div className="info-item">
            <div className="info-header">
              <FaEnvelope className="info-icon" />
              <label>Email</label>
            </div>
            <span>{user?.email}</span>
          </div>

          <div className="info-item">
            <div className="info-header">
              <FaMapMarkerAlt className="info-icon" />
              <label>Address</label>
              <Button 
                variant="outline-warning"
                size="sm"
                className="change-address-btn ms-2"
                onClick={() => setShowAddressModal(true)}
              >
                Change Address
              </Button>
            </div>
            <span className="mt-2">{user?.address || 'No address set'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions mt-4">
          <Button variant="outline-primary" className="change-password-btn mb-2 w-100" onClick={handleChangePassword}>
            CHANGE PASSWORD
          </Button>
          <Button variant="outline-danger" className="sign-out-btn w-100" onClick={handleSignOut}>
            SIGN OUT
          </Button>
        </div>
      </Container>

      {/* Address Edit Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
        <Modal.Header closeButton className="modal-dark">
          <Modal.Title>Update Address</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-dark">
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter your new address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="modal-input"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="modal-dark">
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleAddressUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfilePage; 