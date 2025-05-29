import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { auth } from '../firebase.config';
import '../styles/cart.css';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { uid } = useParams();
  const { fetchCartCount } = useCart();

  // Navigate to home based on UID
  const navigateToHome = () => {
    if (uid) {
      navigate(`/${uid}`);
    } else {
      navigate('/');
    }
  };

  // Fetch cart from backend
  const fetchCart = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const token = await currentUser.getIdToken();
      const res = await axios.get('http://localhost:4000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setCartItems(res.data.cart.map(item => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          quantity: item.quantity
        })));
        calculateTotal(res.data.cart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCartItems([]);
      if (err.response?.status === 401) {
        await auth.signOut();
        navigate('/login');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate total price
  const calculateTotal = (items) => {
    const newTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setTotal(newTotal);
  };

  // Update quantity in backend
  const updateQuantity = async (id, change) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    
    const newQty = item.quantity + change;
    if (newQty < 1) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await axios.put('http://localhost:4000/api/cart/update', {
        productId: id,
        quantity: newQty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchCart();
        fetchCartCount();
        toast.success('Cart updated successfully');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error('Failed to update cart');
      if (err.response?.status === 401) {
        await auth.signOut();
        navigate('/login');
      }
    }
  };

  // Handle direct quantity input
  const handleInputChange = async (id, value) => {
    let qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await axios.put('http://localhost:4000/api/cart/update', {
        productId: id,
        quantity: qty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchCart();
        toast.success('Cart updated successfully');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error('Failed to update quantity');
      if (err.response?.status === 401) {
        await auth.signOut();
        navigate('/login');
      }
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await axios.delete(`http://localhost:4000/api/cart/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchCart();
        fetchCartCount();
        toast.success('Item removed from cart');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error('Failed to remove item');
      if (err.response?.status === 401) {
        await auth.signOut();
        navigate('/login');
      }
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate('/payment');
  };

  if (loading) {
    return (
      <div className="cartpage-bg">
        <Container className="cartpage-container">
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-white">Loading cart items...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cartpage-bg">
        <Container className="cartpage-container">
          <div className="text-center py-5">
            <h2 className="cart-title mb-4">Your Cart is Empty</h2>
            <p className="text-light mb-4">Looks like you haven't added anything to your cart yet.</p>
            <p className="text-light mb-4">Browse our collection and find something you'll love!</p>
            <Button 
              variant="warning" 
              className="mt-3"
              onClick={navigateToHome}
            >
              Start Shopping
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="cartpage-bg">
      <Container className="cartpage-container">
        <h2 className="cart-title global-title">Shopping Cart</h2>
        <div className="d-flex justify-content-between align-items-center">
          <div></div>
          <div className="text-end">
            <span className="cart-qty-label">Quantity:</span>
            <span className="cart-qty-value">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
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
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                      className="cart-qty-num"
                    />
                    <Button
                      variant="dark"
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <FaPlus size={12} />
                    </Button>
                    <Button
                      variant="danger"
                      className="cart-delete-btn ms-2"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <FaTrash size={12} />
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
          <Button className="cart-checkout-btn" onClick={handleCheckout}>
            Checkout
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Cart;