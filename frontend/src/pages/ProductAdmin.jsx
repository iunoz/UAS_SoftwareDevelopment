import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/ProductAdmin.css';
import chandelier from '../assets/images/chandelier.jpg';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const initialProduct = {
  name: 'Modern Crystal Bloom Chandelier',
  quantity: 59,
  price: 900000,
  details: [
    { label: 'Bahan', value: 'Kristal premium & stainless steel' },
    { label: 'Warna', value: 'Silver' },
    { label: 'Diameter', value: '80 cm' },
    { label: 'Tinggi (adjustable)', value: '60 - 120 cm' },
    { label: 'Sumber Cahaya', value: 'LED E14 (8-12 bohlam, tergantung varian)' },
    { label: 'Daya', value: '40W - 60W' },
    { label: 'Tegangan', value: 'AC 220V - 240V' },
    { label: 'Fitur Tambahan', value: 'Dimmable (dengan remote), hemat energi' },
  ],
  category: 'Hanging Lamp',
  collection: 'Modern Collection',
};

const categories = [
  'Hanging Lamp', 'Ceiling Lamp', 'Wall Lamp', 'Standing Lamp', 'Table Lamp', 'Uncategorized'
];
const collections = [
  'Minimalist Collection', 'Modern Collection', 'Classic Collection'
];

const ProductAdmin = () => {
  const [product, setProduct] = useState(initialProduct);
  const [editImage, setEditImage] = useState(false);
  const [editName, setEditName] = useState(false);
  const [editDetails, setEditDetails] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(product.category);
  const [selectedCollection, setSelectedCollection] = useState(product.collection);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Quantity and Price logic
  const handleQtyChange = (delta) => {
    setProduct((prev) => {
      let newQty = prev.quantity + delta;
      if (newQty < 0) newQty = 0;
      const basePrice = 900000;
      const newPrice = basePrice + (newQty - 59) * 50000;
      return { ...prev, quantity: newQty, price: newPrice };
    });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setProduct((prev) => ({ ...prev, image: file }));
    }
    setEditImage(false);
  };

  // Handle name change
  const handleNameChange = (e) => {
    setProduct({ ...product, name: e.target.value });
  };

  // Handle description change
  const handleDescriptionChange = (e) => {
    const lines = e.target.value.split('\n');
    setProduct({
      ...product,
      details: lines.map(line => {
        const [label, ...rest] = line.split(':');
        return { label: label?.trim() || '', value: rest.join(':').trim() };
      })
    });
  };

  return (
    <div className="dashboard-admin">
      <AdminNavbar />
      <div className="dashboard-content product-admin-content">
        <h1 className="product-title">PRODUCT</h1>
        <button
          className="add-product-btn"
          style={{ marginLeft: 0, marginBottom: '1.5rem', display: 'block' }}
          onClick={() => navigate('/addproduct')}
        >
          Add Product
        </button>
        <div className="product-card">
          <div className="product-card-header">
            <div className="product-image-edit">
              <img
                src={imagePreview || chandelier}
                alt="chandelier"
                className="product-image"
              />
              <button className="edit-btn circle small" onClick={() => setEditImage((v) => !v)}><FaEdit /></button>
              {editImage && (
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'block', marginTop: '0.5rem' }}
                  onChange={handleImageChange}
                  autoFocus
                />
              )}
            </div>
            <div className="product-main-info">
              <div className="product-name-row">
                {editName ? (
                  <input
                    className="product-name-input"
                    value={product.name}
                    onChange={handleNameChange}
                    onBlur={() => setEditName(false)}
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="product-name">{product.name}</span>
                    <button className="edit-btn circle small" onClick={() => setEditName(true)}><FaEdit /></button>
                  </>
                )}
              </div>
              <div className="product-qty-price-row">
                <div className="product-qty">
                  <label>Quantity Of Product</label>
                  <button className="qty-btn" onClick={() => handleQtyChange(-1)}>-</button>
                  <span className="qty-value">{product.quantity}</span>
                  <button className="qty-btn" onClick={() => handleQtyChange(1)}>+</button>
                </div>
                <div className="product-price">
                  <label>Price Of Product</label>
                  <button className="qty-btn" onClick={() => setProduct(prev => ({ ...prev, price: Math.max(0, prev.price - 50000) }))}>-</button>
                  <input
                    className="price-input"
                    type="number"
                    value={product.price}
                    onChange={e => setProduct({ ...product, price: Number(e.target.value) })}
                    style={{ width: '110px', textAlign: 'center' }}
                  />
                  <button className="qty-btn" onClick={() => setProduct(prev => ({ ...prev, price: prev.price + 50000 }))}>+</button>
                </div>
              </div>
            </div>
          </div>
          <div className="product-details-section">
            <div className="product-details-header">
              <span>Deskripsi Produk</span>
              <button className="edit-btn circle small" onClick={() => setEditDetails((v) => !v)}><FaEdit /></button>
            </div>
            {editDetails ? (
              <textarea
                className="product-description-input"
                value={product.details.map(d => `${d.label} : ${d.value}`).join('\n')}
                onChange={handleDescriptionChange}
                onBlur={() => setEditDetails(false)}
                rows={8}
                autoFocus
              />
            ) : (
              <ul className="product-details-list left-align">
                {product.details.map((item, idx) => (
                  <li key={idx}><span>{item.label}</span> : {item.value}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="product-categories-collections">
            <div className="categories">
              <div className="section-label">Categories</div>
              <div className="category-btns grid-2row">
                {categories.map((cat, idx) => (
                  <button
                    key={cat}
                    className={`category-btn${selectedCategory === cat ? ' selected' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="collections">
              <div className="section-label">Collection</div>
              <div className="collection-btns">
                {collections.map((col) => (
                  <button
                    key={col}
                    className={`collection-btn${selectedCollection === col ? ' selected' : ''}`}
                    onClick={() => setSelectedCollection(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="product-action-btns">
            <button className="cancel-btn">Cancel</button>
            <button className="save-btn">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAdmin;
