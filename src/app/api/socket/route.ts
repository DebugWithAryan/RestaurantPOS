import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Socket.io server is running',
    status: 'connected',
    timestamp: new Date().toISOString(),
    endpoints: {
      websocket: '/api/socket',
      events: [
        'join_restaurant',
        'join_session', 
        'order_update',
        'cart_update',
        'payment_update',
        'table_update',
        'send_notification'
      ]
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle HTTP-based socket events for clients that can't use WebSockets
    console.log('HTTP Socket event received:', body);
    
    // This would typically broadcast to connected WebSocket clients
    // For now, we'll just acknowledge the event
    
    return NextResponse.json({
      success: true,
      message: 'Event processed via HTTP',
      timestamp: new Date().toISOString(),
      data: body
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}