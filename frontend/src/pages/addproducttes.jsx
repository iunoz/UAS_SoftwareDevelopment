import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/AddProduct.css';
import axios from 'axios';

const categories = [
  'Hanging Lamp', 'Ceiling Lamp', 'Wall Lamp', 'Standing Lamp', 'Table Lamp', 'Uncategorized'
];
const collections = [
  'Minimalist Collection', 'Modern Collection', 'Classic Collection'
];

const AddProduct = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    collection: '',
    image: null,
    weight: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setForm(prev => ({ ...prev, image: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi: semua field wajib diisi
    const requiredFields = ['name', 'description', 'price', 'quantity', 'category', 'collection', 'image', 'weight'];
    for (let field of requiredFields) {
      if (
        !form[field] ||
        (typeof form[field] === 'string' && form[field].trim() === '') ||
        (field === 'image' && (!form.image || !(form.image instanceof File)))
      ) {
        setShowErrorModal(true);
        setTimeout(() => setShowErrorModal(false), 1500);
        return;
      }
    }

    setLoading(true);
    const productData = new FormData();
    for (let key in form) {
      if (key === 'description' && Array.isArray(form[key])) {
        productData.append('description', form[key].join('\n'));
      } else {
        productData.append(key, form[key]);
      }
    }
    try {
      await axios.post('http://localhost:4000/api/products/add', productData);
      setShowSuccessModal(true);
      setForm({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        collection: '',
        image: null,
        weight: '',
      });
      setImagePreview(null);
      setTimeout(() => setShowSuccessModal(false), 1500);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-admin">
      <AdminNavbar />
      <div className="dashboard-content add-product-content">
        <h1 className="admin-page-title">ADD PRODUCT</h1>
        <form className="add-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="add-product-grid">
            <div className="add-product-image-section">
              <label htmlFor="image-upload" className="image-upload-label">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="image-upload-placeholder">
                    <span className="upload-icon">↑</span>
                    <span>Upload Image</span>
                  </div>
                )}
              </label>
              <input
                type="file"
                id="image-upload"
                name="image"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="add-product-fields-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Product name..." required />
                </div>
                <div className="form-group">
                  <label>Weight (gram)</label>
                  <input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="XXXX (Gram)" required min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Product description..." required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="RP. XXX.XXX.XXX" required min="0" />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="XX" required min="0" />
                </div>
                
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categories</label>
                  <div className="category-btns grid-2row">
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        className={`category-btn${form.category === cat ? ' selected' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Collection</label>
                  <div className="collection-btns">
                    {collections.map((col) => (
                      <button
                        type="button"
                        key={col}
                        className={`collection-btn${form.collection === col ? ' selected' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, collection: col }))}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="add-product-action-btns">
                <button type="button" className="cancel-btn" onClick={() => window.history.back()}>Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Adding...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </form>
        {showSuccessModal && (
          <div className="modal-backdrop">
            <div className="modal-confirm modal-success">
              <div className="modal-checkmark">&#10004;</div>
              <div className="modal-success-text">Product added successfully!</div>
            </div>
          </div>
        )}
        {showErrorModal && (
          <div className="modal-backdrop">
            <div className="modal-confirm modal-error">
              <div className="modal-xmark">&#10006;</div>
              <div className="modal-error-text">All form must contain a value</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;