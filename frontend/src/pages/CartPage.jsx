import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Modern Crystal Bloom Chandelier',
      price: 900000,
      image: '/assets/chandelier.png',
      quantity: 1,
    },
    {
      id: 2,
      name: 'Modern Crystal Bloom Chandelier',
      price: 900000,
      image: '/assets/chandelier.png',
      quantity: 1,
    },
    {
      id: 3,
      name: 'Modern Crystal Bloom Chandelier',
      price: 900000,
      image: '/assets/chandelier.png',
      quantity: 1,
    },
  ]);

  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cartItems]);

  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  return (
    <div className="cartpage-bg">
      <Container className="cartpage-container">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="cart-title">Shoping Cart</h2>
          <div className="text-end">
            <span className="cart-qty-label">Quantity:</span>
            <span className="cart-qty-value">{cartItems.length} Items</span>
          </div>
        </div>
        
        <hr className="cart-divider" />
        
        <div className="cart-items-list">
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
                    <span className="cart-qty-num">{item.quantity}</span>
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

export default CartPage;