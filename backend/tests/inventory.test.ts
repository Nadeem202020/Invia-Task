import request from 'supertest';
import app from '../src/index';
import { prisma, pool } from '../src/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let token: string;
let productId: string;
let warehouse1Id: string;
let warehouse2Id: string;

beforeAll(async () => {
  // Clean up existing data to ensure tests are repeatable
  await prisma.stockHistory.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.user.deleteMany({});

  // Setup data for tests
  const hashedPassword = await bcrypt.hash('testpass', 10);
  const user = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: { username: 'testuser', password: hashedPassword }
  });

  token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key'
  );

  const w1 = await prisma.warehouse.upsert({
    where: { code: 'W-TEST-1' },
    update: {},
    create: { name: 'Test W1', code: 'W-TEST-1' }
  });
  warehouse1Id = w1.id;

  const w2 = await prisma.warehouse.upsert({
    where: { code: 'W-TEST-2' },
    update: {},
    create: { name: 'Test W2', code: 'W-TEST-2' }
  });
  warehouse2Id = w2.id;

  const p = await prisma.product.upsert({
    where: { sku: 'TEST-SKU-1' },
    update: {},
    create: { name: 'Test Product', sku: 'TEST-SKU-1' }
  });
  productId = p.id;

  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId, warehouseId: warehouse1Id } },
    update: { quantity: 100 },
    create: { productId, warehouseId: warehouse1Id, quantity: 100 }
  });

  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId, warehouseId: warehouse2Id } },
    update: { quantity: 0 },
    create: { productId, warehouseId: warehouse2Id, quantity: 0 }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});

// ── Authentication Tests ────────────────────────────────────────────────
describe('Authentication', () => {
  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nonexistent', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should return 400 when username or password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser' });

    expect(res.status).toBe(400);
  });

  it('should reject unauthenticated requests to protected endpoints', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
  });

  it('should reject requests with an invalid token', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(403);
  });
});

// ── Product Tests ───────────────────────────────────────────────────────
describe('Product Operations', () => {
  it('should create a product and auto-initialize inventory for all warehouses', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Auto-Init Product', sku: 'TEST-AUTO-INIT' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Auto-Init Product');
    expect(res.body.sku).toBe('TEST-AUTO-INIT');

    // Verify inventory was auto-initialized for all warehouses
    const productRes = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);

    const created = productRes.body.find((p: any) => p.sku === 'TEST-AUTO-INIT');
    expect(created).toBeDefined();
    expect(created.inventories.length).toBeGreaterThanOrEqual(2);
    created.inventories.forEach((inv: any) => {
      expect(inv.quantity).toBe(0);
    });
  });

  it('should list products with inventory details', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('inventories');
  });

  it('should reject duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate', sku: 'TEST-SKU-1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already exists');
  });
});

// ── Warehouse Tests ─────────────────────────────────────────────────────
describe('Warehouse Operations', () => {
  it('should create a warehouse and auto-initialize inventory for all products', async () => {
    const res = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Auto-Init WH', code: 'W-AUTO-INIT' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Auto-Init WH');

    // Verify inventory was auto-initialized for all existing products
    const productsRes = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);

    for (const product of productsRes.body) {
      const inv = product.inventories.find(
        (i: any) => i.warehouseId === res.body.id
      );
      expect(inv).toBeDefined();
      expect(inv.quantity).toBe(0);
    }
  });

  it('should list warehouses', async () => {
    const res = await request(app)
      .get('/api/warehouses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should reject duplicate warehouse code', async () => {
    const res = await request(app)
      .post('/api/warehouses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate', code: 'W-TEST-1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already exists');
  });
});

// ── Inventory / Stock Operation Tests ───────────────────────────────────
describe('Inventory Operations', () => {
  it('should retrieve inventory records', async () => {
    const res = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should retrieve inventory filtered by productId', async () => {
    const res = await request(app)
      .get(`/api/inventory?productId=${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((inv: any) => {
      expect(inv.productId).toBe(productId);
    });
  });

  it('should add stock correctly', async () => {
    const res = await request(app)
      .post('/api/inventory/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        warehouseId: warehouse2Id,
        quantity: 50
      });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(50);
  });

  it('should reject adding zero quantity', async () => {
    const res = await request(app)
      .post('/api/inventory/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        warehouseId: warehouse2Id,
        quantity: 0
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('greater than 0');
  });

  it('should reject adding negative quantity', async () => {
    const res = await request(app)
      .post('/api/inventory/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        warehouseId: warehouse2Id,
        quantity: -10
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('greater than 0');
  });

  it('should prevent negative quantities on remove', async () => {
    const res = await request(app)
      .post('/api/inventory/remove')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        warehouseId: warehouse1Id,
        quantity: 200 // More than available (100)
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Insufficient stock');
  });

  it('should transfer stock successfully', async () => {
    const res = await request(app)
      .post('/api/inventory/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        sourceWarehouseId: warehouse1Id,
        destinationWarehouseId: warehouse2Id,
        quantity: 50
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Transfer successful');
  });

  it('should fail transfer if insufficient stock', async () => {
    const res = await request(app)
      .post('/api/inventory/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        sourceWarehouseId: warehouse1Id,
        destinationWarehouseId: warehouse2Id,
        quantity: 100 // Only 50 remaining after previous transfer
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Insufficient stock in source warehouse');
  });

  it('should reject transfer to the same warehouse', async () => {
    const res = await request(app)
      .post('/api/inventory/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        sourceWarehouseId: warehouse1Id,
        destinationWarehouseId: warehouse1Id,
        quantity: 10
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('different');
  });

  it('should verify failed transfer leaves both warehouses unchanged', async () => {
    // Get current quantities
    const beforeRes = await request(app)
      .get(`/api/inventory?productId=${productId}`)
      .set('Authorization', `Bearer ${token}`);

    const beforeSource = beforeRes.body.find((i: any) => i.warehouseId === warehouse1Id);
    const beforeDest = beforeRes.body.find((i: any) => i.warehouseId === warehouse2Id);

    // Attempt a transfer that should fail
    await request(app)
      .post('/api/inventory/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        sourceWarehouseId: warehouse1Id,
        destinationWarehouseId: warehouse2Id,
        quantity: 999999
      });

    // Verify quantities haven't changed
    const afterRes = await request(app)
      .get(`/api/inventory?productId=${productId}`)
      .set('Authorization', `Bearer ${token}`);

    const afterSource = afterRes.body.find((i: any) => i.warehouseId === warehouse1Id);
    const afterDest = afterRes.body.find((i: any) => i.warehouseId === warehouse2Id);

    expect(afterSource.quantity).toBe(beforeSource.quantity);
    expect(afterDest.quantity).toBe(beforeDest.quantity);
  });
});
