import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase.config';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setCartCount(0);
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:4000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const totalItems = response.data.cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
      setCartCount(0);
    }
  };

  // Fungsi reset cart count
  const resetCartCount = () => setCartCount(0);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCartCount();
      } else {
        setCartCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    cartCount,
    fetchCartCount,
    resetCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 