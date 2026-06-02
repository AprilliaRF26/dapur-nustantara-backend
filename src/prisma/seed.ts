import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Admin ──────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('123456', 10);

  await prisma.employee.upsert({
    where: { email: 'sephia@gmail.com' },
    update: {},
    create: {
      name: 'Sephia Anggraini',
      email: 'sephia@gmail.com',
      password: hashedPassword,
      phone: '082134567890',
      role: 'ADMIN',
      is_active: true,
    },
  });

  console.log('✅ Admin created');

  // ── Categories ─────────────────────────────────────
  const categories = [
    { name: 'Nasi & Lauk', icon: '🍚' },
    { name: 'Berkuah', icon: '🍜' },
    { name: 'Gorengan', icon: '🍟' },
    { name: 'Lauk', icon: '🍗' },
    { name: 'Minuman', icon: '🥤' },
    { name: 'Dessert', icon: '🍮' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Categories created');

  // ── Menu Items ─────────────────────────────────────
  const nasiLauk = await prisma.category.findUnique({ where: { name: 'Nasi & Lauk' } });
  const berkuah = await prisma.category.findUnique({ where: { name: 'Berkuah' } });
  const gorengan = await prisma.category.findUnique({ where: { name: 'Gorengan' } });
  const lauk = await prisma.category.findUnique({ where: { name: 'Lauk' } });
  const minuman = await prisma.category.findUnique({ where: { name: 'Minuman' } });
  const dessert = await prisma.category.findUnique({ where: { name: 'Dessert' } });

  const menuItems = [
    { category_id: nasiLauk!.category_id, name: 'Nasi Pecel', description: 'Nasi dengan sayuran segar disiram bumbu kacang khas Jawa', price: 15000, stock: 50 },
    { category_id: nasiLauk!.category_id, name: 'Nasi Campur', description: 'Nasi dengan berbagai lauk pilihan', price: 18000, stock: 50 },
    { category_id: nasiLauk!.category_id, name: 'Nasi Bakar Ayam', description: 'Nasi dibakar dengan ayam bumbu rempah dibungkus daun pisang', price: 20000, stock: 30 },
    { category_id: berkuah!.category_id, name: 'Soto Ayam Lamongan', description: 'Soto ayam kuah bening dengan tauge dan perkedel', price: 16000, stock: 40 },
    { category_id: berkuah!.category_id, name: 'Rawon', description: 'Sup daging sapi berkuah hitam dengan kluwek khas Jawa Timur', price: 22000, stock: 30 },
    { category_id: gorengan!.category_id, name: 'Tempe Mendoan', description: 'Tempe tipis digoreng dengan tepung bumbu setengah matang', price: 8000, stock: 100 },
    { category_id: gorengan!.category_id, name: 'Bakwan Jagung', description: 'Gorengan jagung manis dengan bumbu rempah', price: 7000, stock: 100 },
    { category_id: lauk!.category_id, name: 'Ayam Bakar Bumbu Jawa', description: 'Ayam bakar dengan bumbu rempah khas Jawa', price: 25000, stock: 40 },
    { category_id: lauk!.category_id, name: 'Ayam Geprek', description: 'Ayam goreng crispy digeprek dengan sambal bawang pedas', price: 20000, stock: 40 },
    { category_id: minuman!.category_id, name: 'Es Teh Manis', description: 'Teh manis dingin segar', price: 5000, stock: 200 },
    { category_id: minuman!.category_id, name: 'Wedang Jahe', description: 'Minuman jahe hangat menyegarkan', price: 8000, stock: 100 },
    { category_id: dessert!.category_id, name: 'Klepon', description: 'Kue bola hijau isi gula merah berbalut kelapa parut', price: 10000, stock: 50 },
    { category_id: dessert!.category_id, name: 'Pisang Goreng', description: 'Pisang goreng crispy dengan taburan gula halus', price: 10000, stock: 60 },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { menu_item_id: menuItems.indexOf(item) + 1 },
      update: {},
      create: { ...item, is_available: true },
    });
  }

  console.log('✅ Menu items created');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });