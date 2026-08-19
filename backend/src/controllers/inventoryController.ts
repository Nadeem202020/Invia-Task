import { Request, Response } from 'express';
import { prisma } from '../db';

export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.query;

    const where = productId ? { productId: productId as string } : {};

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: true,
        warehouse: true
      }
    });

    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, warehouseId, quantity } = req.body;

    if (!productId || !warehouseId || quantity === undefined) {
      res.status(400).json({ error: 'productId, warehouseId, and quantity are required' });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ error: 'Quantity must be greater than 0' });
      return;
    }

    const inventory = await prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId }
        }
      });

      if (!inv) {
        throw new Error('Inventory record not found');
      }

      const updatedInv = await tx.inventory.update({
        where: { id: inv.id },
        data: { quantity: { increment: quantity } }
      });

      await tx.stockHistory.create({
        data: {
          operationType: 'ADD',
          quantity,
          productId,
          destinationWarehouseId: warehouseId
        }
      });

      return updatedInv;
    });

    res.json(inventory);
  } catch (error: any) {
    if (error.message === 'Inventory record not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error adding stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, warehouseId, quantity } = req.body;

    if (!productId || !warehouseId || quantity === undefined) {
      res.status(400).json({ error: 'productId, warehouseId, and quantity are required' });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ error: 'Quantity must be greater than 0' });
      return;
    }

    const inventory = await prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId }
        }
      });

      if (!inv) {
        throw new Error('Inventory record not found');
      }

      if (inv.quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      const updatedInv = await tx.inventory.update({
        where: { id: inv.id },
        data: { quantity: { decrement: quantity } }
      });

      await tx.stockHistory.create({
        data: {
          operationType: 'REMOVE',
          quantity,
          productId,
          sourceWarehouseId: warehouseId
        }
      });

      return updatedInv;
    });

    res.json(inventory);
  } catch (error: any) {
    if (error.message === 'Inventory record not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Insufficient stock') {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error removing stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const transferStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, sourceWarehouseId, destinationWarehouseId, quantity } = req.body;

    if (!productId || !sourceWarehouseId || !destinationWarehouseId || quantity === undefined) {
      res.status(400).json({ error: 'productId, sourceWarehouseId, destinationWarehouseId, and quantity are required' });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ error: 'Quantity must be greater than 0' });
      return;
    }

    if (sourceWarehouseId === destinationWarehouseId) {
      res.status(400).json({ error: 'Source and destination warehouses must be different' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const sourceInv = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId: sourceWarehouseId }
        }
      });

      if (!sourceInv) {
        throw new Error('Source inventory record not found');
      }

      if (sourceInv.quantity < quantity) {
        throw new Error('Insufficient stock in source warehouse');
      }

      const destInv = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId: destinationWarehouseId }
        }
      });

      if (!destInv) {
        throw new Error('Destination inventory record not found');
      }

      await tx.inventory.update({
        where: { id: sourceInv.id },
        data: { quantity: { decrement: quantity } }
      });

      await tx.inventory.update({
        where: { id: destInv.id },
        data: { quantity: { increment: quantity } }
      });

      await tx.stockHistory.create({
        data: {
          operationType: 'TRANSFER',
          quantity,
          productId,
          sourceWarehouseId,
          destinationWarehouseId
        }
      });
    });

    res.json({ message: 'Transfer successful' });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('Insufficient stock')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error transferring stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
