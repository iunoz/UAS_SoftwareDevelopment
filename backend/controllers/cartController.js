import User from '../models/User.js';

// GET /api/cart - Get current user's cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).populate('cart.product');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/cart/add - Add product to cart or update quantity
export const addToCart = async (req, res) => {
  try {
    console.log('Add to cart request received:', {
      body: req.body,
      user: req.user
    });

    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      console.log('Invalid request data');
      return res.status(400).json({ success: false, message: 'Product and quantity required' });
    }

    console.log('Finding user with uid:', req.user.uid);
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('User found:', user.email);

    const existingItem = user.cart.find(item => item.product.toString() === productId);
    if (existingItem) {
      console.log('Updating existing cart item');
      existingItem.quantity += quantity;
    } else {
      console.log('Adding new cart item');
      user.cart.push({ product: productId, quantity });
    }

    console.log('Saving cart changes...');
    await user.save();
    console.log('Cart updated successfully');

    res.json({ success: true, cart: user.cart });
  } catch (err) {
    console.error('Server error in addToCart:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// PUT /api/cart/update - Update quantity of a cart item
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product required' });
    }
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Cart item not found' });

    if (quantity < 1) {
      // Remove item if quantity < 1
      user.cart.splice(itemIndex, 1);
    } else {
      user.cart[itemIndex].quantity = quantity;
    }
    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/cart/remove/:productId - Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};