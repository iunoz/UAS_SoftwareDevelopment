import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/OrderReceipt.css';

function OrderReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;
  const [currentStatus, setCurrentStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (orderData && typeof orderData.isAdmin === 'boolean') {
      setIsAdmin(orderData.isAdmin);
    } else {
      // Detect if user is admin from localStorage or other means
      const role = localStorage.getItem('role');
      if (role === 'admin')  {
        setIsAdmin(true);
      }
    }
  }, [orderData]);

  useEffect(() => {
    if (!orderData) {
      navigate('/profile-orders', { replace: true });
      return;
    }

    // Fetch latest order status
    const fetchOrderStatus = async () => {
      try {
        const orderId = orderData.orderId;
        if (!orderId) return;

        const response = await axios.get(`http://localhost:4000/api/payment/user-orders/${orderData.userId}`);
        if (response.data.success) {
          const order = response.data.orders.find(o => o._id === orderId);
          if (order) {
            setCurrentStatus(order.status);
          }
        }
      } catch (error) {
        console.error('Error fetching order status:', error);
      }
    };

    fetchOrderStatus();
  }, [orderData, navigate]);

  if (!orderData) {
    return (
      <div className="order-receipt-bg">
        <div className="order-receipt-box">
          <div className="order-receipt-title-row">
            <h2 className="order-receipt-title">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }
  const { items, Address, courier, totalAmount, orderId } = orderData;
  const orderStatus = currentStatus || orderData.status;
  const isPaid = !['belum bayar', 'unpaid', 'pending payment'].includes(orderStatus?.toLowerCase());

  const handleSend = async () => {
    try {
      const response = await axios.put(`http://localhost:4000/api/payment/update-status/${orderId}`, {
        status: 'dikirim'
      });
      if (response.data.success) {
        alert('Order status updated to dikirim');
        setCurrentStatus('dikirim');
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  return (
    <div className="order-receipt-bg" style={{paddingTop: 0}}>
      <div className="order-receipt-box modern-receipt" style={{marginTop: 0}}>
        <div className="receipt-header">
        {isPaid ? (
          <>
            <div className="receipt-checkmark">
              <svg width="80" height="80" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="#f5e6c5" />
                <polyline
                  points="30,55 46,70 72,38"
                  fill="none"
                  stroke="#1a2238"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="receipt-success">Order Successful!</div>
            <div className="receipt-title">Order Receipt</div>
          </>
        ) : (
          <>
            <div className="receipt-pending">
              <svg width="80" height="80" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="#f5e6c5" />
                <text x="50" y="65" textAnchor="middle" fill="#1a2238" fontSize="60">!</text>
              </svg>
            </div>
            <div className="receipt-warning">Payment Required</div>
            <div className="receipt-title">Order Confirmation</div>
            {isAdmin && orderStatus.toLowerCase() === 'sedang dikemas' && (
              <button
                className="receipt-payment-btn"
                onClick={() => handleSend()}
              >
                Dikirim
              </button>
            )}
          </>
        )}
        </div>
        <hr className="order-receipt-hr" />
        <div className="receipt-section">
          <div className="receipt-label">Products</div>
          <div className="receipt-products-list">
            {items.map((item) => (
              <div className="receipt-product-row" key={item.product?._id || item._id}>
                <div className="receipt-product-main">
                  <span className="receipt-product-name">{item.product?.name || 'Unknown Product'}</span>
                  <span className="receipt-product-total">
                    RP. {(item.priceAtPurchase * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="receipt-product-details">
                  <span className="receipt-product-qty">Qty: {item.quantity}</span>
                  <span className="receipt-product-price">
                    @ RP. {item.priceAtPurchase.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="receipt-section">
          <div className="receipt-info-row">
            <span className="receipt-info-label">Shipping:</span>
            <span className="receipt-info-value">{courier}</span>
          </div>
          <div className="receipt-info-row">
            <span className="receipt-info-label">Address:</span>
            <span className="receipt-info-value address-value">{Address}</span>
          </div>
        </div>        <div className="receipt-section receipt-total-section">
          <div className="receipt-total-label">Total</div>
          <div className="receipt-total-value">RP. {totalAmount.toLocaleString('id-ID')}</div>
        </div>
        {isAdmin ? (
          <>
            {orderStatus.toLowerCase() === 'sedang dikemas' && (
              <button
                className="receipt-payment-btn"
                onClick={() => handleSend()}
              >
                Dikirim
              </button>
            )}
            <button
              className="receipt-back-btn"
              onClick={() => navigate('/adminorders')}
            >
              Back to Orders
            </button>
          </>
        ) : isPaid ? (
          <button
            className="receipt-back-btn"
            onClick={() => navigate(`/${orderData.userId}/orders`)}
          >
            Back to Orders
          </button>
        ) : (
          <div className="receipt-buttons">
            <button
              className="receipt-payment-btn"
              onClick={() => navigate(`/${orderData.userId}/payment`, { 
                state: { 
                  orderId: orderId, 
                  fromOrdersPage: true 
                } 
              })}
            >
              Complete Payment
            </button>
            <button
              className="receipt-back-btn secondary"
              onClick={() => navigate(`/${orderData.userId}/orders`)}
            >
              Back to Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );  
}

export default OrderReceipt;

