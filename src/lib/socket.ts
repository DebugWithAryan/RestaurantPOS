// Socket.io client configuration for RestaurantSaaS

import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(restaurantId: string, userId: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        restaurantId,
        userId,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.isConnected = true;
      
      // Join restaurant room
      this.socket?.emit('join_restaurant', { restaurantId, userId });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Cart events
  emitCartItemAdded(sessionId: string, item: any) {
    this.socket?.emit('cart_item_added', { sessionId, item });
  }

  emitCartItemUpdated(sessionId: string, itemId: string, quantity: number) {
    this.socket?.emit('cart_item_updated', { sessionId, itemId, quantity });
  }

  emitCartItemRemoved(sessionId: string, itemId: string) {
    this.socket?.emit('cart_item_removed', { sessionId, itemId });
  }

  emitCartCleared(sessionId: string) {
    this.socket?.emit('cart_cleared', { sessionId });
  }

  // Session events
  emitBillingReadyToggled(sessionId: string, isReady: boolean, restaurantId: string) {
    this.socket?.emit('billing_ready_toggled', { sessionId, isReady, restaurantId });
  }

  // Order events
  emitNewOrder(orderData: any) {
    this.socket?.emit('new_order', orderData);
  }

  emitOrderStatusUpdate(orderId: string, sessionId: string, status: string, estimatedTime?: number) {
    this.socket?.emit('order_status_update', { orderId, sessionId, status, estimatedTime });
  }

  // Payment events
  emitPaymentUpdate(paymentData: any) {
    this.socket?.emit('payment_update', paymentData);
  }

  // Feedback events
  emitFeedbackSubmitted(feedbackData: any) {
    this.socket?.emit('feedback_submitted', feedbackData);
  }

  // Table events
  emitTableStatusUpdate(tableId: string, restaurantId: string, status: string) {
    this.socket?.emit('table_status_update', { tableId, restaurantId, status });
  }

  // Menu events
  emitMenuUpdated(restaurantId: string, menuData: any) {
    this.socket?.emit('menu_updated', { restaurantId, menuData });
  }

  // Admin events
  emitAdminBroadcast(restaurantId: string, message: string, type: string) {
    this.socket?.emit('admin_broadcast', { restaurantId, message, type });
  }

  // Event listeners
  onCartUpdate(callback: (data: any) => void) {
    this.socket?.on('cart_update', callback);
  }

  onSessionUpdate(callback: (data: any) => void) {
    this.socket?.on('session_update', callback);
  }

  onOrderUpdate(callback: (data: any) => void) {
    this.socket?.on('order_update', callback);
  }

  onPaymentUpdate(callback: (data: any) => void) {
    this.socket?.on('payment_update', callback);
  }

  onAdminNotification(callback: (data: any) => void) {
    this.socket?.on('admin_notification', callback);
  }

  onTableUpdate(callback: (data: any) => void) {
    this.socket?.on('table_update', callback);
  }

  onMenuRefresh(callback: (data: any) => void) {
    this.socket?.on('menu_refresh', callback);
  }

  onAdminBroadcast(callback: (data: any) => void) {
    this.socket?.on('admin_broadcast', callback);
  }

  // Remove listeners
  offCartUpdate(callback?: (data: any) => void) {
    this.socket?.off('cart_update', callback);
  }

  offSessionUpdate(callback?: (data: any) => void) {
    this.socket?.off('session_update', callback);
  }

  offOrderUpdate(callback?: (data: any) => void) {
    this.socket?.off('order_update', callback);
  }

  offPaymentUpdate(callback?: (data: any) => void) {
    this.socket?.off('payment_update', callback);
  }

  offAdminNotification(callback?: (data: any) => void) {
    this.socket?.off('admin_notification', callback);
  }

  offTableUpdate(callback?: (data: any) => void) {
    this.socket?.off('table_update', callback);
  }

  offMenuRefresh(callback?: (data: any) => void) {
    this.socket?.off('menu_refresh', callback);
  }

  offAdminBroadcast(callback?: (data: any) => void) {
    this.socket?.off('admin_broadcast', callback);
  }
}

// Create a singleton instance
export const socketManager = new SocketManager();

// Export the class for custom instances
export default SocketManager;
