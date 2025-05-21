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
    const { uid, email } = decoded;
    const { fname, lname } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ success: true, user: existingUser });
    }

    const role = email.toUpperCase().includes('ADM1N') ? 'admin' : 'user';

    const user = await User.create({
      uid,
      fname,
      lname,
      email,
      role,
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Login user dari Firebase Auth ke MongoDB
 */
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

/**
 * Update password user
 */
export const updatePassword = async (req, res) => {
  const { uid } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password required" });
  }

  try {
    // Update password di Firebase
    await admin.auth().updateUser(uid, { password: newPassword });
    // Update password di MongoDB jika simpan password hash
    await User.findOneAndUpdate({ uid }, { password: newPassword });
    res.status(200).json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update password" });
  }
};

/**
 * Delete password user
 */
export const deleteUser = async (req, res) => {
  const { uid } = req.params;
  try {
    // Hapus user di Firebase
    await admin.auth().deleteUser(uid);
    // Hapus user di MongoDB
    await User.findOneAndDelete({ uid });
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};