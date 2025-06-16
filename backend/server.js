import express from 'express';
import connectDB from './configs/db.js';
import cors from 'cors';
import 'dotenv/config'
import userRouter from './routes/userRoute.js';
import productRoutes from './routes/productRoutes.js';
import cartRouter from './routes/cartRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import shipRouter from './routes/shipRoute.js';
import paymentRouter from './routes/paymentRoute.js'; 
import adminRouter from './routes/adminRoute.js';

const app = express();
const PORT = process.env.PORT || 4000;

await connectDB()
await connectCloudinary()

app.use(express.json());
app.use(cors({
    origin: 'http://www.decorlighting.xyz',
}));

app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRouter);
app.use('/api/ship', shipRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/admin', adminRouter); 
/* Removed import and usage of orderRoute.js since the file was deleted */
// import orderRouter from './routes/orderRoute.js';

// app.use('/api/orders', orderRouter);

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
