import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OrderSummary.css';
import { auth } from '../firebase.config';
import axios from 'axios';

const OrderSummary = () => {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState('');
  const [shipping, setShipping] = useState('JNE – REGULER (RP 50.000)');
  const [payment, setPayment] = useState('QRIS');
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }
        const token = await currentUser.getIdToken();
        // Fetch cart
        const cartRes = await axios.get('https://uassoftwaredevelopment-production.up.railway.app/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (cartRes.data.success) {
          setCartItems(cartRes.data.cart.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity
          })));
          const totalPrice = cartRes.data.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          setTotal(totalPrice);
        }
        // Fetch address
        const userRes = await axios.get(`https://uassoftwaredevelopment-production.up.railway.app/api/user/${currentUser.uid}`);
        if (userRes.data.success) {
          setAddress(userRes.data.user.address || '');
        }
      } catch (err) {
        setCartItems([]);
        setTotal(0);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div className="order-summary-container">
      <h2 className="global-title">Payment Confirmation</h2>
      <hr className="order-summary-hr" />
      <div className="order-summary-content">
        {/* Product List */}
        {cartItems.map((item, idx) => (
          <div key={item.id} className="order-summary-product-block">
            <div className="order-summary-product-row1">
              <div className="order-summary-product-name left-align">{item.name}</div>
              <div className="order-summary-product-qty">{item.quantity}</div>
            </div>
            <div className="order-summary-product-row2">
              <div className="order-summary-product-price left-align">RP. {item.price.toLocaleString('id-ID')}</div>
            </div>
          </div>
        ))}
        {/* Info Table */}
        <div className="order-summary-info-table">
          <div className="order-summary-info-row">
            <div className="order-summary-info-label">Address</div>
            <div className="order-summary-info-value">{address}</div>
          </div>
          <div className="order-summary-info-row">
            <div className="order-summary-info-label">Shipping Company</div>
            <div className="order-summary-info-value">{shipping}</div>
          </div>
          <div className="order-summary-info-row">
            <div className="order-summary-info-label">Payment</div>
            <div className="order-summary-info-value">{payment}</div>
          </div>
        </div>
        {/* Total & Confirm */}
        <div className="order-summary-total">
          Total Price:  RP. {total.toLocaleString('id-ID')}
        </div>
        <button
          className="order-summary-confirm-btn"
          onClick={() =>
            navigate('/order-receipt', {
              state: { cartItems, address, shipping, payment, total }
            })
          }
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
