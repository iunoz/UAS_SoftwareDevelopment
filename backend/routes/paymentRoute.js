import express from 'express';
import { getSnapToken } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-payment', getSnapToken);

export default router;
