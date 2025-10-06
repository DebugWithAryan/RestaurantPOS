import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEstimatedTime } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status');

    let whereClause: any = {};

    if (restaurantId) {
      whereClause.restaurantId = restaurantId;
    }

    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    if (status) {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: {
          select: {
            number: true,
          },
        },
        payments: true,
      },
      orderBy: {
        placedAt: 'desc',
      },
      take: 50, // Limit to recent 50 orders
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, items, specialInstructions } = body;

    if (!sessionId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, message: 'Session ID and items are required' },
        { status: 400 }
      );
    }

    // Get session details
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        table: true,
        restaurant: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem) {
        return NextResponse.json(
          { success: false, message: `Menu item not found: ${item.menuItemId}` },
          { status: 404 }
        );
      }

      let itemPrice = menuItem.price;
      
      // Add variant price
      if (item.selectedVariant) {
        itemPrice += item.selectedVariant.priceModifier || 0;
      }

      // Add add-ons price
      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        itemPrice += item.selectedAddOns.reduce((sum: number, addOn: any) => 
          sum + (addOn.quantity * addOn.price), 0);
      }

      totalAmount += itemPrice * item.quantity;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant ? JSON.stringify(item.selectedVariant) : null,
        selectedAddOns: item.selectedAddOns ? JSON.stringify(item.selectedAddOns) : JSON.stringify([]),
        specialInstructions: item.specialInstructions,
        price: itemPrice,
      });
    }

    // Calculate estimated preparation time
    const estimatedTime = calculateEstimatedTime(
      items.map((item: any) => ({
        preparationTime: item.preparationTime || 15,
        quantity: item.quantity,
      }))
    );

    // Create order in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          sessionId,
          restaurantId: session.restaurantId,
          tableId: session.tableId,
          items: {
            create: orderItems,
          },
          status: 'PLACED',
          totalAmount,
          estimatedPreparationTime: estimatedTime,
          specialInstructions,
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });

      // Update session total amount
      await tx.session.update({
        where: { id: sessionId },
        data: {
          totalAmount: session.totalAmount + totalAmount,
        },
      });

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { sessionId },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: result,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to place order' },
      { status: 500 }
    );
  }
}
