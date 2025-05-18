import User from "../models/User.js";
import admin from '../firebase/firebaseAdmin.js';

/**
 * Register user dari Firebase Auth ke MongoDB
 * Frontend sudah mendaftarkan user ke Firebase.
 * Backend hanya menyimpan user jika belum ada di MongoDB.
 */
export const register = async (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).json({ message: "No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decoded;
    const { fname, lname } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ success: true, message: "User already exists" });
    }

    const user = await User.create({
      fname,
      lname,
      email,
      password: uid,
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).json({ message: "No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, uid } = decoded;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};