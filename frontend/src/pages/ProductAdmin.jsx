import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/ProductAdmin.css';
import chandelier from '../assets/images/chandelier.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const categories = [
  'Hanging Lamp', 'Ceiling Lamp', 'Wall Lamp', 'Standing Lamp', 'Table Lamp', 'Uncategorized'
];
const collections = [
  'Minimalist Collection', 'Modern Collection', 'Classic Collection'
];

const ProductAdmin = () => {
  const [products, setProducts] = useState([]);
  const [editImage, setEditImage] = useState(null); // index of editing image
  const [editName, setEditName] = useState(null); // index of editing name
  const [editDetails, setEditDetails] = useState(null); // index of editing details
  const [imagePreview, setImagePreview] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/products');
      setProducts(res.data.products);
    } catch (error) {
      alert('Failed to fetch products');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/products/delete/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      alert('Failed to delete product');
    }
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

  const startEdit = (idx) => {
    setEditIndex(idx);
    setEditProduct({ ...products[idx] });
    setImagePreview(null);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditProduct(null);
    setImagePreview(null);
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setEditProduct((prev) => ({ ...prev, image: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setEditProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const saveEdit = async () => {
    if (!editProduct) return;
    const formData = new FormData();
    for (let key in editProduct) {
      if (key === 'image' && editProduct.image instanceof File) {
        formData.append('image', editProduct.image);
      } else {
        formData.append(key, editProduct[key]);
      }
    }
    try {
      await axios.put(`http://localhost:4000/api/products/edit/${editProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditIndex(null);
      setEditProduct(null);
      setImagePreview(null);
      fetchProducts();
      alert('Product updated!');
    } catch (error) {
      alert(error, 'Failed to update product');
    }
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
        {products.length === 0 && <div>No products found.</div>}
        {products.map((product, idx) => (
          <div className="product-card" key={product._id} style={{ position: 'relative' }}>
            {/* Delete button on the right */}
            <button
              className="delete-product-btn"
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
              onClick={() => handleDelete(product._id)}
              title="Delete Product"
            >
              &#10006;
            </button>
            {editIndex === idx && editProduct ? (
              <>
                <div className="product-card-header">
                  <div className="product-image-edit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200 }}>
                    <img
                      src={imagePreview ? imagePreview : (typeof editProduct.image === 'string' ? editProduct.image : chandelier)}
                      alt={editProduct.name}
                      className="product-image"
                      style={{ width: 200, height: 260, objectFit: 'cover', borderRadius: 10, border: '2px solid #e0c69a', marginBottom: 8 }}
                    />
                    <input type="file" name="image" accept="image/*" onChange={handleEditChange} style={{ display: 'none' }} id={`edit-image-upload-${idx}`} />
                    <label htmlFor={`edit-image-upload-${idx}`} style={{ display: 'block', cursor: 'pointer', color: '#e0c69a', fontWeight: 600, fontFamily: 'Cinzel, serif', textAlign: 'center', marginTop: 8, marginBottom: 0, background: '#222d52', border: '1px solid #e0c69a', borderRadius: 6, padding: '0.3rem 0.8rem', width: 'fit-content' }}>
                      Pilih Gambar
                    </label>
                    {!imagePreview && typeof editProduct.image !== 'string' && (
                      <div style={{ color: '#e0c69a', fontFamily: 'Cinzel, serif', fontSize: '1rem', marginTop: 8, textAlign: 'center', background: '#222d52', border: '1px solid #e0c69a', borderRadius: 6, padding: '0.3rem 0.8rem', display: 'inline-block' }}>
                        No file chosen
                      </div>
                    )}
                  </div>
                  <div className="product-main-info">
                    <div className="product-name-row">
                      <input
                        type="text"
                        name="name"
                        value={editProduct.name}
                        onChange={handleEditChange}
                        className="product-name-input"
                        style={{ fontSize: '1.5rem', color: '#e0c69a', background: '#2e3a6c', border: '1px solid #e0c69a', borderRadius: 6, textAlign: 'center', fontFamily: 'Cinzel, serif', fontWeight: 700, width: '100%' }}
                      />
                    </div>
                    <div className="product-qty-price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2.5rem' }}>
                      <div className="product-qty" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ color: '#e0c69a', fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.3rem' }}>Quantity Of Product</label>
                        <input
                          type="number"
                          name="quantity"
                          value={editProduct.quantity}
                          onChange={handleEditChange}
                          className="qty-value"
                          style={{ background: '#222d52', color: '#e0c69a', border: '1px solid #3a436b', borderRadius: 4, padding: '0.3rem 1.2rem', fontSize: '1.2rem', minWidth: 80, textAlign: 'center' }}
                          min={0}
                        />
                      </div>
                      <div className="product-price" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ color: '#e0c69a', fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.3rem' }}>Price Of Product</label>
                        <input
                          type="number"
                          name="price"
                          value={editProduct.price}
                          onChange={handleEditChange}
                          className="price-value"
                          style={{ background: '#222d52', color: '#e0c69a', border: '1px solid #3a436b', borderRadius: 4, padding: '0.3rem 1.2rem', fontSize: '1.2rem', minWidth: 80, textAlign: 'center' }}
                          min={0}
                        />
                      </div>
                      <div className="product-weight" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ color: '#e0c69a', fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.3rem' }}>Weight</label>
                        <input
                          type="number"
                          name="weight"
                          value={editProduct.weight}
                          onChange={handleEditChange}
                          className="qty-value"
                          style={{ background: '#222d52', color: '#e0c69a', border: '1px solid #3a436b', borderRadius: 4, padding: '0.3rem 1.2rem', fontSize: '1.2rem', minWidth: 80, textAlign: 'center' }}
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="product-details-section">
                  <div className="product-details-header">
                    <span style={{ color: '#e0c69a', fontWeight: 700 }}>Deskripsi Produk</span>
                  </div>
                  <textarea
                    name="description"
                    value={editProduct.description}
                    onChange={handleEditChange}
                    className="product-description-input"
                    rows={4}
                    style={{ width: '100%', color: '#e0c69a', background: '#2E3A6C', border: 'none', borderRadius: 4, padding: '8px 12px', marginTop: 8 }}
                  />
                </div>
                <div className="product-categories-collections">
                  <div className="categories">
                    <div className="section-label">Categories</div>
                    <div className="category-btns grid-2row">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          className={`category-btn${cat === editProduct.category ? ' selected' : ''}`}
                          style={cat === editProduct.category ? {} : { background: '#2e3a6c', color: '#e0c69a', border: '2px solid #e0c69a', cursor: 'pointer' }}
                          onClick={() => setEditProduct(prev => ({ ...prev, category: cat }))
                          }
                          type="button"
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
                          className={`collection-btn${col === editProduct.collection ? ' selected' : ''}`}
                          style={col === editProduct.collection ? {} : { background: '#2e3a6c', color: '#e0c69a', border: '2px solid #e0c69a', cursor: 'pointer' }}
                          onClick={() => setEditProduct(prev => ({ ...prev, collection: col }))
                          }
                          type="button"
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="product-action-btns" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                  <button className="cancel-btn" onClick={cancelEdit} type="button">Cancel</button>
                  <button className="save-btn" onClick={saveEdit} type="button">Save</button>
                </div>
              </>
            ) : (
              <>
                <div className="product-card-header">
                  <div className="product-image-edit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200 }}>
                    <img
                      src={typeof product.image === 'string' ? product.image : chandelier}
                      alt={product.name}
                      className="product-image"
                      style={{ width: 200, height: 260, objectFit: 'cover', borderRadius: 10, border: '2px solid #e0c69a', marginBottom: 8 }}
                    />
                  </div>
                  <div className="product-main-info">
                    <div className="product-name-row">
                      <span className="product-name">{product.name}</span>
                    </div>
                    <div className="product-qty-price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2.5rem' }}>
                      <div className="product-qty" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ color: '#e0c69a', fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.3rem' }}>Quantity Of Product</label>
                        <span className="qty-value">{product.quantity}</span>
                      </div>
                      <div className="product-price" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ color: '#e0c69a', fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.3rem' }}>Price Of Product</label>
                        <span className="price-value">Rp {product.price?.toLocaleString()}</span>
                      </div>
                      <div className="product-weight" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ color: '#e0c69a', fontFamily: 'Cinzel, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.3rem' }}>Weight</label>
                        <span className="qty-value">{(product.weight / 1000).toFixed(2)} kg</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="product-details-section">
                  <div className="product-details-header">
                    <span style={{ color: '#e0c69a', fontWeight: 700 }}>Deskripsi Produk</span>
                  </div>
                  <div className="product-details-list left-align">
                    {product.description?.split('\n').map((line, i) => (
                      <div key={i} style={{ color: '#e0c69a' }}>{line}</div>
                    ))}
                  </div>
                </div>
                <div className="product-categories-collections">
                  <div className="categories">
                    <div className="section-label">Categories</div>
                    <div className="category-btns grid-2row">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          className={`category-btn${cat === product.category ? ' selected' : ''}`}
                          style={cat === product.category ? {} : { background: '#2e3a6c', color: '#e0c69a', border: '2px solid #e0c69a', cursor: 'default' }}
                          tabIndex={-1}
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
                          className={`collection-btn${col === product.collection ? ' selected' : ''}`}
                          style={col === product.collection ? {} : { background: '#2e3a6c', color: '#e0c69a', border: '2px solid #e0c69a', cursor: 'default' }}
                          tabIndex={-1}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Tombol Edit di bawah card, gunakan style utama */}
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  <button className="save-btn" style={{ minWidth: 90 }} onClick={() => startEdit(idx)} type="button">Edit</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductAdmin;
