import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProductPage.css';
import chandelier from '../assets/images/chandelier.jpg';

const ProductPage = () => {
  const navigate = useNavigate();
  const [selectedCollection, setSelectedCollection] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const collections = ['ALL', 'MINIMALIST COLLECTION', 'MODERN COLLECTION', 'CLASSIC COLLECTION'];
  const categories = ['ALL', 'HANGING LAMP', 'STANDING LAMP', 'WALL LAMP', 'TABLE LAMP', 'NIGHT LIGHTS'];

    // Ambil uid dari localStorage/sessionStorage jika ada
  let userUid = null;
  const rememberMe = localStorage.getItem('rememberMe');
  if (rememberMe) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userUid = user?.uid;
  } else {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    userUid = user?.uid;
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/products');
        if (response.data.success) {
          setProducts(response.data.products);
          setError(null);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        setError('Error: ' + (err.response?.data?.message || 'Failed to fetch products'));
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCollection = selectedCollection === 'ALL' || product.collection === selectedCollection;
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCollection && matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="product-page py-5">
        <Container>
          <div className="text-center">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-white">Loading products...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-page py-5">
        <Container>
          <div className="text-center">
            <div className="text-danger mb-3">⚠️ {error}</div>
            <Button 
              variant="warning" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="product-page py-5">
      <Container className="mt-5 pt-4">
        <h1 className="text-center page-title mb-5">OUR PRODUCT</h1>
        
        {/* Search Bar */}
        <Row className="justify-content-center mb-4">
          <Col md={8} lg={6}>
            <Form className="d-flex">
              <Form.Control
                type="text"
                placeholder="Search Here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input me-2"
              />
              <Button variant="warning" className="search-button">Search</Button>
            </Form>
          </Col>
        </Row>

        {/* Collection Filter */}
        <div className="filter-section mb-4">
          <h2 className="text-white mb-3">Collection</h2>
          <div className="d-flex flex-wrap gap-2">
            {collections.map((collection) => (
              <Button
                key={collection}
                variant={selectedCollection === collection ? 'warning' : 'outline-warning'}
                onClick={() => setSelectedCollection(collection)}
                className="text-nowrap"
              >
                {collection}
              </Button>
            ))}
          </div>
        </div>

        {/* Categories Filter */}
        <div className="filter-section mb-4">
          <h2 className="text-white mb-3">Categories</h2>
          <div className="d-flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'warning' : 'outline-warning'}
                onClick={() => setSelectedCategory(category)}
                className="text-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <Row className="g-4 mb-4">
          {filteredProducts.length === 0 ? (
            <Col xs={12}>
              <div className="text-center text-white py-5">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
              </div>
            </Col>
          ) : (
            filteredProducts.map((product) => (
              <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
                <Card 
                  className="h-100 product-item"
                  onClick={() => {
                    if (userUid) {
                      navigate(`/${userUid}/product/${product._id}`);
                    } else {
                      navigate(`/product/${product._id}`);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-img-container">
                    <Card.Img 
                      variant="top" 
                      src={product.image || chandelier} 
                      alt={product.name} 
                      className="product-icon"
                      onError={(e) => {
                        e.target.src = chandelier;
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <Card.Body>
                    <div>
                      <Card.Title className="h6">{product.name}</Card.Title>
                      <Card.Text className="mb-2">{product.category}</Card.Text>
                    </div>
                    <Card.Text className="price">
                      Rp {parseInt(product.price).toLocaleString()}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>

        {/* Pagination - Only show if there are products */}
        {filteredProducts.length > 0 && (
          <div className="d-flex justify-content-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'warning' : 'outline-warning'}
                onClick={() => setCurrentPage(page)}
                className="page-btn"
              >
                {page}
              </Button>
            ))}
          </div>
        )}

        {/* Bottom Tagline */}
        <p className="text-center bottom-tagline">
          Add a touch of elegance to your space with our stunning lighting pieces
        </p>
      </Container>
    </div>
  );
};

export default ProductPage; 