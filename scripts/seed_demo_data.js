// Seed demo data into the backend using axios directly
// Usage: node scripts/seed_demo_data.js "Bearer <token>"

import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://103.188.243.122:8888';
const AUTH_HEADER = process.argv[2] || process.env.AUTH || '';

if (!AUTH_HEADER) {
  console.log('Tip: pass token as first arg or AUTH env. Example:');
  console.log('node scripts/seed_demo_data.js "Bearer eyJ..."');
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(AUTH_HEADER ? { Authorization: AUTH_HEADER } : {}),
  },
});

async function seedModels() {
  const models = [
    { modelName: 'EVX 2025', modelYear: 2025, batteryCapacity: 75, range: 450, powerHp: 200, torqueNm: 320, price: 820000000, bodyType: 'SUV' },
    { modelName: 'CityLink 2025', modelYear: 2025, batteryCapacity: 55, range: 350, powerHp: 150, torqueNm: 250, price: 590000000, bodyType: 'Hatchback' },
    { modelName: 'GrandTour 2024', modelYear: 2024, batteryCapacity: 82, range: 520, powerHp: 240, torqueNm: 380, price: 990000000, bodyType: 'MPV' },
    { modelName: 'Summit 2024', modelYear: 2024, batteryCapacity: 90, range: 560, powerHp: 280, torqueNm: 420, price: 1290000000, bodyType: 'SUV' },
    { modelName: 'Micro 2025', modelYear: 2025, batteryCapacity: 35, range: 210, powerHp: 95, torqueNm: 150, price: 320000000, bodyType: 'City' },
  ];
  for (const m of models) {
    try {
      await client.post('/api/models/create', m);
      console.log('Created model:', m.modelName);
    } catch (e) {
      console.log('Model exists or failed:', m.modelName, '-', e?.response?.status || e.message);
    }
  }
}

async function seedStores() {
  const stores = [
    { storeId: 0, storeName: 'EV Hà Nội', address: '123 Láng Hạ, Hà Nội', phone: '0987654321', provinceName: 'Hà Nội', ownerName: 'Nguyễn Văn A', status: 'ACTIVE', contractStartDate: '2025-01-01T00:00:00.000Z', contractEndDate: '2026-01-01T00:00:00.000Z' },
    { storeId: 0, storeName: 'EV Đà Nẵng', address: '45 Bạch Đằng, Đà Nẵng', phone: '0909090909', provinceName: 'Đà Nẵng', ownerName: 'Trần Thị B', status: 'ACTIVE', contractStartDate: '2025-02-01T00:00:00.000Z', contractEndDate: '2026-02-01T00:00:00.000Z' },
    { storeId: 0, storeName: 'EV TP.HCM', address: '789 Nguyễn Huệ, HCM', phone: '0911222333', provinceName: 'TP.HCM', ownerName: 'Lê Văn C', status: 'PENDING', contractStartDate: '2025-03-01T00:00:00.000Z', contractEndDate: '2026-03-01T00:00:00.000Z' },
  ];
  for (const s of stores) {
    try {
      await client.post('/api/stores/create', s);
      console.log('Created store:', s.storeName);
    } catch (e) {
      console.log('Store exists or failed:', s.storeName, '-', e?.response?.status || e.message);
    }
  }
}

async function seedUsers() {
  const users = [
    { fullName: 'Admin Root', email: 'admin@electra.com', password: 'Admin@123', phone: '0900000001', storeName: 'EV Hà Nội', roleName: 'Admin' },
    { fullName: 'EVM Staff 1', email: 'evm1@electra.com', password: 'Evm@123', phone: '0900000002', storeName: 'EV Hà Nội', roleName: 'EVM Staff' },
    { fullName: 'Dealer Manager HN', email: 'dm.hn@electra.com', password: 'Dm@123', phone: '0900000003', storeName: 'EV Hà Nội', roleName: 'Dealer Manager' },
    { fullName: 'Dealer Staff DN', email: 'ds.dn@electra.com', password: 'Ds@123', phone: '0900000004', storeName: 'EV Đà Nẵng', roleName: 'Dealer Staff' },
  ];
  for (const u of users) {
    try {
      await client.post('/api/users/create', u);
      console.log('Created user:', u.fullName);
    } catch (e) {
      console.log('User exists or failed:', u.fullName, '-', e?.response?.status || e.message);
    }
  }
}

async function seedPromotions() {
  const promos = [
    { promotionName: 'Giảm giá mùa hè', description: 'Giảm 10% cho tất cả mẫu xe', promotionType: 'PERCENTAGE', amount: 10, startDate: '2025-06-01', endDate: '2025-06-30', active: true },
    { promotionName: 'Ưu đãi khai trương', description: 'Giảm 5 triệu cho EVX 2025', promotionType: 'AMOUNT', amount: 5000000, startDate: '2025-05-01', endDate: '2025-05-15', active: true },
  ];
  for (const p of promos) {
    try {
      await client.post('/api/promotions/create', p);
      console.log('Created promotion:', p.promotionName);
    } catch (e) {
      console.log('Promotion exists or failed:', p.promotionName, '-', e?.response?.status || e.message);
    }
  }
}

async function main() {
  try {
    await seedModels();
    await seedStores();
    await seedUsers();
    await seedPromotions();
    console.log('Seeding completed.');
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exit(1);
  }
}

main();




