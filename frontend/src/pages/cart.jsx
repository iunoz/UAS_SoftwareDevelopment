import React, { useState, useEffect, useCallback } from 'react';
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
  const [prevQuantities, setPrevQuantities] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Navigate to home based on UID
  const navigateToHome = () => {
    if (uid) {
      navigate(`/${uid}`);
    } else {
      navigate('/');
    }
  };

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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
    if (newQty < 1) {
      // Jika hasilnya kurang dari 1, hapus item
      await handleDeleteItem(id);
      return;
    } 

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
  const handleInputChange = (id, value) => {
    // Izinkan input kosong agar user bisa menghapus angka
    let newValue = value;
    // Hilangkan leading zero, kecuali jika user memang ingin kosong
    if (newValue.length > 1 && newValue.startsWith("0")) {
      newValue = newValue.replace(/^0+/, "");
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newValue } : item
      )
    );
  };

  // Saat input fokus, simpan kuantitas sebelumnya
  const handleInputFocus = (id, quantity) => {
    setPrevQuantities(qs => ({ ...qs, [id]: quantity }));
  };

  // Saat blur, jika field kosong, kembalikan ke kuantitas sebelumnya
  const handleInputBlur = async (id, value) => {
    if (value === "") {
      // Jika kosong, kembalikan ke kuantitas sebelumnya
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: prevQuantities[id] || 1 } : item
        )
      );
      return;
    }

    let qty = parseInt(value, 10);
    if (isNaN(qty)) {
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: prevQuantities[id] || 1 } : item
        )
      );
      return;
    }

    if (qty === 0) {
      await handleDeleteItem(id);
      return;
    }

    // Update ke backend hanya saat blur
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
    // Hitung total weight dari cart
    const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    navigate(`/${uid}/payment`, {
      state: {
        buyNow: false,
        cartWeight: totalWeight
      }
    });
  };

  // Toggle select all items
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Toggle select single item
  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Delete selected items
  const handleDeleteSelected = async () => {
    for (const id of selectedItems) {
      await handleDeleteItem(id);
    }
    setSelectedItems([]);
    setIsAllSelected(false);
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSelected = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      setIsAllSelected(newSelected.length === cartItems.length);
      return newSelected;
    });
  };

  const handleSelectAll = (checked) => {
    setIsAllSelected(checked);
    setSelectedItems(checked ? cartItems.map(item => item.id) : []);
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
    <div className="cartpage-bg">      <Container className="cartpage-container">
        <h2 className="cart-title">Shopping Cart</h2>
        <div className="d-flex justify-content-between align-items-center">
          <div className="cart-select-all">
            <input
              type="checkbox"
              className="cart-checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              id="selectAll"
            />
            <label htmlFor="selectAll">Select All</label>
          </div>
          <div className="text-end">
            <span className="cart-qty-label">Quantity:</span>
            <span className="cart-qty-value">
              {cartItems.reduce((sum, item) => sum + parseInt(item.quantity || 0, 10), 0)} Items
            </span>
          </div>
        </div>
        <hr className="cart-divider" />
        
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item-row">
              <Row className="cart-item-row-inner align-items-center">
                <Col xs={1}>
                  <input
                    type="checkbox"
                    className="cart-checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    id={`item-${item.id}`}
                  />
                </Col>
                <Col xs={2}>
                  <img src={item.image} alt={item.name} className="cart-img" />
                </Col>
                <Col xs={7} className="cart-item-desc">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">RP. {item.price.toLocaleString()}</div>
                </Col>
                <Col xs={2} className="cart-item-qty">
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
                      value={item.quantity === "" ? "" : item.quantity}
                      onFocus={() => handleInputFocus(item.id, item.quantity)}
                      onBlur={(e) => handleInputBlur(item.id, e.target.value)}
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
            <span className="cart-total-value">
              RP. {cartItems
                .filter(item => selectedItems.includes(item.id))
                .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                .toLocaleString()}
            </span>
          </div>
          <Button 
            className="cart-checkout-btn" 
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
          >
            Checkout
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Cart;