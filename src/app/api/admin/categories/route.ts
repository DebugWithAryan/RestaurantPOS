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
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, name, description, image, sortOrder } = body;

    if (!restaurantId || !name) {
      return NextResponse.json(
        { success: false, message: 'Restaurant ID and name are required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        restaurantId,
        name,
        description,
        image,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category' },
      { status: 500 }
    );
  }
}
