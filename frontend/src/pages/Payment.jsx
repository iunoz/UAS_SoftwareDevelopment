import React, { useState, useEffect } from 'react';
import '../styles/Payment.css'; // Ganti dengan path CSS yang sesuai
import qrisImage from '../assets/images/qris.png';
import cardImage from '../assets/images/card.jpeg';
import bankImage from '../assets/images/bank.png';
import { auth } from '../firebase.config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [address, setAddress] = useState('Jalan Hahahihi RT 18 RW 06');
  const [shipping, setShipping] = useState('JNE – REGULER (RP 50.000)');
  const [cartTotal, setCartTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }
        const token = await currentUser.getIdToken();
        // Fetch cart
        const res = await axios.get('http://localhost:4000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const total = res.data.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          setCartTotal(total);
        }
        // Fetch user profile for address
        const userRes = await axios.get(`http://localhost:4000/api/user/${currentUser.uid}`);
        if (userRes.data.success) {
          setAddress(userRes.data.user.address || '');
        }
      } catch (err) {
        setCartTotal(0);
      }
    };
    fetchCart();
  }, [navigate]);

  // Update address logic (reusable from ProfilePage)
  const handleAddressUpdate = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }
      const res = await axios.put(`http://localhost:4000/api/user/${currentUser.uid}/update-address`, {
        address
      });
      if (res.data.success) {
        // Optionally show a toast or feedback
      }
    } catch (error) {
      // Optionally show error feedback
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  return (
    <div className="payment-container">
      <h2 className="global-title">Payment</h2>
      <hr />
      <div className="payment-methods">
        <div
          className={`payment-option ${selectedMethod === 'QRIS' ? 'selected' : ''}`}
          onClick={() => handleMethodSelect('QRIS')}
        >
          <img src={qrisImage} alt="QRIS" />
          <span className="payment-label">QRIS</span>
        </div>
        <div
          className={`payment-option ${selectedMethod === 'CARD' ? 'selected' : ''}`}
          onClick={() => handleMethodSelect('CARD')}
        >
          <img src={cardImage} alt="Card" />
          <span className="payment-label">CARD</span>
        </div>
        <div
          className={`payment-option ${selectedMethod === 'BANK' ? 'selected' : ''}`}
          onClick={() => handleMethodSelect('BANK')}
        >
          <img src={bankImage} alt="Bank" />
          <span className="payment-label">BANK</span>
        </div>
      </div>

      <div className="payment-form-grid">
        {/* Baris 1: Address */}
        <div className="form-label-cell">
          Address
        </div>
        <div className="form-input-cell address-input-group">
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="address-input"
          />
          <button className="edit-btn" onClick={handleAddressUpdate}>Edit</button>
        </div>
        {/* Baris 2: Shipping Company */}
        <div className="form-label-cell">
          Shipping Company
        </div>
        <div className="form-input-cell">
          <select value={shipping} onChange={e => setShipping(e.target.value)}>
            <option>JNE – REGULER (RP 50.000)</option>
            <option>J&T – KILAT (RP 60.000)</option>
            <option>SiCepat – BEST (RP 55.000)</option>
          </select>
        </div>
        {/* Total Price dan Order Button tetap di bawah grid */}
      </div>
      <div className="total-price">
        <strong>Total Price:</strong> RP {cartTotal.toLocaleString('id-ID')}
      </div>
      <button className="order-btn" onClick={() => navigate('/order-summary')}>
        Make Order
      </button>
    </div>
  );
};

export default Payment;
