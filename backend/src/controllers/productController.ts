import { Request, Response } from 'express';
import { prisma } from '../db';

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, sku } = req.body;

    if (!name || !sku) {
      res.status(400).json({ error: 'Name and sku are required' });
      return;
    }

    const existingProduct = await prisma.product.findUnique({ where: { sku } });
    if (existingProduct) {
      res.status(400).json({ error: 'Product with this SKU already exists' });
      return;
    }

    // Use a transaction to ensure atomic creation of product and inventory records
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: { name, sku }
      });

      const warehouses = await tx.warehouse.findMany();
      if (warehouses.length > 0) {
        await tx.inventory.createMany({
          data: warehouses.map(w => ({
            productId: newProduct.id,
            warehouseId: w.id,
            quantity: 0
          }))
        });
      }
      return newProduct;
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true
          }
        }
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
