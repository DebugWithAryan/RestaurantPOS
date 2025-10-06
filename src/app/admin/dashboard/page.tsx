'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Star, 
  TrendingUp, 
  Clock, 
  QrCode,
  Settings,
  Menu,
  Plus,
  Download,
  Bell,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';

interface DashboardStats {
  activeTables: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  pendingOrders: number;
  completedOrders: number;
}

interface Table {
  id: string;
  number: string;
  status: 'occupied' | 'available' | 'cleaning';
  currentSession?: {
    id: string;
    startedAt: string;
    totalAmount: number;
    itemCount: number;
  };
}

interface Order {
  id: string;
  tableNumber: string;
  items: string[];
  status: 'placed' | 'preparing' | 'ready' | 'served';
  totalAmount: number;
  placedAt: string;
  estimatedTime: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeTables: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  const [tables, setTables] = useState<Table[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls with demo data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        activeTables: 8,
        totalOrders: 45,
        totalRevenue: 125000,
        averageRating: 4.2,
        pendingOrders: 12,
        completedOrders: 33,
      });

      setTables(getDemoTables());
      setRecentOrders(getDemoOrders());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDemoTables = (): Table[] => [
    { id: '1', number: '1', status: 'occupied', currentSession: { id: 'sess1', startedAt: '2024-01-15T10:30:00Z', totalAmount: 1250, itemCount: 4 } },
    { id: '2', number: '2', status: 'available' },
    { id: '3', number: '3', status: 'occupied', currentSession: { id: 'sess2', startedAt: '2024-01-15T11:15:00Z', totalAmount: 890, itemCount: 3 } },
    { id: '4', number: '4', status: 'cleaning' },
    { id: '5', number: '5', status: 'occupied', currentSession: { id: 'sess3', startedAt: '2024-01-15T11:45:00Z', totalAmount: 2100, itemCount: 6 } },
    { id: '6', number: '6', status: 'available' },
    { id: '7', number: '7', status: 'occupied', currentSession: { id: 'sess4', startedAt: '2024-01-15T12:00:00Z', totalAmount: 750, itemCount: 2 } },
    { id: '8', number: '8', status: 'available' },
  ];

  const getDemoOrders = (): Order[] => [
    { id: '1', tableNumber: '5', items: ['Butter Chicken', 'Naan', 'Rice'], status: 'preparing', totalAmount: 650, placedAt: '2024-01-15T12:30:00Z', estimatedTime: 15 },
    { id: '2', tableNumber: '3', items: ['Paneer Tikka', 'Dal Makhani'], status: 'ready', totalAmount: 480, placedAt: '2024-01-15T12:15:00Z', estimatedTime: 5 },
    { id: '3', tableNumber: '1', items: ['Chicken Biryani', 'Raita'], status: 'served', totalAmount: 320, placedAt: '2024-01-15T12:00:00Z', estimatedTime: 0 },
    { id: '4', tableNumber: '7', items: ['Veg Thali'], status: 'placed', totalAmount: 250, placedAt: '2024-01-15T12:45:00Z', estimatedTime: 20 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-gray-100 text-gray-800';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800';
      case 'placed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-orange-100 text-orange-800';
      case 'served': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return '🟢';
      case 'available': return '⚪';
      case 'cleaning': return '🟡';
      case 'placed': return '📝';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'served': return '🍽️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Last updated: {formatTime(new Date())}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              
              <button className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-app py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tables</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTables}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from yesterday</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8% from yesterday</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+15% from yesterday</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+0.2 from last week</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tables Overview */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tables Overview</h2>
                <button className="btn btn-outline">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Codes
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tables.map(table => (
                  <div key={table.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Table {table.number}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                        {getStatusIcon(table.status)} {table.status}
                      </span>
                    </div>
                    
                    {table.currentSession && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Session: {table.currentSession.id.slice(-6)}</p>
                        <p>Items: {table.currentSession.itemCount}</p>
                        <p>Amount: {formatCurrency(table.currentSession.totalAmount)}</p>
                        <p>Started: {formatTime(new Date(table.currentSession.startedAt))}</p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex space-x-2">
                      <button className="flex-1 btn btn-outline text-xs py-1">
                        View
                      </button>
                      {table.status === 'occupied' && (
                        <button className="flex-1 btn btn-primary text-xs py-1">
                          Bill
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <button className="btn btn-outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">Table {order.tableNumber}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p className="truncate">{order.items.join(', ')}</p>
                      <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTime(new Date(order.placedAt))}</span>
                      {order.estimatedTime > 0 && (
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {order.estimatedTime} min
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <button className="flex-1 btn btn-outline text-xs py-1">
                        Details
                      </button>
                      {order.status === 'ready' && (
                        <button className="flex-1 btn btn-primary text-xs py-1">
                          Served
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button className="w-full btn btn-outline justify-start">
                  <Menu className="w-4 h-4 mr-2" />
                  Manage Menu
                </button>
                
                <button className="w-full btn btn-outline justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Reports
                </button>
                
                <button className="w-full btn btn-outline justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Restaurant Settings
                </button>
                
                <button className="w-full btn btn-outline justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Staff Management
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
