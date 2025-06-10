import { Router } from 'express';
// import express from 'express';
import productRoutes from './productRoute.js';
import orderRoutes from './orderRoute.js';
import paymentMethodRoutes from './paymentMethodRoute.js';
import awsRoutes from './awsRoute.js';
import categoryRoutes from './categoryRoute.js';
import assistantRoutes from './assistantRoute.js';
import supplierRoutes from './supplierRoute.js';
import chatRoutes from './chatRoute.js';

const router = Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payment_methods', paymentMethodRoutes);
router.use('/aws', awsRoutes);
router.use('/categories', categoryRoutes);
router.use('/api/assistant', assistantRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/api/chats', chatRoutes);
// router.use('/uploads', express.static('uploads'));

export default router;
