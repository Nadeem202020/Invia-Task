import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createProduct);
router.get('/', getProducts);

export = router;
