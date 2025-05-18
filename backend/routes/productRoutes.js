import express from 'express';
import { getProducts, detailProducts, addProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { upload } from '../configs/multer.js';

const productRouter = express.Router();

productRouter.get('/', getProducts);
productRouter.get('/detail/:id', detailProducts)
productRouter.post('/add', upload.single('image'), addProduct);
productRouter.put('/edit/:id', upload.single('image'), updateProduct);
productRouter.delete('/delete/:id', deleteProduct);

export default productRouter;
