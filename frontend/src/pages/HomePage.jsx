/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/HomePage.css';
import chandelier from '../assets/images/chandelier.jpg';
import Lampubrok from '../assets/images/Lampubrok.jpg';
import Lampubrok1 from '../assets/images/Lampubrok1.jpg';
import handyman from '../assets/images/handyman.jpg';
import delivery from '../assets/images/delivery.jpg';
import consultation from '../assets/images/consultation.jpg';
import store from '../assets/images/store.jpg';
import pickup from '../assets/images/pickup.jpg';
import { toast } from 'react-toastify';
import { auth } from '../firebase.config';
import { useCart } from '../contexts/CartContext';
// Importing the necessary components and styles
const HomePage = () => {
  const { uid } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('uassoftwaredevelopment-production-b783.up.railway.app/api/products');
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError('Failed to fetch products');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  const carouselItems = [
    {
      id: 1,
      image: Lampubrok, // Ganti dengan gambar baru
      title: "Modern Elegance",
      description: "Transform your space with our signature chandelier collection. Handcrafted with precision and designed for luxury living.",
    },
    {
      id: 2,
      image: Lampubrok1, // Ganti dengan gambar baru
      title: "Contemporary Class",
      description: "Minimalist designs meet maximum impact. Perfect for modern homes and sophisticated office spaces.",
    },
    {
      id: 3,
      image: chandelier,
      title: "Timeless Beauty",
      description: "Where traditional craftsmanship meets modern innovation. Create lasting impressions with our premium lighting solutions.",
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scrollToCollection = () => {
    const element = document.getElementById('our-collection');
    element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = async (product) => {
    // Cek login: auth.currentUser dan uid di storage
    const currentUser = auth.currentUser;
    let uid = null;
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      uid = user?.uid;
    } else {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      uid = user?.uid;
    }

    if (!currentUser || !uid) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      const token = await currentUser.getIdToken();
      const response = await axios.post('uassoftwaredevelopment-production-b783.up.railway.app/api/cart/add', {
        productId: product._id,
        quantity: 1
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAddedProduct(product);
        setShowSuccessModal(true);
        toast.success('Product added to cart successfully!');
        fetchCartCount();
      }
    } catch (err) {
      console.error('Add to cart error details:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
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

  const navigateToCart = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      navigate(`/${currentUser.uid}/cart`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section with Parallax */}
      <motion.section 
        className="hero-section d-flex align-items-center justify-content-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Container className="text-center">
          <motion.div 
            className="hero-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="display-1 fw-bold hero-title">DECOR LIGHTING</h1>
            <p className="hero-quote lead fs-4 mt-4">In the silence of the dark, a lamp speaks softly, telling stories, casting moods, and painting the unseen</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-warning btn-lg mt-4 px-5"
              onClick={scrollToCollection}
            >
              Explore Collection
            </motion.button>
          </motion.div>
        </Container>
      </motion.section>

      {/* Updated Carousel Section */}
      <section className="featured-products py-5">
        <Container fluid className="px-0">
          <motion.h2 
            className="text-center text-warning display-4 mb-5"
            {...fadeInUp}
          >
            Featured Designs
          </motion.h2>
          <Carousel 
            className="product-carousel" 
            indicators={false}
            interval={3000}
            controls={true}
          >
            {carouselItems.map((item) => (
              <Carousel.Item key={item.id}>
                <div className="carousel-image-container">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="carousel-image"
                  />
                  <div className="carousel-description">
                    <h3 className="carousel-title">{item.title}</h3>
                    <p className="carousel-text">{item.description}</p>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>

      {/* Product Collection */}
      <motion.section 
        id="our-collection"
        className="product-collection py-5"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <Container>
          <motion.h2 
            className="text-center text-warning display-4 mb-5"
            {...fadeInUp}
          >
            Our Collection
          </motion.h2>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-danger">{error}</div>
          ) : (
            <Row className="g-4">
              {products.slice(0, 6).map((product) => (
                <Col md={6} lg={4} key={product._id}>
                  <motion.div
                    variants={fadeInUp}
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-100 bg-dark text-white border-0 shadow product-card">
                      <div className="card-img-wrapper">
                        <Card.Img variant="top" src={product.image} alt={product.name} className="img-fluid" />
                        <div className="card-overlay">
                          <Button 
                            variant="warning" 
                            className="view-details-btn"
                            onClick={() => navigate(uid ? `/${uid}/product/${product._id}` : `/product/${product._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      <Card.Body className="text-center">
                        <div className="category-badge">{product.category}</div>
                        <Card.Title className="product-title">{product.name}</Card.Title>
                        <Card.Text className="product-price">
                          Rp {product.price.toLocaleString()}
                        </Card.Text>
                        <Button 
                          variant="outline-warning" 
                          className="w-100 mt-3"
                          onClick={() => handleAddToCart(product)}
                          disabled={addingToCart}
                        >
                          {addingToCart ? 'Adding...' : 'Add to Cart'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
          <div className="text-center mt-5">
            <Link to={uid ? `/${uid}/products` : "/products"}>
              <Button variant="outline-warning" className="see-all-btn px-4 py-2 mb-5">
                SEE ALL PRODUCT →
              </Button>
            </Link>
            <motion.div 
              className="service-quality-text mt-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2>Unique Lighting Selections,</h2>
              <h2>Enhanced by Unrivaled Service</h2>
              <h2>Quality</h2>
            </motion.div>
          </div>
        </Container>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        className="statistics-section py-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Container>
          <div className="statistics-container">
            <div className="stat-item">
              <div className="stat-number">15+</div>
              <div className="stat-label">Years Experience</div>
              <div className="stat-description">
                Serving excellence in lighting solutions since our inception
              </div>
              <div className="stat-divider"></div>
            </div>

            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Happy Customers</div>
              <div className="stat-description">
                Trust and satisfaction from our valued clients
              </div>
              <div className="stat-divider"></div>
            </div>

            <div className="stat-item">
              <div className="stat-number">4.9</div>
              <div className="stat-rating">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <div className="stat-label">Rating</div>
              <div className="stat-description">
                Top-rated on Shopee & Tokopedia
              </div>
            </div>
          </div>
        </Container>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        className="services-section py-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Container>
          <motion.h2 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Layanan Terbaik untuk Memberikan<br />Anda Kenyamanan Maksimal
          </motion.h2>
          <div className="services-dashboard-grid">
            {/* Baris pertama: 2 card di tengah */}
            <div className="service-card-dashboard" style={{ gridColumn: '2 / 4', gridRow: '1' }}>
              <div className="service-image"><img src={delivery} alt="Pengiriman" /></div>
              <div className="service-text">
                <h3>PENGIRIMAN</h3>
                <p>Mengantar belanjaan anda ke tempat tujuan</p>
              </div>
            </div>
            <div className="service-card-dashboard" style={{ gridColumn: '4 / 6', gridRow: '1' }}>
              <div className="service-image"><img src={consultation} alt="Konsultasi" /></div>
              <div className="service-text">
                <h3>KONSULTASI</h3>
                <p>Kami akan siap membantu apa yang diperlukan</p>
              </div>
            </div>
            {/* Baris kedua: 3 card, tumpang tindah setengah */}
            <div className="service-card-dashboard" style={{ gridColumn: '1 / 3', gridRow: '2' }}>
              <div className="service-image"><img src={pickup} alt="Pick and Collect" /></div>
              <div className="service-text">
                <h3>PICK AND COLLECT</h3>
                <p>Memesan Produk di Online atau WA dan ambil di toko</p>
              </div>
            </div>
            <div className="service-card-dashboard" style={{ gridColumn: '3 / 5', gridRow: '2' }}>
              <div className="service-image"><img src={store} alt="Kunjungi Showroom" /></div>
              <div className="service-text">
                <h3>KUNJUNGI SHOWROOM</h3>
                <p>Visit our showroom untuk lihat koleksi lampu gantung terbaru</p>
              </div>
            </div>
            <div className="service-card-dashboard" style={{ gridColumn: '5 / 7', gridRow: '2' }}>
              <div className="service-image"><img src={handyman} alt="Pemasangan" /></div>
              <div className="service-text">
                <h3>PEMASANGAN</h3>
                <p>Kami dapat membantu pemasangan satu perabotan</p>
              </div>
            </div>
          </div>
          <motion.div 
            className="text-center mt-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="elegance-text">
              Add a touch of elegance to your<br />space with our stunning lighting pieces
            </h3>
          </motion.div>
        </Container>
      </motion.section>

      {/* Footer Section */}
      <footer className="footer-section">
        <Container>
          <div className="footer-content">
            <h2>CONTACT US</h2>
            
            <div className="contact-grid">
              <div className="contact-card email">
                <h3>Email</h3>
                <div className="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <p>decorlighting@gmail.com</p>
              </div>

              <div className="contact-card whatsapp">
                <h3>WhatsApp</h3>
                <div className="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"/>
                  </svg>
                </div>
                <p>6208888888888</p>
              </div>

              <div className="contact-card instagram">
                <h3>Instagram</h3>
                <div className="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.509-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z"/>
                  </svg>
                </div>
                <p>@DecorLighting</p>
              </div>
            </div>

            <div className="footer-copyright">
              © 2024. Decor Lighting
            </div>
          </div>
        </Container>
      </footer>

      {/* Success Modal */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)} 
        centered
        className="success-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Added to Cart!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addedProduct && (
            <div className="d-flex align-items-center">
              <img 
                src={addedProduct.image || chandelier} 
                alt={addedProduct.name}
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.src = chandelier;
                  e.target.onerror = null;
                }}
              />
              <div className="ms-3">
                <h5 className="product-name">{addedProduct.name}</h5>
                <p className="product-price">Rp {addedProduct.price.toLocaleString()}</p>
                <p className="product-quantity mb-0">Quantity: 1</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-light" 
            onClick={() => setShowSuccessModal(false)}
            className="btn-continue"
          >
            Continue Shopping
          </Button>
          <Button 
            variant="warning" 
            onClick={navigateToCart}
            className="btn-view-cart"
          >
            View Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomePage;