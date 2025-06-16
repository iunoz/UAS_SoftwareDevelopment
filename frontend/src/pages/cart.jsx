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
      const res = await axios.get('https://uassoftwaredevelopment-production.up.railway.app/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        // Filter out items with null product to avoid errors
        const validCartItems = res.data.cart.filter(item => item.product != null);
        const mappedItems = validCartItems.map(item => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          quantity: Number(item.quantity), // Pastikan quantity selalu number
          weight: item.product.weight,
          stock: Number(item.product.stock) // Pastikan stock selalu number
        }));
        console.log('Cart Items:', mappedItems); // Untuk debugging
        setCartItems(mappedItems);
        calculateTotal(validCartItems);
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
    // Defensive: filter items with product not null
    const validItems = items.filter(item => item.product != null);
    const newTotal = validItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setTotal(newTotal);
  };

  // Update quantity in backend
  const updateQuantity = async (id, change) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    
    const newQty = item.quantity + change;
    console.log('Update Quantity:', { currentQty: item.quantity, stock: item.stock, newQty }); // Debug

    if (newQty < 1) {
      await handleDeleteItem(id);
      return;
    }
    
    if (newQty > item.stock) {
      toast.error(`Stock tidak mencukupi. Maksimal ${item.stock}`);
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await axios.put('https://uassoftwaredevelopment-production.up.railway.app/api/cart/update', {
        productId: id,
        quantity: newQty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Update state lokal dulu
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === id ? { ...item, quantity: newQty } : item
          )
        );
        
        // Lalu fetch untuk memastikan sinkronisasi
        await fetchCart();
        fetchCartCount();
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
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    let newValue = Number(value);
    const maxStock = Number(item.stock);

    // Batasi input agar tidak melebihi stok
    if (!isNaN(newValue) && newValue > maxStock) {
      newValue = maxStock;
      toast.error(`Stock tidak mencukupi. Maksimal ${maxStock}`);
    }
    if (newValue < 1 || isNaN(newValue)) newValue = 1;

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

    const item = cartItems.find(i => i.id === id);
    if (item && item.stock !== undefined && qty > item.stock) {
      toast.error(`Stock tidak mencukupi. Maksimal ${item.stock}`);
      setCartItems(items =>
        items.map(itm =>
          itm.id === id ? { ...itm, quantity: item.stock } : itm
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
      const response = await axios.put('https://uassoftwaredevelopment-production.up.railway.app/api/cart/update', {
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
      const response = await axios.delete(`https://uassoftwaredevelopment-production.up.railway.app/api/cart/remove/${id}`, {
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
    // Filter item yang dipilih saja
    const selectedProducts = cartItems.filter(item => selectedItems.includes(item.id));
    
    // Hitung total weight dari item yang dipilih
    const totalWeight = selectedProducts.reduce((sum, item) => {
      const weight = Number(item.weight) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (weight * quantity);
    }, 0);
    
    navigate(`/${uid}/payment`, {
      state: {
        buyNow: false,
        cartWeight: totalWeight,
        selectedProducts: selectedProducts.map(item => ({
          ...item,
          weight: Number(item.weight) || 0  // Pastikan weight adalah number
        }))
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
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus size={12} />
                    </Button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onFocus={() => handleInputFocus(item.id, item.quantity)}
                      onBlur={(e) => handleInputBlur(item.id, e.target.value)}
                      onChange={(e) => {
                        let newValue = Number(e.target.value);
                        if (newValue > item.stock) {
                          newValue = item.stock;
                          toast.error(`Stock tidak mencukupi. Maksimal ${item.stock}`);
                        }
                        if (newValue < 1 || isNaN(newValue)) newValue = 1;
                        handleInputChange(item.id, newValue);
                      }}
                      className="cart-qty-num"
                    />
                    <Button
                      variant="dark"
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <FaPlus size={12} />
                    </Button>
                    <Button                      variant="danger"
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