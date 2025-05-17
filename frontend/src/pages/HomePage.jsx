import React from 'react';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to E-Shop</h1>
          <p>Discover amazing products at great prices</p>
          <button className="cta-button">Shop Now</button>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {/* Product cards will be mapped here */}
          <div className="product-card">
            <div className="product-image">
              {/* Product image will go here */}
            </div>
            <h3>Product Name</h3>
            <p>$99.99</p>
            <button className="add-to-cart">Add to Cart</button>
          </div>
          {/* More product cards will be added dynamically */}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 