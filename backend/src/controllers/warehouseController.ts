import { Request, Response } from 'express';
import { prisma } from '../db';

export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      res.status(400).json({ error: 'Name and code are required' });
      return;
    }

    const existingWarehouse = await prisma.warehouse.findUnique({ where: { code } });
    if (existingWarehouse) {
      res.status(400).json({ error: 'Warehouse with this code already exists' });
      return;
    }

    // Use a transaction to ensure atomic creation of warehouse and inventory records
    const warehouse = await prisma.$transaction(async (tx) => {
      const newWarehouse = await tx.warehouse.create({
        data: { name, code }
      });

      const products = await tx.product.findMany();
      if (products.length > 0) {
        await tx.inventory.createMany({
          data: products.map(p => ({
            productId: p.id,
            warehouseId: newWarehouse.id,
            quantity: 0
          }))
        });
      }
      return newWarehouse;
    });

    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWarehouses = async (req: Request, res: Response): Promise<void> => {
  try {
    const warehouses = await prisma.warehouse.findMany();
    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
