import React from 'react';
import '../styles/HomePage.css';

const HomePage = () => {
  const lightingProducts = [
    {
      id: 1,
      image: '/images/spiral-chandelier.jpg',
      name: 'Modern Spiral Chandelier',
      price: 599.99
    },
    {
      id: 2,
      image: '/images/flower-chandelier.jpg',
      name: 'Floral Glass Chandelier',
      price: 799.99
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>DECOR LIGHTING</h1>
          <p className="hero-quote">In the silence of the dark, a lamp speaks softly, telling stories, casting moods, and painting the unseen</p>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="featured-products">
        <div className="products-grid">
          <div className="product-showcase">
            <img src="/images/chandelier.jpg" alt="Spiral Chandelier" className="main-product-image" />
          </div>
          <div className="product-gallery">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="gallery-item">
                <img src="/images/chandelier.jpg" alt={`Lighting Design ${index}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Collection */}
      <section className="product-collection">
        <h2>Our Collection</h2>
        <div className="collection-grid">
          {lightingProducts.map(product => (
            <div key={product.id} className="collection-item">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <h3>{product.name}</h3>
              <p className="price">${product.price}</p>
              <button className="shop-now-btn">Shop Now</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 