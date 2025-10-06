import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSessionId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { qrCode, tableId, restaurantId } = await request.json();

    if (!qrCode || !tableId || !restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Invalid QR code data' },
        { status: 400 }
      );
    }

    // Find the table and restaurant
    const table = await prisma.table.findFirst({
      where: {
        id: tableId,
        restaurantId: restaurantId,
        qrCode: qrCode,
        isActive: true,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            isActive: true,
            settings: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { success: false, message: 'Invalid QR code or table not found' },
        { status: 404 }
      );
    }

    if (!table.restaurant.isActive) {
      return NextResponse.json(
        { success: false, message: 'Restaurant is currently closed' },
        { status: 403 }
      );
    }

    // Check if there's an existing active session for this table
    let session = await prisma.session.findFirst({
      where: {
        tableId: table.id,
        status: 'ACTIVE',
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // If no active session exists, create a new one
    if (!session) {
      session = await prisma.session.create({
        data: {
          id: generateSessionId(),
          tableId: table.id,
          restaurantId: table.restaurantId,
          status: 'ACTIVE',
          startedAt: new Date(),
        },
      });

      // Update table with current session
      await prisma.table.update({
        where: { id: table.id },
        data: { currentSessionId: session.id },
      });
    }

    // Get current cart items for this session
    const cartItems = await prisma.cartItem.findMany({
      where: {
        sessionId: session.id,
      },
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      tableId: table.id,
      tableNumber: table.number,
      restaurantId: table.restaurantId,
      restaurantName: table.restaurant.name,
      cartItems: cartItems,
      isNewSession: !session,
    });

  } catch (error) {
    console.error('QR validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
