import express from 'express';
import authRoutes from './authRoute.js';
import productRoutes from './productRoute.js';
import orderRoutes from './orderRoute.js';
import paymentMethodRoutes from './paymentMethodRoute.js';
import awsRoutes from './awsRoute.js';
import categoryRoutes from './categoryRoute.js';
import assistantRoutes from './assistantRoute.js';
import supplierRoutes from './supplierRoute.js';
import chatRoutes from './chatRoute.js';
import searchRoutes from './searchRoute.js';
import brandRoutes from './brandRoute.js';
import unitRoutes from './unitRoute.js';
import managerRoutes from './managerRoute.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payment_methods', paymentMethodRoutes);
router.use('/aws', awsRoutes);
router.use('/categories', categoryRoutes);
router.use('/api/assistant', assistantRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/api/chats', chatRoutes);
router.use('/search', searchRoutes);
router.use('/brands', brandRoutes);
router.use('/units', unitRoutes);
router.use('/managers', managerRoutes);
router.use('/uploads', express.static('uploads'));
router.use('/uploads', express.static('uploads'), {
  setHeaders: function (res, path) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
});

export default router;
