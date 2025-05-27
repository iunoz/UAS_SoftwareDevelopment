import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../controllers/cartController.js';

const cartRouter = express.Router();

cartRouter.get('/', authMiddleware, getCart);
cartRouter.post('/add', authMiddleware, addToCart);
cartRouter.put('/update', authMiddleware, updateCartItem);
cartRouter.delete('/remove/:productId', authMiddleware, removeCartItem);

export default cartRouter;