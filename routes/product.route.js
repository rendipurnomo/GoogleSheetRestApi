import express from 'express';
import * as productController from '../controllers/productController.js';
import { adminOnly, verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products',adminOnly,verifyToken, productController.addProduct);
router.patch('/products/:id',adminOnly,verifyToken, productController.editProduct);
router.delete('/products/:id',adminOnly,verifyToken, productController.deleteProduct);

export default router;
