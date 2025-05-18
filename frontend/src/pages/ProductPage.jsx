import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
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
    <div className="product-page">
      <Container>
        <h1 className="page-title">OUR PRODUCT</h1>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-button">Search</button>
        </div>

        {/* Collection Filter */}
        <div className="filter-section">
          <h2>Collection</h2>
          <div className="filter-buttons">
            {collections.map((collection) => (
              <button
                key={collection}
                className={`filter-btn ${selectedCollection === collection ? 'active' : ''}`}
                onClick={() => setSelectedCollection(collection)}
              >
                {collection}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Filter */}
        <div className="filter-section">
          <h2>Categories</h2>
          <div className="filter-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-item">
              <img src={chandelier} alt={product.name} className="product-icon" />
              <h3>{product.name}</h3>
              <p className="price">Rp {product.price.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button className="page-btn">→</button>
        </div>

        {/* Bottom Tagline */}
        <p className="bottom-tagline">
          Add a touch of elegance to your space with our stunning lighting pieces
        </p>
      </Container>
    </div>
  );
};

export default ProductPage; 