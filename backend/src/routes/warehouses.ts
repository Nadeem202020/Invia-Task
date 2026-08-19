import { Router } from 'express';
import { createWarehouse, getWarehouses } from '../controllers/warehouseController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createWarehouse);
router.get('/', getWarehouses);

export = router;
