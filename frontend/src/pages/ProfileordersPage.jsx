import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaBoxOpen } from 'react-icons/fa';
import axios from 'axios';
import '../styles/ProfileordersPage.css'; // Import your CSS styles

const ProfileordersPage = () => {
  const { uid } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user & orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userRes = await axios.get(`http://localhost:4000/api/user/${uid}`);
        if (userRes.data.success) {
          setUser(userRes.data.user);
        }
        // Fetch orders from backend API
        const ordersRes = await axios.get(`http://localhost:4000/api/payment/user-orders/${uid}`);
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.orders);
        } else {
          setOrders([]);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

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
        {/* Removed navigation buttons as per user request */}
        {/* <div className="profile-nav mb-4">
          <Link to={`/${uid}/profile`}>
            <Button variant="outline-primary" className="nav-btn mx-2">
              Personal Info
            </Button>
          </Link>
          <Button variant="outline-primary" className="nav-btn active mx-2">
            Orders
          </Button>
        </div> */}

        {/* Orders Information */}
        <div className="profile-info">
          <div className="info-item">
            <div className="info-header">
              <FaBoxOpen className="info-icon" />
              <label>Order Status</label>
            </div>
            {orders.length === 0 ? (
              <span>No orders yet.</span>
            ) : (
              <div>
                {orders.map((order, idx) => (
                  <div key={idx} className="mb-3 p-2" style={{ background: '#222a4d', borderRadius: 8 }}>
                    <div><strong>Order ID:</strong> {order._id}</div>
                    {order.items.map((item, i) => (
                      <div key={i}>
                        <div><strong>Product:</strong> {item.product?.name || item.product}</div>
                        <div><strong>Quantity:</strong> {item.quantity}</div>
                      </div>
                    ))}
                    <div><strong>Status:</strong> <span className="badge bg-warning text-dark">{order.status}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (copy dari ProfilePage, tidak perlu diubah) */}
        <div className="profile-actions mt-4">
          <Link to={`/${uid}/forgot-password`}>
            <Button variant="outline-primary" className="change-password-btn mb-2 w-100">
              CHANGE PASSWORD
            </Button>
          </Link>
          <Button variant="outline-danger" className="sign-out-btn w-100" onClick={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            localStorage.removeItem('rememberMe');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('role');
            window.location.href = '/';
          }}>
            SIGN OUT
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ProfileordersPage;
