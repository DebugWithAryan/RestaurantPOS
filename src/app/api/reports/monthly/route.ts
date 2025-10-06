import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!restaurantId || !month || !year) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get restaurant information
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        name: true,
        address: true,
        phone: true,
        email: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, message: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    // Get orders for the month
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        placedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
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
    });

    // Get feedback for the month
    const feedback = await prisma.feedback.findMany({
      where: {
        restaurantId,
        submittedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const averageRating = feedback.length > 0 
      ? feedback.reduce((sum: number, f: any) => sum + f.rating, 0) / feedback.length 
      : 0;

    // Payment method breakdown
    const paymentMethods = orders.reduce((acc: any, order: any) => {
      order.payments.forEach((payment: any) => {
        acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
      });
      return acc;
    }, {} as Record<string, number>);

    // Top selling items
    const itemSales = orders.reduce((acc: any, order: any) => {
      order.items.forEach((item: any) => {
        const key = item.menuItem.name;
        acc[key] = (acc[key] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    const topSellingItems = Object.entries(itemSales)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10);

    // Daily sales breakdown
    const dailySales = orders.reduce((acc: any, order: any) => {
      const date = order.placedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + order.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    // Table performance
    const tablePerformance = orders.reduce((acc: any, order: any) => {
      const tableNumber = order.table.number;
      if (!acc[tableNumber]) {
        acc[tableNumber] = { orders: 0, revenue: 0 };
      }
      acc[tableNumber].orders += 1;
      acc[tableNumber].revenue += order.totalAmount;
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    // Generate report data
    const reportData = {
      restaurant,
      period: {
        month: parseInt(month),
        year: parseInt(year),
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      },
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        averageRating,
        totalFeedback: feedback.length,
      },
      paymentMethods,
      topSellingItems,
      dailySales,
      tablePerformance,
      orders: orders.map((order: any) => ({
        id: order.id,
        tableNumber: order.table.number,
        totalAmount: order.totalAmount,
        status: order.status,
        placedAt: order.placedAt,
        items: order.items.map((item: any) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.price,
        })),
      })),
      feedback: feedback.map((f: any) => ({
        rating: f.rating,
        comments: f.comments,
        submittedAt: f.submittedAt,
      })),
    };

    return NextResponse.json({
      success: true,
      data: reportData,
    });

  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, month, year, email } = await request.json();

    if (!restaurantId || !month || !year) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate PDF report
    const reportData = await generatePDFReport(restaurantId, month, year);
    
    // Send email if provided
    if (email) {
      await sendReportEmail(email, reportData);
    }

    return NextResponse.json({
      success: true,
      message: 'Report generated and sent successfully',
      downloadUrl: reportData.pdfUrl,
    });

  } catch (error) {
    console.error('Error generating PDF report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
}

async function generatePDFReport(restaurantId: string, month: number, year: number) {
  // This would integrate with a PDF generation library like jsPDF or Puppeteer
  // For now, we'll return a mock response
  
  const reportId = `report-${restaurantId}-${year}-${month}-${Date.now()}`;
  const pdfUrl = `/api/reports/download/${reportId}`;
  
  // In a real implementation, you would:
  // 1. Generate the PDF using the report data
  // 2. Store it in cloud storage (AWS S3, Google Cloud Storage, etc.)
  // 3. Return the public URL
  
  return {
    reportId,
    pdfUrl,
    generatedAt: new Date().toISOString(),
  };
}

async function sendReportEmail(email: string, reportData: any) {
  // This would integrate with an email service like SendGrid, Resend, or AWS SES
  // For now, we'll just log the action
  
  console.log(`Sending monthly report to ${email}:`, reportData.pdfUrl);
  
  // In a real implementation, you would:
  // 1. Create an email template
  // 2. Attach the PDF report
  // 3. Send the email using your email service
}
