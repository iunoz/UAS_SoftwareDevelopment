import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Utk semua produk
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category, collection, weight } = req.body;

    if (!name || !description || !price || !quantity || !category || !collection || !weight || !req.file) {
      return res.status(400).json({ success: false, message: 'All fields including image are required' });
    }

    // Upload image ke Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'products',
    });

    // Hapus file dari local setelah upload
    fs.unlinkSync(req.file.path);

    const newProduct = new Product({
      name,
      description,
      image: result.secure_url,
      price,
      quantity,
      category,
      collection,
      weight
    });

    await newProduct.save();

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Add Product Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Hanya produk yg diklik
export const detailProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Detail Product Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let updateData = { ...req.body };

    // Jika ada file gambar baru, upload ke Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'products',
      });

      fs.unlinkSync(req.file.path); // Hapus dari local

      updateData.image = result.secure_url; // Ganti image URL dengan yang baru
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
