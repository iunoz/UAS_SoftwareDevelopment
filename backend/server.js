import express from 'express';
import connectDB from './configs/db.js';
import 'dotenv/config'
import userRouter from './routes/userRoute.js';
import productRoutes from './routes/productRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;
const origins = ['http://localhost:5173']

await connectDB()

app.use(express.json());

app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter);
app.use('/api/products', productRoutes);

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})