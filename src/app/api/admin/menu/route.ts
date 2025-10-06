import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    const categories = await prisma.category.findMany({
      where: { restaurantId },
      include: {
        menuItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });

  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, name, description, price, categoryId, isVeg, preparationTime, variants, addOns, allergens } = body;

    if (!restaurantId || !name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId,
        categoryId,
        name,
        description,
        price: parseFloat(price),
        isVeg: isVeg || false,
        preparationTime: parseInt(preparationTime) || 15,
        variants: variants ? JSON.stringify(variants) : JSON.stringify([]),
        addOns: addOns ? JSON.stringify(addOns) : JSON.stringify([]),
        allergens: allergens || [],
        isAvailable: true,
        isRecommended: false,
        quickAddOrder: 0,
        sortOrder: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem,
    });

  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
