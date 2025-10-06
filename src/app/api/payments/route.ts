import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBillNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, amount, method, transactionId, upiId, bankDetails } = body;

    if (!sessionId || !amount || !method) {
      return NextResponse.json(
        { success: false, message: 'Session ID, amount, and payment method are required' },
        { status: 400 }
      );
    }

    // Get session details
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
        restaurant: true,
        table: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        sessionId,
        restaurantId: session.restaurantId,
        amount,
        method,
        status: 'PENDING',
        transactionId,
        upiId,
        bankDetails: bankDetails ? JSON.stringify(bankDetails) : undefined,
      },
    });

    // Simulate payment processing
    // In a real implementation, you would integrate with payment gateways like Razorpay, Stripe, etc.
    setTimeout(async () => {
      try {
        // Update payment status to successful
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            processedAt: new Date(),
          },
        });

        // Update session payment status
        const totalPaid = await prisma.payment.aggregate({
          where: { sessionId, status: 'PAID' },
          _sum: { amount: true },
        });

        const paymentStatus = totalPaid._sum.amount! >= session.totalAmount ? 'PAID' : 'PARTIAL';
        
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            paidAmount: totalPaid._sum.amount!,
            paymentStatus,
          },
        });

        // If payment is complete, create bill
        if (paymentStatus === 'PAID') {
          await createBill(sessionId, session);
        }

      } catch (error) {
        console.error('Error processing payment:', error);
        
        // Update payment status to failed (Note: FAILED is not in the enum, using PENDING instead)
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PENDING', // Will be handled differently in real implementation
          },
        });
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: 'Payment initiated',
      data: {
        paymentId: payment.id,
        status: 'PROCESSING',
        amount,
        method,
      },
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

async function createBill(sessionId: string, session: any) {
  try {
    const billNumber = generateBillNumber();
    
    // Prepare bill items
    const billItems = [];
    for (const order of session.orders) {
      for (const item of order.items) {
        billItems.push({
          menuItemId: item.menuItemId,
          name: item.menuItem.name,
          quantity: item.quantity,
          unitPrice: item.price / item.quantity,
          totalPrice: item.price,
          variant: item.selectedVariant ? JSON.parse(item.selectedVariant).name : null,
          addOns: item.selectedAddOns ? JSON.parse(item.selectedAddOns).map((addOn: any) => addOn.name) : [],
        });
      }
    }

    const subtotal = session.totalAmount;
    const taxAmount = subtotal * 0.18; // 18% GST
    const serviceCharge = subtotal * 0.05; // 5% service charge
    const totalAmount = subtotal + taxAmount + serviceCharge;

    // Get payment methods summary
    const payments = await prisma.payment.findMany({
      where: { sessionId, status: 'PAID' },
    });

    const paymentMethods = payments.reduce((acc: any, payment: any) => {
      if (!acc[payment.method]) {
        acc[payment.method] = { method: payment.method, amount: 0, count: 0 };
      }
      acc[payment.method].amount += payment.amount;
      acc[payment.method].count += 1;
      return acc;
    }, {});

    // Create bill
    const bill = await prisma.bill.create({
      data: {
        sessionId,
        restaurantId: session.restaurantId,
        tableId: session.tableId,
        items: JSON.stringify(billItems),
        subtotal,
        taxAmount,
        serviceCharge,
        totalAmount,
        discountAmount: 0,
        finalAmount: totalAmount,
        paymentMethods: JSON.stringify(Object.values(paymentMethods)),
        billNumber,
        generatedAt: new Date(),
      },
    });

    // Update session status
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });

    // Clear table session
    await prisma.table.update({
      where: { id: session.tableId },
      data: { currentSessionId: null },
    });

    return bill;

  } catch (error) {
    console.error('Error creating bill:', error);
    throw error;
  }
}
