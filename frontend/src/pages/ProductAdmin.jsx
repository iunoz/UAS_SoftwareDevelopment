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
              <div className="edit-product-form" style={{ padding: '1rem', background: '#e0c69a', borderRadius: 8, marginTop: 10 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#222D52', marginBottom: 2 }}>NAMA PRODUK</div>
                  <input type="text" name="name" value={editProduct.name} onChange={handleEditChange} className="product-name-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#222D52', marginBottom: 2 }}>HARGA</div>
                  <input type="number" name="price" value={editProduct.price} onChange={handleEditChange} className="price-input" style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#222D52', marginBottom: 2 }}>QUANTITY</div>
                  <input type="number" name="quantity" value={editProduct.quantity} onChange={handleEditChange} className="qty-value" style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#222D52', marginBottom: 2 }}>DESKRIPSI PRODUK</div>
                  <textarea name="description" value={editProduct.description} onChange={handleEditChange} className="product-description-input" rows={6} style={{ width: '100%', marginTop: 4, color: '#e0c69a', background: '#2E3A6C', border: 'none', borderRadius: 4, padding: '8px 12px' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#222D52', marginBottom: 2, textAlign: 'center' }}>KATEGORI</div>
                  <select name="category" value={editProduct.category} onChange={handleEditChange} style={{ width: '100%', marginTop: 4, background: '#2E3A6C', color: '#e0c69a', border: 'none', borderRadius: 4, padding: '8px 12px', textAlign: 'center', textAlignLast: 'center' }}>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} style={{ background: '#2E3A6C', color: '#e0c69a', textAlign: 'center' }}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#222D52', marginBottom: 2, textAlign: 'center' }}>KOLEKSI</div>
                  <select name="collection" value={editProduct.collection} onChange={handleEditChange} style={{ width: '100%', marginTop: 4, background: '#2E3A6C', color: '#e0c69a', border: 'none', borderRadius: 4, padding: '8px 12px', textAlign: 'center', textAlignLast: 'center' }}>
                    {collections.map((col) => (
                      <option key={col} value={col} style={{ background: '#2E3A6C', color: '#e0c69a', textAlign: 'center' }}>{col}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#222D52', marginBottom: 2 }}>GAMBAR PRODUK</div>
                  <input type="file" name="image" accept="image/*" onChange={handleEditChange} style={{ display: 'block', marginTop: 4 }} />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 8 }} />
                  ) : (
                    <img src={typeof editProduct.image === 'string' ? editProduct.image : chandelier} alt="Preview" className="image-preview" style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 8 }} />
                  )}
                </div>
                <div className="product-action-btns" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                  <button className="cancel-btn" onClick={cancelEdit} type="button">Cancel</button>
                  <button className="save-btn" onClick={saveEdit} type="button">Save</button>
                </div>
              </div>
            ) : (
              <>
                <div className="product-card-header">
                  <div className="product-image-edit">
                    <img
                      src={typeof product.image === 'string' ? product.image : chandelier}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>
                  <div className="product-main-info">
                    <div className="product-name-row">
                      <span className="product-name">{product.name}</span>
                    </div>
                    <div className="product-qty-price-row">
                      <div className="product-qty">
                        <label>Quantity Of Product</label>
                        <span className="qty-value">{product.quantity}</span>
                      </div>
                      <div className="product-price">
                        <label>Price Of Product</label>
                        <span className="price-value">Rp {product.price?.toLocaleString()}</span>
                      </div>
                      <div className="product-weight">
                        <label>Weight</label>
                        <span className="weight-value">{(product.weight / 1000).toFixed(2)} kg</span>
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
                      <button className="category-btn selected">{product.category}</button>
                    </div>
                  </div>
                  <div className="collections">
                    <div className="section-label">Collection</div>
                    <div className="collection-btns">
                      <button className="collection-btn selected">{product.collection}</button>
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
