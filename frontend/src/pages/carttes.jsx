import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cartes = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Ambil token dari localStorage/sessionStorage
  const getToken = () => {
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe) {
      return localStorage.getItem('token');
    } else {
      return sessionStorage.getItem('token');
    }
  };

  // Fetch cart dari backend
  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(res.data.cart.map(item => ({
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity
      })));
    } catch (err) {
        console.error('Error fetching cart:', err);
        setCartItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cartItems]);

  // Update quantity di backend
  const updateQuantity = async (id, change) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    const newQty = item.quantity + change;
    const token = getToken();
    try {
      await axios.put('/api/cart/update', {
        productId: id,
        quantity: newQty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
        console.error('Error updating quantity:', err);
    }
  };

  // Edit langsung quantity
  const handleInputChange = async (id, value) => {
    let qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    const token = getToken();
    try {
      await axios.put('/api/cart/update', {
        productId: id,
        quantity: qty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
        console.error('Error updating quantity:', err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="cartpage-bg">
      <Container className="cartpage-container">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="cart-title">Shopping Cart</h2>
          <div className="text-end">
            <span className="cart-qty-label">Quantity:</span>
            <span className="cart-qty-value">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
          </div>
        </div>
        <hr className="cart-divider" />
        <div className="cart-items-list">
          {cartItems.length === 0 && <div>Your cart is empty.</div>}
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item-row">
              <Row className="cart-item-row-inner align-items-center">
                <Col xs={2}>
                  <img src={item.image} alt={item.name} className="cart-img" />
                </Col>
                <Col xs={7} className="cart-item-desc">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">RP. {item.price.toLocaleString()}</div>
                </Col>
                <Col xs={3} className="cart-item-qty">
                  <div className="cart-qty-controls">
                    <Button
                      variant="dark"
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <FaMinus size={12} />
                    </Button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleInputChange(item.id, e.target.value)}
                      style={{ width: 40, textAlign: 'center', margin: '0 5px' }}
                    />
                    <Button
                      variant="dark"
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <FaPlus size={12} />
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          ))}
        </div>
        <div className="cart-bottom-row">
          <div>
            <span className="cart-total-text">Total Price:</span>
            <span className="cart-total-value">RP. {total.toLocaleString()}</span>
          </div>
          <Button className="cart-checkout-btn" onClick={() => navigate('/payment')}>
            Checkout
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Cartes;