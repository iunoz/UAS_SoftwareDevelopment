import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/AddProduct.css';
import axios from 'axios';
import { Prev } from 'react-bootstrap/esm/PageItem';

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
    weight: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [existingProduct, setExistingProduct] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Product added successfully!');

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

  const handleAddQuantity = async () => {
    if (!existingProduct) return;
    setLoading(true);
    try {
      const updatedQuantity = parseInt(existingProduct.quantity) + parseInt(form.quantity);
      const updateData = {
        quantity: updatedQuantity,
        name: existingProduct.name,
        description: existingProduct.description,
        price: existingProduct.price,
        category: existingProduct.category,
        collection: existingProduct.collection,
        weight: existingProduct.weight,
      };
      await axios.put(`https://uassoftwaredevelopment-production.up.railway.app/api/products/edit/${existingProduct._id}`, updateData);
      setSuccessMessage('Quantity updated successfully!');
      setShowSuccessModal(true);
      setForm({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        collection: '',
        weight: '',
        image: null,
      });
      setImagePreview(null);
      setShowConfirm(false);
      setExistingProduct(null);
      setTimeout(() => setShowSuccessModal(false), 1500); // Tutup otomatis
    } catch (error) {
      alert('Failed to update quantity: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      // Pastikan description dikirim sebagai string (bukan array)
      if (key === 'description' && Array.isArray(form[key])) {
        productData.append('description', form[key].join('\n'));
      } else {
        productData.append(key, form[key]);
      }
    }
    try {
      await axios.post('https://uassoftwaredevelopment-production.up.railway.app/api/products/add', productData);
      setShowSuccessModal(true); // Tampilkan modal sukses
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
      if (error.response && error.response.status === 409) {
        // Product exists, show confirmation modal
        setExistingProduct(error.response.data.product);
        setShowConfirm(true);
      } else {
        alert(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setExistingProduct(null);
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
                        onClick={() => setForm({ ...form, category: cat })}
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
                        onClick={() => setForm({ ...form, collection: col })}
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

        {showConfirm && (
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
            <div className="confirm-content">
              <h2 id="confirm-title" className="confirm-title">Confirm Quantity Addition</h2>
              <p id="confirm-desc" className="confirm-message">
                Product with the name <strong>"{existingProduct.name}"</strong> already exists with quantity <strong>{existingProduct.quantity}</strong>.
              </p>
              <p className="confirm-message">
                Do you want to add the new quantity (<strong>{form.quantity}</strong>) to the existing stock?
              </p>
              <div className="confirm-buttons">
                <button className="confirm-btn yes-btn" onClick={handleAddQuantity} disabled={loading}>Yes</button>
                <button className="confirm-btn no-btn" onClick={handleCancel} disabled={loading}>No</button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="modal-backdrop">
            <div className="modal-confirm modal-success">
              <div className="modal-checkmark">&#10004;</div>
              <div className="modal-success-text">{successMessage}</div>
            </div>
          </div>
        )}

        {showErrorModal && (
          <div className="modal-backdrop">
            <div className="modal-confirm modal-error">
              <div className="modal-xmark">&#10006;</div>
              <div className="modal-error-text">Please fill in all fields before submitting the product.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddProduct;
