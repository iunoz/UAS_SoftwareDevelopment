import express from 'express';
import { getSnapToken, saveOrder, getUserOrders } from '../controllers/PaymentController.js';

const router = express.Router();

router.post('/create-payment', getSnapToken);
router.post('/save-order', saveOrder);
router.get('/user-orders/:userId', getUserOrders);

export default router;
