import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a restaurant owner
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const owner = await prisma.user.create({
    data: {
      email: 'owner@restaurant.com',
      name: 'Restaurant Owner',
      phone: '+91 9876543210',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      isActive: true,
    },
  });

  // Create a restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Demo Restaurant',
      slug: 'demo-restaurant',
      description: 'A modern restaurant with delicious food and great service',
      address: '123 Main Street, City, State 12345',
      phone: '+91 9876543210',
      email: 'info@demorestaurant.com',
      logo: '/images/restaurant-logo.png',
      coverImage: '/images/restaurant-cover.jpg',
      theme: {
        primaryColor: '#f97316',
        secondaryColor: '#22c55e',
        accentColor: '#ef4444',
        fontFamily: 'Inter',
      },
      settings: {
        allowSplitBilling: true,
        acceptCash: true,
        acceptUPI: true,
        acceptCards: true,
        enableLoyalty: true,
        enableFeedback: true,
        autoAcceptOrders: false,
        requireTableConfirmation: true,
        taxRate: 18,
        serviceCharge: 5,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        workingHours: {
          monday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
          tuesday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
          wednesday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
          thursday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
          friday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
          saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
          sunday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
        },
        notificationSettings: {
          email: true,
          sms: true,
          whatsapp: false,
          push: true,
          orderNotifications: true,
          paymentNotifications: true,
          feedbackNotifications: true,
        },
      },
      isActive: true,
      ownerId: owner.id,
    },
  });

  // Update owner with restaurant ID
  await prisma.user.update({
    where: { id: owner.id },
    data: { restaurantId: restaurant.id },
  });

  // Create tables
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    const table = await prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        number: i.toString(),
        qrCode: `${restaurant.id}-table-${i}-${Date.now()}`,
        capacity: i <= 5 ? 4 : 6,
        isActive: true,
        location: i <= 5 ? 'Ground Floor' : 'First Floor',
      },
    });
    tables.push(table);
  }

  // Create categories
  const categories = [
    { name: 'Starters', description: 'Appetizers and small plates', sortOrder: 1 },
    { name: 'Main Course', description: 'Hearty main dishes', sortOrder: 2 },
    { name: 'Breads', description: 'Fresh baked breads', sortOrder: 3 },
    { name: 'Beverages', description: 'Drinks and beverages', sortOrder: 4 },
    { name: 'Desserts', description: 'Sweet endings', sortOrder: 5 },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        ...category,
        restaurantId: restaurant.id,
        isActive: true,
      },
    });
    createdCategories.push(created);
  }

  // Create menu items
  const menuItems = [
    // Starters
    {
      name: 'Paneer Tikka',
      description: 'Cottage cheese marinated in spices and grilled',
      price: 180,
      categoryId: createdCategories[0].id,
      isVeg: true,
      preparationTime: 15,
      variants: [
        { id: '1', name: 'Regular', priceModifier: 0, isDefault: true },
        { id: '2', name: 'Extra Spicy', priceModifier: 20, isDefault: false },
      ],
      addOns: [
        { id: '1', name: 'Extra Onions', price: 30, isRequired: false, maxQuantity: 2 },
        { id: '2', name: 'Extra Lemon', price: 10, isRequired: false, maxQuantity: 1 },
      ],
      quickAddOrder: 1,
      allergens: ['dairy'],
      sortOrder: 1,
    },
    {
      name: 'Chicken Tikka',
      description: 'Tender chicken marinated in yogurt and spices',
      price: 220,
      categoryId: createdCategories[0].id,
      isVeg: false,
      preparationTime: 20,
      variants: [
        { id: '1', name: 'Regular', priceModifier: 0, isDefault: true },
        { id: '2', name: 'Extra Spicy', priceModifier: 25, isDefault: false },
      ],
      addOns: [
        { id: '1', name: 'Extra Onions', price: 30, isRequired: false, maxQuantity: 2 },
        { id: '2', name: 'Extra Lemon', price: 10, isRequired: false, maxQuantity: 1 },
      ],
      quickAddOrder: 2,
      allergens: [],
      sortOrder: 2,
    },
    // Main Course
    {
      name: 'Butter Chicken',
      description: 'Tender chicken in rich tomato and cream sauce',
      price: 320,
      categoryId: createdCategories[1].id,
      isVeg: false,
      preparationTime: 25,
      variants: [
        { id: '1', name: 'Regular', priceModifier: 0, isDefault: true },
        { id: '2', name: 'Extra Gravy', priceModifier: 50, isDefault: false },
      ],
      addOns: [
        { id: '1', name: 'Extra Cream', price: 30, isRequired: false, maxQuantity: 1 },
      ],
      quickAddOrder: 3,
      allergens: ['dairy'],
      sortOrder: 1,
    },
    {
      name: 'Dal Makhani',
      description: 'Rich black lentils slow-cooked with cream',
      price: 280,
      categoryId: createdCategories[1].id,
      isVeg: true,
      preparationTime: 20,
      variants: [
        { id: '1', name: 'Regular', priceModifier: 0, isDefault: true },
        { id: '2', name: 'Extra Cream', priceModifier: 40, isDefault: false },
      ],
      addOns: [],
      quickAddOrder: 0,
      allergens: ['dairy'],
      sortOrder: 2,
    },
    // Breads
    {
      name: 'Butter Naan',
      description: 'Soft leavened bread brushed with butter',
      price: 45,
      categoryId: createdCategories[2].id,
      isVeg: true,
      preparationTime: 10,
      variants: [
        { id: '1', name: 'Regular', priceModifier: 0, isDefault: true },
        { id: '2', name: 'Extra Butter', priceModifier: 15, isDefault: false },
      ],
      addOns: [],
      quickAddOrder: 4,
      allergens: ['gluten', 'dairy'],
      sortOrder: 1,
    },
    {
      name: 'Basmati Rice',
      description: 'Fragrant long-grain rice',
      price: 120,
      categoryId: createdCategories[2].id,
      isVeg: true,
      preparationTime: 15,
      variants: [
        { id: '1', name: 'Regular', priceModifier: 0, isDefault: true },
        { id: '2', name: 'Extra Serving', priceModifier: 60, isDefault: false },
      ],
      addOns: [],
      quickAddOrder: 0,
      allergens: [],
      sortOrder: 2,
    },
    // Beverages
    {
      name: 'Fresh Lime Soda',
      description: 'Refreshing lime juice with soda',
      price: 60,
      categoryId: createdCategories[3].id,
      isVeg: true,
      preparationTime: 5,
      variants: [
        { id: '1', name: 'Sweet', priceModifier: 0, isDefault: true },
        { id: '2', name: 'Salt', priceModifier: 0, isDefault: false },
        { id: '3', name: 'Mint', priceModifier: 10, isDefault: false },
      ],
      addOns: [],
      quickAddOrder: 5,
      allergens: [],
      sortOrder: 1,
    },
    {
      name: 'Lassi',
      description: 'Traditional yogurt-based drink',
      price: 80,
      categoryId: createdCategories[3].id,
      isVeg: true,
      preparationTime: 8,
      variants: [
        { id: '1', name: 'Sweet', priceModifier: 0, isDefault: true },
        { id: '2', name: 'Salt', priceModifier: 0, isDefault: false },
        { id: '3', name: 'Mango', priceModifier: 20, isDefault: false },
      ],
      addOns: [],
      quickAddOrder: 0,
      allergens: ['dairy'],
      sortOrder: 2,
    },
    // Desserts
    {
      name: 'Gulab Jamun',
      description: 'Soft milk dumplings in rose-flavored syrup',
      price: 90,
      categoryId: createdCategories[4].id,
      isVeg: true,
      preparationTime: 10,
      variants: [
        { id: '1', name: '2 Pieces', priceModifier: 0, isDefault: true },
        { id: '2', name: '4 Pieces', priceModifier: 80, isDefault: false },
      ],
      addOns: [
        { id: '1', name: 'Extra Rabri', price: 30, isRequired: false, maxQuantity: 1 },
      ],
      quickAddOrder: 0,
      allergens: ['dairy', 'gluten'],
      sortOrder: 1,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        ...item,
        restaurantId: restaurant.id,
        isAvailable: true,
        isRecommended: Math.random() > 0.7,
        images: [`/images/menu/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`],
        nutritionalInfo: {
          calories: Math.floor(Math.random() * 500) + 100,
          protein: Math.floor(Math.random() * 30) + 5,
          carbs: Math.floor(Math.random() * 60) + 10,
          fat: Math.floor(Math.random() * 20) + 2,
        },
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Created owner: ${owner.email}`);
  console.log(`🏪 Created restaurant: ${restaurant.name}`);
  console.log(`🪑 Created ${tables.length} tables`);
  console.log(`📂 Created ${createdCategories.length} categories`);
  console.log(`🍽️ Created ${menuItems.length} menu items`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
