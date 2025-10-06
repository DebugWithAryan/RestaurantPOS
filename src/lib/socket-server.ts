import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { prisma } from './prisma';

export interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

export interface SocketResponse extends NextApiResponse {
  socket: any & {
    server: SocketServer;
  };
}

export const initializeSocket = (server: SocketServer) => {
  if (!server.io) {
    const io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.APP_URL 
          : ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id);

      // Join restaurant room
      socket.on('join_restaurant', async (data: { restaurantId: string, userId?: string }) => {
        const { restaurantId, userId } = data;
        
        if (restaurantId) {
          socket.join(`restaurant:${restaurantId}`);
          console.log(`📡 Socket ${socket.id} joined restaurant: ${restaurantId}`);
          
          // Send current restaurant status
          try {
            const restaurant = await prisma.restaurant.findUnique({
              where: { id: restaurantId },
              include: {
                tables: {
                  include: {
                    sessions: {
                      where: { status: 'ACTIVE' },
                      include: {
                        orders: {
                          where: { status: { in: ['PLACED', 'PREPARING', 'READY'] } },
                          include: {
                            items: {
                              include: {
                                menuItem: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            });

            if (restaurant) {
              socket.emit('restaurant_status', {
                restaurant: {
                  id: restaurant.id,
                  name: restaurant.name,
                  isActive: restaurant.isActive,
                },
                activeSessions: restaurant.tables
                  .flatMap(table => table.sessions)
                  .length,
                pendingOrders: restaurant.tables
                  .flatMap(table => table.sessions)
                  .flatMap(session => session.orders)
                  .filter(order => order.status === 'PLACED')
                  .length,
              });
            }
          } catch (error) {
            console.error('Error fetching restaurant status:', error);
          }
        }
      });

      // Join table session
      socket.on('join_session', (data: { sessionId: string, tableId: string }) => {
        const { sessionId, tableId } = data;
        
        socket.join(`session:${sessionId}`);
        socket.join(`table:${tableId}`);
        console.log(`📡 Socket ${socket.id} joined session: ${sessionId}, table: ${tableId}`);
      });

      // Handle order updates
      socket.on('order_update', async (data: { orderId: string, status: string }) => {
        try {
          const { orderId, status } = data;
          
          // Update order in database
          const order = await prisma.order.update({
            where: { id: orderId },
            data: { 
              status: status as any,
              ...(status === 'PREPARING' && { preparedAt: new Date() }),
              ...(status === 'READY' && { servedAt: new Date() }),
            },
            include: {
              session: {
                include: {
                  table: true,
                  restaurant: true,
                },
              },
            },
          });

          // Broadcast to restaurant staff
          socket.to(`restaurant:${order.sessionId}`).emit('order_status_changed', {
            orderId: order.id,
            status: order.status,
            tableNumber: 'N/A', // Will be fetched from session if needed
            estimatedTime: order.estimatedPreparationTime,
            timestamp: new Date(),
          });

          // Broadcast to specific session
          socket.to(`session:${order.sessionId}`).emit('order_update', {
            orderId: order.id,
            status: order.status,
            estimatedTime: order.estimatedPreparationTime,
            timestamp: new Date(),
          });

        } catch (error) {
          console.error('Error updating order:', error);
          socket.emit('error', { message: 'Failed to update order' });
        }
      });

      // Handle cart updates
      socket.on('cart_update', (data: { sessionId: string, cartItems: any[] }) => {
        const { sessionId, cartItems } = data;
        
        // Broadcast to session
        socket.to(`session:${sessionId}`).emit('cart_updated', {
          sessionId,
          items: cartItems,
          timestamp: new Date(),
        });
      });

      // Handle payment updates
      socket.on('payment_update', (data: { sessionId: string, status: string, amount: number }) => {
        const { sessionId, status, amount } = data;
        
        // Broadcast to session
        socket.to(`session:${sessionId}`).emit('payment_status_changed', {
          sessionId,
          status,
          amount,
          timestamp: new Date(),
        });
      });

      // Handle table status updates
      socket.on('table_update', async (data: { tableId: string, status: string }) => {
        try {
          const { tableId, status } = data;
          
          const table = await prisma.table.findUnique({
            where: { id: tableId },
            include: {
              restaurant: true,
              sessions: {
                where: { status: 'ACTIVE' },
              },
            },
          });

          if (table) {
            // Broadcast to restaurant staff
            socket.to(`restaurant:${table.restaurantId}`).emit('table_status_changed', {
              tableId: table.id,
              tableNumber: table.number,
              status,
              hasActiveSession: table.sessions.length > 0,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.error('Error updating table status:', error);
        }
      });

      // Handle notifications
      socket.on('send_notification', async (data: { 
        userId?: string, 
        restaurantId: string, 
        type: string, 
        title: string, 
        message: string 
      }) => {
        try {
          const notification = await prisma.notification.create({
            data: {
              userId: data.userId,
              restaurantId: data.restaurantId,
              type: data.type as any,
              title: data.title,
              message: data.message,
            },
          });

          // Send to specific user if specified
          if (data.userId) {
            socket.to(`user:${data.userId}`).emit('notification', notification);
          } else {
            // Broadcast to restaurant staff
            socket.to(`restaurant:${data.restaurantId}`).emit('notification', notification);
          }

        } catch (error) {
          console.error('Error creating notification:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    server.io = io;
  }

  return server.io;
};
