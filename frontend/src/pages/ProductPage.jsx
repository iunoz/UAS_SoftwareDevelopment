import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import '../styles/ProductPage.css';
import chandelier from '../assets/images/chandelier.jpg';

const ProductPage = () => {
  const [selectedCollection, setSelectedCollection] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const collections = ['ALL', 'MINIMALIST COLLECTION', 'MODERN COLLECTION', 'CLASSIC COLLECTION'];
  const categories = ['ALL', 'HANGING LAMP', 'STANDING LAMP', 'WALL LAMP', 'TABLE LAMP', 'NIGHT LIGHTS'];

  const products = [
    // Modern Collection - Hanging Lamps
    {
      id: 1,
      name: 'Modern Crystal Chandelier',
      price: 2175000,
      collection: 'MODERN COLLECTION',
      category: 'HANGING LAMP',
      image: chandelier
    },
    {
      id: 2,
      name: 'Modern Glass Pendant',
      price: 1960000,
      collection: 'MODERN COLLECTION',
      category: 'HANGING LAMP',
      image: chandelier
    },
    // Modern Collection - Wall Lamps
    {
      id: 3,
      name: 'Modern Wall Sconce',
      price: 850000,
      collection: 'MODERN COLLECTION',
      category: 'WALL LAMP',
      image: chandelier
    },
    {
      id: 4,
      name: 'LED Wall Light',
      price: 920000,
      collection: 'MODERN COLLECTION',
      category: 'WALL LAMP',
      image: chandelier
    },
    // Modern Collection - Table Lamps
    {
      id: 5,
      name: 'Modern Table Light',
      price: 750000,
      collection: 'MODERN COLLECTION',
      category: 'TABLE LAMP',
      image: chandelier
    },
    // Minimalist Collection - Standing Lamps
    {
      id: 6,
      name: 'Minimalist Floor Lamp',
      price: 1250000,
      collection: 'MINIMALIST COLLECTION',
      category: 'STANDING LAMP',
      image: chandelier
    },
    {
      id: 7,
      name: 'Simple Stand Light',
      price: 980000,
      collection: 'MINIMALIST COLLECTION',
      category: 'STANDING LAMP',
      image: chandelier
    },
    // Minimalist Collection - Table Lamps
    {
      id: 8,
      name: 'Minimalist Desk Lamp',
      price: 650000,
      collection: 'MINIMALIST COLLECTION',
      category: 'TABLE LAMP',
      image: chandelier
    },
    // Minimalist Collection - Night Lights
    {
      id: 9,
      name: 'Simple Night Light',
      price: 325000,
      collection: 'MINIMALIST COLLECTION',
      category: 'NIGHT LIGHTS',
      image: chandelier
    },
    // Classic Collection - Hanging Lamps
    {
      id: 10,
      name: 'Victorian Chandelier',
      price: 3250000,
      collection: 'CLASSIC COLLECTION',
      category: 'HANGING LAMP',
      image: chandelier
    },
    {
      id: 11,
      name: 'Antique Crystal Light',
      price: 2850000,
      collection: 'CLASSIC COLLECTION',
      category: 'HANGING LAMP',
      image: chandelier
    },
    // Classic Collection - Wall Lamps
    {
      id: 12,
      name: 'Classic Wall Light',
      price: 1150000,
      collection: 'CLASSIC COLLECTION',
      category: 'WALL LAMP',
      image: chandelier
    },
    // Classic Collection - Table Lamps
    {
      id: 13,
      name: 'Vintage Table Lamp',
      price: 950000,
      collection: 'CLASSIC COLLECTION',
      category: 'TABLE LAMP',
      image: chandelier
    },
    // Classic Collection - Night Lights
    {
      id: 14,
      name: 'Classic Night Light',
      price: 450000,
      collection: 'CLASSIC COLLECTION',
      category: 'NIGHT LIGHTS',
      image: chandelier
    },
    // Modern Collection - Night Lights
    {
      id: 15,
      name: 'Modern Night Lamp',
      price: 375000,
      collection: 'MODERN COLLECTION',
      category: 'NIGHT LIGHTS',
      image: chandelier
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCollection = selectedCollection === 'ALL' || product.collection === selectedCollection;
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCollection && matchesCategory && matchesSearch;
  });

  return (
    <div className="product-page py-5">
      <Container>
        <h1 className="text-center page-title mb-4">OUR PRODUCT</h1>
        
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
          {filteredProducts.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} xl={2}>
              <Card className="h-100 product-item">
                <Card.Img 
                  variant="top" 
                  src={chandelier} 
                  alt={product.name} 
                  className="product-icon"
                />
                <Card.Body className="text-center">
                  <Card.Title className="h6">{product.name}</Card.Title>
                  <Card.Text className="price">
                    Rp {product.price.toLocaleString()}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        <div className="d-flex justify-content-center gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'warning' : 'outline-warning'}
              onClick={() => setCurrentPage(page)}
              className="page-btn"
            >
              {page}
            </Button>
          ))}
          <Button variant="outline-warning" className="page-btn">→</Button>
        </div>

        {/* Bottom Tagline */}
        <p className="text-center bottom-tagline">
          Add a touch of elegance to your space with our stunning lighting pieces
        </p>
      </Container>
    </div>
  );
};

export default ProductPage; 