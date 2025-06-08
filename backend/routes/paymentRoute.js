import express from 'express';
import { getSnapToken, saveOrder, getUserOrders, updateOrderStatus, getAllOrders } from '../controllers/PaymentController.js';

const router = express.Router();

router.post('/create-payment', getSnapToken);
router.post('/save-order', saveOrder);
router.get('/user-orders/:userId', getUserOrders);
router.put('/update-status/:orderId', updateOrderStatus);
router.get('/orders/admin', getAllOrders);

export default router;
