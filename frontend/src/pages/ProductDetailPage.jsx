import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { auth } from '../firebase.config';
import { useCart } from '../contexts/CartContext';
import chandelier from '../assets/images/chandelier.jpg';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { fetchCartCount } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/products/detail/${id}`);
        if (response.data.success) {
          setProduct(response.data.product);
          setError(null);
        } else {
          setError('Failed to fetch product details');
        }
      } catch (err) {
        setError('Error: ' + (err.response?.data?.message || 'Failed to fetch product details'));
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleDirectQuantityChange = (value) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= (product?.quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const calculateTotalPrice = () => {
    return parseInt(product?.price || 0) * quantity;
  };

  const handleAddToCart = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }

      setAddingToCart(true);
      const token = await currentUser.getIdToken();
      
      const response = await axios.post('http://localhost:4000/api/cart/add', {
        productId: product._id,
        quantity: quantity
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setShowSuccessModal(true);
        fetchCartCount(); // Update cart count in navbar
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add to cart';
      toast.error(errorMessage);
      
      if (err.response?.status === 401) {
        await auth.signOut();
        navigate('/login');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const message = `Halo, saya tertarik dengan produk ${product.name}. Apakah masih tersedia?`;
    const whatsappUrl = `https://wa.me/+6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const navigateToCart = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      navigate(`/${currentUser.uid}/cart`);
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Container>
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-white">Loading product details...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Container>
          <div className="text-center py-5">
            <div className="text-danger mb-3">⚠️ {error || 'Product not found'}</div>
            <Button 
              variant="warning" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Container>
        <Row className="product-detail-content">
          <Col md={6} className="product-image-container">
            <img 
              src={product.image || chandelier} 
              alt={product.name}
              className="product-detail-image"
              onError={(e) => {
                e.target.src = chandelier;
                e.target.onerror = null;
              }}
            />
          </Col>
          <Col md={6} className="product-info">
            <div className="product-info-container">
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-description">
                <h3 className="description-title">Deskripsi Produk</h3>
                <p className="description-text">
                  {product.description || 'Deskripsi produk tidak tersedia'}
                </p>
              </div>

              <div className="order-section">
                <div className="quantity-section">
                  <span className="quantity-label">Quantity</span>
                  <div className="quantity-controls-wrapper">
                    <div className="quantity-controls">
                      <Button 
                        variant="link" 
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="quantity-btn"
                      >
                        -
                      </Button>
                      <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={(e) => handleDirectQuantityChange(e.target.value)}
                        className="quantity-number"
                      />
                      <Button 
                        variant="link" 
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.quantity}
                        className="quantity-btn"
                      >
                        +
                      </Button>
                    </div>
                    <div className="stock-info">
                      Stock: {product.quantity} units
                    </div>
                    <div className="product-price">
                      Rp {calculateTotalPrice().toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="action-buttons-container">
                  <div className="main-buttons">
                    <Button 
                      variant="warning" 
                      className="buy-now-btn"
                      disabled={product.quantity < 1}
                    >
                      Buy Now
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      className="add-cart-btn"
                      onClick={handleAddToCart}
                      disabled={addingToCart || product.quantity < 1}
                    >
                      <FaShoppingCart /> {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </div>

                  <div className="vertical-separator"></div>

                  <div className="whatsapp-section">
                    <span className="order-label">Or order now</span>
                    <Button 
                      variant="outline-success" 
                      className="whatsapp-btn"
                      onClick={handleWhatsAppOrder}
                    >
                      <FaWhatsapp size={24} /> WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white border-bottom-0">
          <Modal.Title>Added to Cart!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          {product && (
            <div className="d-flex align-items-center">
              <img 
                src={product.image || chandelier} 
                alt={product.name}
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.src = chandelier;
                  e.target.onerror = null;
                }}
              />
              <div className="ms-3">
                <h5>{product.name}</h5>
                <p className="text-warning">Rp {product.price.toLocaleString()}</p>
                <p className="text-light mb-0">Quantity: {quantity}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark text-white border-top-0">
          <Button variant="outline-light" onClick={() => setShowSuccessModal(false)}>
            Continue Shopping
          </Button>
          <Button variant="warning" onClick={navigateToCart}>
            View Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductDetailPage; 