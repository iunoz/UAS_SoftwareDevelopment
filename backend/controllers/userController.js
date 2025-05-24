import User from "../models/User.js";
import admin from '../firebase/firebaseAdmin.js';
import fetch from 'node-fetch';

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
  const { oldPassword, newPassword, email } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password required" });
  }

  try {
    let user;
    // Jika ada uid (user login)
    if (uid) {
      user = await User.findOne({ uid });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Jika ada oldPassword, lakukan re-auth ke Firebase
      if (oldPassword) {
        const apiKey = "AIzaSyAPEIXFMrlWyOhP56xiS-Ji7DNumaAQKmY";
        const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
        const verifyRes = await fetch(verifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            password: oldPassword,
            returnSecureToken: true,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          let errorMsg = "Old password is wrong";
          if (verifyData?.error?.message === "INVALID_PASSWORD" || verifyData?.error?.message === "INVALID_LOGIN_CREDENTIALS") {
            errorMsg = "Old password is wrong";
          } else if (verifyData?.error?.message) {
            errorMsg = verifyData.error.message;
          }
          return res.status(400).json({ message: errorMsg });
        }
      }
      // Update password di Firebase
      await admin.auth().updateUser(uid, { password: newPassword });
      await User.findOneAndUpdate({ uid }, { password: newPassword });
      return res.status(200).json({ success: true, message: "Password updated" });
    }

    // Jika tidak ada uid (reset password by email)
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }
      // Cari user di Firebase
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().getUserByEmail(email);
      } catch (e) {
        return res.status(404).json({ message: "Email not found in Firebase" });
      }
      await admin.auth().updateUser(firebaseUser.uid, { password: newPassword });
      await User.findOneAndUpdate({ email }, { password: newPassword });
      return res.status(200).json({ success: true, message: "Password updated" });
    }

    return res.status(400).json({ message: "Invalid request" });
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

/**
 * Get user data
 */
export const getUserData = async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update user address
 */
export const updateAddress = async (req, res) => {
  const { uid } = req.params;
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ success: false, message: "Address is required" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};