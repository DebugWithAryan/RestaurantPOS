'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AnalyticsData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    averageRating: number;
    totalFeedback: number;
  };
  paymentMethods: Record<string, number>;
  topSellingItems: [string, number][];
  dailySales: Record<string, number>;
  tablePerformance: Record<string, { orders: number; revenue: number }>;
  orders: any[];
  feedback: any[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call with demo data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalyticsData({
        summary: {
          totalOrders: 245,
          totalRevenue: 125000,
          averageOrderValue: 510,
          averageRating: 4.2,
          totalFeedback: 89,
        },
        paymentMethods: {
          UPI: 65000,
          CARD: 35000,
          CASH: 20000,
          WALLET: 5000,
        },
        topSellingItems: [
          ['Butter Chicken', 45],
          ['Paneer Tikka', 38],
          ['Dal Makhani', 32],
          ['Basmati Rice', 28],
          ['Butter Roti', 156],
          ['Naan', 89],
          ['Fresh Lime Soda', 67],
          ['Lassi', 43],
        ],
        dailySales: {
          '2024-01-01': 4500,
          '2024-01-02': 5200,
          '2024-01-03': 4800,
          '2024-01-04': 6100,
          '2024-01-05': 5500,
          '2024-01-06': 6800,
          '2024-01-07': 7200,
        },
        tablePerformance: {
          '1': { orders: 23, revenue: 11500 },
          '2': { orders: 18, revenue: 8900 },
          '3': { orders: 25, revenue: 12400 },
          '4': { orders: 20, revenue: 9800 },
          '5': { orders: 22, revenue: 11200 },
        },
        orders: [],
        feedback: [],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      // Generate and download PDF report
      const response = await fetch('/api/reports/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'demo-restaurant',
          month: dateRange.start.getMonth() + 1,
          year: dateRange.start.getFullYear(),
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `restaurant-report-${dateRange.start.getFullYear()}-${dateRange.start.getMonth() + 1}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics data</p>
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
              <h1 className="text-xl font-bold text-gray-900">Analytics & Reports</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input w-32"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
              
              <button
                onClick={loadAnalyticsData}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleExportReport}
                className="btn btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-app py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.summary.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+18% from last month</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.summary.averageOrderValue)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+5% from last month</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.averageRating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+0.2 from last month</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalFeedback}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+25% from last month</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Methods */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h2>
            <div className="space-y-4">
              {Object.entries(analyticsData.paymentMethods).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{method}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Items</h2>
            <div className="space-y-4">
              {analyticsData.topSellingItems.slice(0, 5).map(([item, quantity], index) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{quantity} sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Sales Chart Placeholder */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Sales</h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <p>Sales chart would be rendered here</p>
                <p className="text-sm">Integration with Chart.js or Recharts</p>
              </div>
            </div>
          </div>

          {/* Table Performance */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Table Performance</h2>
            <div className="space-y-4">
              {Object.entries(analyticsData.tablePerformance).map(([table, data]) => (
                <div key={table} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold text-gray-900">Table {table}</span>
                    <p className="text-sm text-gray-600">{data.orders} orders</p>
                  </div>
                  <span className="font-semibold text-primary-600">{formatCurrency(data.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Feedback</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-4 h-4 ${j < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    Great food and excellent service! The staff was very attentive and the atmosphere was perfect for a family dinner.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Table 3 • 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
