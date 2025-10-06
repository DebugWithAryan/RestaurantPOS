import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    const { menuItemId } = params;
    const body = await request.json();

    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price) updateData.price = parseFloat(body.price);
    if (body.categoryId) updateData.categoryId = body.categoryId;
    if (body.isVeg !== undefined) updateData.isVeg = body.isVeg;
    if (body.preparationTime) updateData.preparationTime = parseInt(body.preparationTime);
    if (body.variants) updateData.variants = JSON.stringify(body.variants);
    if (body.addOns) updateData.addOns = JSON.stringify(body.addOns);
    if (body.allergens) updateData.allergens = body.allergens;
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;
    if (body.isRecommended !== undefined) updateData.isRecommended = body.isRecommended;
    if (body.quickAddOrder !== undefined) updateData.quickAddOrder = parseInt(body.quickAddOrder);
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder);

    const menuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem,
    });

  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    const { menuItemId } = params;

    await prisma.menuItem.delete({
      where: { id: menuItemId },
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
