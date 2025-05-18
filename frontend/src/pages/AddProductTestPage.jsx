import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProductTestPage = () => {
  const [products, setProducts] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    collection: '',
    image: null,
  });
  
  const categories = ['Hanging Lamp', 'Ceiling Lamp', 'Wall Lamp', 'Standing Lamp', 'Table Lamp', 'Uncategorized'];
  const collections = ['Minimalist Collection', 'Modern Collection', 'Classic Collection'];

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products');
      setProducts(res.data.products);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

const handleChange = (e) => {
  if (e.target.name === 'image') {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  } else {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = new FormData();
    for (let key in formData) {
      productData.append(key, formData[key]);
    }

    try {
      await axios.post('http://localhost:4000/api/products/add', productData);
      fetchProducts(); // Refresh list
      alert('Product added!');
    } catch (error) {
      console.error('Failed to add product', error);
      alert('Error adding product');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Add Product (Test Page)</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ marginBottom: '2rem' }}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required /><br />
        <textarea name="description" placeholder="Description" onChange={handleChange} required /><br />
        <input type="number" name="price" placeholder="Price" onChange={handleChange} required /><br />
        <input type="number" name="quantity" placeholder="Quantity" onChange={handleChange} required /><br />
        <select name="category" onChange={handleChange} required>
          <option value="">-- Select Category --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select><br />
        <select name="collection" onChange={handleChange} required>
          <option value="">-- Select Collection --</option>
          {collections.map((col) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select><br />
        <label
            htmlFor="image-upload"
            style={{
                width: '200px',
                height: '200px',
                border: '2px dashed #aaa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginBottom: '1rem',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
            }}
        >
            {imagePreview ? (
                <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <span style={{ fontSize: '3rem', color: '#aaa' }}>+</span>
            )}
        </label>
        <input
            type="file"
            id="image-upload"
            name="image"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
            required
        />
        <button type="submit">Submit</button>
      </form>

      <h3>Product List</h3>
      <ul>
        {products.map((p) => (
          <li key={p._id}>
            <strong>{p.name}</strong> - Rp {p.price.toLocaleString()} - {p.category} - {p.collection}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddProductTestPage;
