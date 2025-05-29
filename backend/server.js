import express from 'express';
import connectDB from './configs/db.js';
import cors from 'cors';
import 'dotenv/config'
import userRouter from './routes/userRoute.js';
import productRoutes from './routes/productRoutes.js';
import cartRouter from './routes/cartRoute.js';
import connectCloudinary from './configs/cloudinary.js';

const app = express();
const PORT = process.env.PORT || 4000;
const origins = ['http://localhost:5173']

await connectDB()
await connectCloudinary()

app.use(express.json());
app.use(cors({
    origin: origins,
    credentials: true,
}));

app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRouter);

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})