import { Router } from 'express';
import { getInventory, addStock, removeStock, transferStock } from '../controllers/inventoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getInventory);
router.post('/add', addStock);
router.post('/remove', removeStock);
router.post('/transfer', transferStock);

export = router;
