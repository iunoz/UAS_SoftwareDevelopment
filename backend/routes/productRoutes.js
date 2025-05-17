import express from 'express';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.get('/', getProducts);
productRouter.post('/add', addProduct);
productRouter.put('/edit/:id', updateProduct);
productRouter.delete('/delete/:id', deleteProduct);

export default productRouter;
