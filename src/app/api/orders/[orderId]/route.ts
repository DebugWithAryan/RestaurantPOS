import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        session: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { status, estimatedPreparationTime, cancellationReason } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    // Add timestamp based on status
    switch (status) {
      case 'PREPARING':
        updateData.preparedAt = new Date();
        break;
      case 'READY':
        updateData.servedAt = new Date();
        break;
      case 'CANCELLED':
        updateData.cancelledAt = new Date();
        if (cancellationReason) {
          updateData.cancellationReason = cancellationReason;
        }
        break;
    }

    // Add estimated preparation time if provided
    if (estimatedPreparationTime) {
      updateData.estimatedPreparationTime = estimatedPreparationTime;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order ${status.toLowerCase()} successfully`,
      data: order,
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}
