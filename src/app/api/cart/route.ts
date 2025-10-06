import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: {
        menuItem: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      success: true,
      data: {
        items: cartItems,
        totalAmount,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, menuItemId, quantity, selectedVariant, selectedAddOns, specialInstructions } = body;

    if (!sessionId || !menuItemId || !quantity) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get menu item details
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return NextResponse.json(
        { success: false, message: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Calculate price
    let price = menuItem.price;
    if (selectedVariant) {
      price += selectedVariant.priceModifier || 0;
    }
    if (selectedAddOns && selectedAddOns.length > 0) {
      price += selectedAddOns.reduce((sum: number, addOn: any) => 
        sum + (addOn.quantity * addOn.price), 0);
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        sessionId,
        menuItemId,
        specialInstructions,
      },
    });

    let cartItem;
    if (existingItem) {
      // Update existing item
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          price: price,
        },
        include: {
          menuItem: true,
        },
      });
    } else {
      // Create new item
      cartItem = await prisma.cartItem.create({
        data: {
          sessionId,
          menuItemId,
          quantity,
          selectedVariant: selectedVariant ? JSON.stringify(selectedVariant) : undefined,
          selectedAddOns: selectedAddOns ? JSON.stringify(selectedAddOns) : JSON.stringify([]),
          specialInstructions,
          price,
        },
        include: {
          menuItem: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: cartItem,
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: 'Cart item ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      // Remove item from cart
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart',
      });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        menuItem: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cart updated',
      data: cartItem,
    });

  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');
    const sessionId = searchParams.get('sessionId');

    if (cartItemId) {
      // Delete specific item
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else if (sessionId) {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { sessionId },
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Cart item ID or session ID is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: cartItemId ? 'Item removed from cart' : 'Cart cleared',
    });

  } catch (error) {
    console.error('Error deleting from cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete from cart' },
      { status: 500 }
    );
  }
}
