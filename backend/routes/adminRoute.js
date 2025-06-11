import express from 'express';
import { getDashboardStats, getDailySales } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/dashboard-stats', getDashboardStats);
adminRouter.get('/daily-sales', getDailySales); 
export default adminRouter;