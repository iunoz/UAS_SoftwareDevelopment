import User from "../models/User.js";
import admin from '../firebase/firebaseAdmin.js';

/**
 * Register user dari Firebase Auth ke MongoDB
 * Frontend sudah mendaftarkan user ke Firebase.
 * Backend hanya menyimpan user jika belum ada di MongoDB.
 */
export const register = async (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Verifikasi token Firebase
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decoded;
    const { fname, lname } = req.body;

    // Periksa apakah user sudah ada di MongoDB
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json({ success: true, message: 'User already registered' });
    }

    // Simpan ke MongoDB
    const newUser = await User.create({
      fname,
      lname,
      email,
      password: uid, // Bisa disimpan sebagai UID Firebase (tidak untuk login manual)
    });

    return res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return res.status(401).json({ success: false, message: 'Invalid Firebase token' });
  }
};