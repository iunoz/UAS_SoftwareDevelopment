import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase.config';
import '../styles/OrderReceipt.css';

function OrderReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;
  const [currentStatus, setCurrentStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const handleCompletePayment = async (order) => {
    if (paymentInProgress) {
      return; // Prevent multiple payment popups
    }
    setPaymentInProgress(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Please login first.');
        setPaymentInProgress(false);
        return;
      }
      // Call backend to get Midtrans snap token for existing order
      const response = await axios.post('http://localhost:4000/api/payment/create-payment', {
        orderId: order._id,
        amount: order.totalAmount,
        name: currentUser.displayName || 'Customer',
        email: currentUser.email || ''
      });
      if (!response.data.token) {
        throw new Error('Failed to get payment token');
      }
      const token = response.data.token;
      // Load Midtrans script dynamically
      await new Promise((resolve, reject) => {
        if (document.getElementById('midtrans-script')) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.id = 'midtrans-script';
        script.setAttribute('data-client-key', 'SB-Mid-client-huB53_HU9pUQhE3N');
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Midtrans script'));
        document.body.appendChild(script);
      });
      // Open Midtrans payment popup
      window.snap.pay(token, {
        onSuccess: async function(result) {
          alert('Payment success!');
          try {
            // Update order status to 'Sedang Dikemas' after successful payment
            await axios.put(`http://localhost:4000/api/payment/update-status/${order._id}`, {
              status: 'Sedang Dikemas'
            });
            // Refresh orders list
            const ordersRes = await axios.get(`http://localhost:4000/api/payment/user-orders/${order.user}`);
            if (ordersRes.data.success) {
              setCurrentStatus('Sedang Dikemas');
            }
            setPaymentInProgress(false);
          } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
            setPaymentInProgress(false);
          }
        },
        onPending: async function(result) {
          alert('Payment pending!');
          setCurrentStatus('Belum Bayar');
          setPaymentInProgress(false);
        },
        onError: function(result) {
          alert('Payment failed!');
          setPaymentInProgress(false);
        },
        onClose: function() {
          alert('You closed the payment popup without finishing the payment');
          setPaymentInProgress(false);
        }
      });
    } catch (error) {
      console.error('Error during payment:', error);
      alert('Failed to process payment. Please try again.');
      setPaymentInProgress(false);
    }
  };

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
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await handleCompletePayment({
                  _id: orderId,
                  totalAmount: totalAmount,
                  user: orderData.userId,
                  userName: orderData.userName,
                  userEmail: orderData.userEmail
                });
              }}
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

