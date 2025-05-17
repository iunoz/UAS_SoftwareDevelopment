/* eslint-disable no-unused-vars */
import React from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { motion } from 'framer-motion';
import '../styles/HomePage.css';
import chandelier from '../assets/images/chandelier.jpg';

const HomePage = () => {
  const lightingProducts = [
    {
      id: 1,
      image: chandelier,
      name: 'Modern Spiral Chandelier',
      price: 599.99,
      category: 'Chandeliers'
    },
    {
      id: 2,
      image: chandelier,
      name: 'Floral Glass Chandelier',
      price: 799.99,
      category: 'Chandeliers'
    },
    {
      id: 3,
      image: chandelier,
      name: 'Minimalist Pendant Light',
      price: 299.99,
      category: 'Pendant Lights'
    },
    {
      id: 4,
      image: chandelier,
      name: 'Art Deco Wall Sconce',
      price: 199.99,
      category: 'Wall Lights'
    },
    {
      id: 5,
      image: chandelier,
      name: 'Industrial Floor Lamp',
      price: 449.99,
      category: 'Floor Lamps'
    },
    {
      id: 6,
      image: chandelier,
      name: 'Crystal Table Lamp',
      price: 249.99,
      category: 'Table Lamps'
    }
  ];

  const carouselItems = [
    {
      id: 1,
      image: chandelier,
      title: "Modern Elegance",
      description: "Transform your space with our signature chandelier collection. Handcrafted with precision and designed for luxury living.",
    },
    {
      id: 2,
      image: chandelier,
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
          <Row className="g-4">
            {lightingProducts.map((product, index) => (
              <Col md={6} lg={4} key={product.id}>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-100 bg-dark text-white border-0 shadow product-card">
                    <div className="card-img-wrapper">
                      <Card.Img variant="top" src={product.image} alt={product.name} className="img-fluid" />
                      <div className="card-overlay">
                        <Button variant="warning" className="view-details-btn">View Details</Button>
                      </div>
                    </div>
                    <Card.Body className="text-center">
                      <div className="category-badge">{product.category}</div>
                      <Card.Title className="h4 mb-3">{product.name}</Card.Title>
                      <Card.Text className="text-warning fs-4 fw-bold">
                        ${product.price}
                      </Card.Text>
                      <Button variant="outline-warning" className="w-100 mt-3">
                        Add to Cart
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </motion.section>
    </div>
  );
};

export default HomePage; 