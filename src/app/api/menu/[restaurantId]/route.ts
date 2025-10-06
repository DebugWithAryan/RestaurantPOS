import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Fetch categories with their menu items
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: restaurantId,
        isActive: true,
      },
      include: {
        menuItems: {
          where: {
            isAvailable: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Fetch quick add items (items with quickAddOrder > 0)
    const quickAddItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurantId,
        isAvailable: true,
        quickAddOrder: {
          gt: 0,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        quickAddOrder: 'asc',
      },
      take: 3, // Limit to top 3 quick add items
    });

    // Transform the data to match the frontend interface
    const transformedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      menuItems: category.menuItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        isRecommended: item.isRecommended,
        preparationTime: item.preparationTime,
        variants: item.variants,
        addOns: item.addOns,
        recommendedQuantity: item.recommendedQuantity,
        allergens: item.allergens,
        nutritionalInfo: item.nutritionalInfo,
        category: {
          id: category.id,
          name: category.name,
        },
      })),
    }));

    const transformedQuickAddItems = quickAddItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      images: item.images,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      isRecommended: item.isRecommended,
      preparationTime: item.preparationTime,
      variants: item.variants,
      addOns: item.addOns,
      recommendedQuantity: item.recommendedQuantity,
      allergens: item.allergens,
      nutritionalInfo: item.nutritionalInfo,
      category: item.category,
    }));

    return NextResponse.json({
      success: true,
      categories: transformedCategories,
      quickAddItems: transformedQuickAddItems,
    });

  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}
