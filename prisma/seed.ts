import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up
  await prisma.creditTransaction.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.project.deleteMany()
  await prisma.package.deleteMany()
  await prisma.user.deleteMany()

  // Packages
  const pkgLite = await prisma.package.create({
    data: {
      id: 'pkg_lite',
      name: 'Lite',
      slug: 'lite',
      priceRub: 299,
      credits: 5,
      features: JSON.stringify(['До 5 обработок', 'Удаление фона', 'Улучшение качества', '1 формат карточки']),
      recommended: false,
    },
  })

  const pkgPro = await prisma.package.create({
    data: {
      id: 'pkg_pro',
      name: 'Pro',
      slug: 'pro',
      priceRub: 699,
      credits: 15,
      features: JSON.stringify(['До 15 обработок', 'Удаление фона', 'Улучшение качества', '3 формата карточки', '2 обложки']),
      recommended: true,
    },
  })

  const pkgUltra = await prisma.package.create({
    data: {
      id: 'pkg_ultra',
      name: 'Ultra',
      slug: 'ultra',
      priceRub: 1490,
      credits: 40,
      features: JSON.stringify(['До 40 обработок', 'Все функции', 'Заголовок товара', 'Описание товара', 'Premium шаблоны']),
      recommended: false,
    },
  })

  // Users
  const demoUser = await prisma.user.create({
    data: {
      id: 'user_demo',
      telegramId: '123456789',
      name: 'Demo User',
      username: 'demo_user',
      role: 'user',
      credits: 12,
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      id: 'user_admin',
      telegramId: '999999999',
      name: 'Admin',
      username: 'admin_demo',
      role: 'admin',
      credits: 100,
    },
  })

  // Projects
  const proj1 = await prisma.project.create({
    data: {
      id: 'proj_1',
      userId: demoUser.id,
      title: 'Кроссовки Nike Air Max',
      category: 'Одежда и аксессуары',
      sourceImages: JSON.stringify(['/demo/product-1.jpg', '/demo/product-2.jpg']),
      selectedOperations: JSON.stringify(['remove_bg', 'upscale', 'square_format', 'cover']),
      packageId: pkgPro.id,
      priceRub: 699,
      status: 'done',
      resultImages: JSON.stringify(['/demo/result-1.jpg', '/demo/result-2.jpg', '/demo/result-3.jpg']),
    },
  })

  await prisma.project.create({
    data: {
      id: 'proj_2',
      userId: demoUser.id,
      title: 'Беспроводные наушники',
      category: 'Электроника',
      sourceImages: JSON.stringify(['/demo/product-3.jpg']),
      selectedOperations: JSON.stringify(['remove_bg', 'upscale', 'vertical_creative']),
      packageId: pkgLite.id,
      priceRub: 299,
      status: 'payment_review',
    },
  })

  // Payments
  const pay1 = await prisma.payment.create({
    data: {
      id: 'pay_1',
      userId: demoUser.id,
      projectId: proj1.id,
      packageId: pkgPro.id,
      method: 'manual',
      amountRub: 699,
      status: 'paid',
      payerName: 'Иван Иванов',
      payerComment: '1234',
    },
  })

  await prisma.payment.create({
    data: {
      id: 'pay_2',
      userId: demoUser.id,
      packageId: pkgLite.id,
      method: 'manual',
      amountRub: 299,
      status: 'needs_review',
      payerName: 'Иван Иванов',
      payerComment: '5678',
    },
  })

  // Transactions
  await prisma.creditTransaction.create({
    data: {
      userId: demoUser.id,
      type: 'topup',
      amount: 15,
      reason: 'Пополнение по пакету Pro',
      relatedPaymentId: pay1.id,
    },
  })

  await prisma.creditTransaction.create({
    data: {
      userId: demoUser.id,
      type: 'spend',
      amount: -4,
      reason: 'Обработка проекта: Кроссовки Nike Air Max',
      relatedProjectId: proj1.id,
    },
  })

  console.log('✅ Seed complete!')
  console.log(`  - ${await prisma.package.count()} packages`)
  console.log(`  - ${await prisma.user.count()} users`)
  console.log(`  - ${await prisma.project.count()} projects`)
  console.log(`  - ${await prisma.payment.count()} payments`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
