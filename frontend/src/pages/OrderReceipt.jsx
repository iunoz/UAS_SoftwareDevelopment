import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/OrderSummary.css';

const OrderReceipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state;

  useEffect(() => {
    if (!order) {
      // Jika tidak ada data pesanan, redirect ke Order Summary
      navigate('/order-summary', { replace: true });
    }
  }, [order, navigate]);

  if (!order) {
    // Sambil redirect, tampilkan loading
    return <div className="order-summary-container"><div className="order-summary-content">Loading...</div></div>;
  }

  const { cartItems, address, shipping, total } = order;

  // Extract shipping name and price
  let shippingName = shipping;
  let shippingPrice = '';
  if (shipping && shipping.includes('(')) {
    const match = shipping.match(/(.+?)\s*\((RP[ .0-9]+)\)/);
    if (match) {
      shippingName = match[1].trim();
      shippingPrice = match[2];
    }
  }

  return (
    <div className="order-receipt-bg">
      <div className="order-receipt-box">
        <div className="order-receipt-title-row">
          <span className="order-receipt-title">Order Recipe</span>
        </div>
        <hr className="order-receipt-hr" />
        <div className="order-receipt-product-list">
          {cartItems.map((item, idx) => (
            <div key={item.id} className="order-receipt-product-block">
              <div className="order-receipt-product-row1">
                <div className="order-receipt-product-name left-align">{item.name}</div>
                <div className="order-receipt-product-qty">{item.quantity}</div>
              </div>
              <div className="order-receipt-product-row2">
                <div className="order-receipt-product-price left-align">RP. {item.price.toLocaleString('id-ID')}</div>
              </div>
            </div>
          ))}
          <div className="order-receipt-shipping-row">
            <div className="order-receipt-shipping-name left-align">{shippingName}</div>
            <div className="order-receipt-shipping-price">{shippingPrice}</div>
          </div>
          <div className="order-receipt-address-row">
            <div className="order-receipt-address-label left-align">Address</div>
            <div className="order-receipt-address-value">{address}</div>
          </div>
        </div>
        <div className="order-receipt-total-row">
          <span className="order-receipt-total-label">Total Price:</span>
          <span className="order-receipt-total-value">RP. {total.toLocaleString('id-ID')}</span>
        </div>
        <div className="order-receipt-payment-success">PAYMENT SUCCESSFUL</div>
        <div className="order-receipt-checkmark-wrapper">
          <div className="order-receipt-checkmark-circle">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="#f5e6c5" />
              <polyline points="30,55 46,70 72,38" fill="none" stroke="#222d52" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="order-receipt-thankyou" onClick={() => navigate('/')}>Thank You For Your Order!</div>
      </div>
    </div>
  );
};

export default OrderReceipt;
