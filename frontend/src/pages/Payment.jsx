import React, { useState } from 'react';
import '../styles/Payment.css'; // Ganti dengan path CSS yang sesuai
import qrisImage from '../assets/images/qris.png';
import cardImage from '../assets/images/card.jpeg';
import bankImage from '../assets/images/bank.png';

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [address, setAddress] = useState('Jalan Hahahihi RT 18 RW 06');
  const [shipping, setShipping] = useState('JNE – REGULER (RP 50.000)');
  const totalPrice = 2750000;

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  return (
    <div className="payment-container">
      <h2>Payment</h2>
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
          <button className="edit-btn">Edit</button>
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
        <strong>Total Price:</strong> RP {totalPrice.toLocaleString('id-ID')}.
      </div>
      <button className="order-btn">Make Order</button>
    </div>
  );
};

export default Payment;
