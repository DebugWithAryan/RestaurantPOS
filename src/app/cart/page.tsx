'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Trash2, Clock, CreditCard, Users, AlertCircle } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { formatCurrency, getRecommendedQuantity } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, totalAmount, updateItem, removeItem, clearCart, setReadyForBilling, isReadyForBilling } = useCart();
  
  const [partySize, setPartySize] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (itemCount === 0) {
      router.push('/scan');
    }
  }, [itemCount, router]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateItem(itemId, newQuantity);
    }
  };

  const handleReadyForBilling = () => {
    setReadyForBilling(!isReadyForBilling);
    toast.success(isReadyForBilling ? 'Order reopened for editing' : 'Ready for billing!');
  };

  const handleProceedToPayment = () => {
    if (itemCount === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      router.push('/payment');
      setIsProcessing(false);
    }, 1000);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
    toast.success('Cart cleared');
  };

  const calculateEstimatedTime = () => {
    // Calculate based on preparation times of items
    const totalTime = items.reduce((total, item) => {
      return total + (15 * item.quantity); // Assume 15 min per item
    }, 0);
    
    return Math.max(totalTime, 10); // Minimum 10 minutes
  };

  const calculateTax = (amount: number) => {
    return amount * 0.18; // 18% GST
  };

  const calculateServiceCharge = (amount: number) => {
    return amount * 0.05; // 5% service charge
  };

  const subtotal = totalAmount;
  const tax = calculateTax(subtotal);
  const serviceCharge = calculateServiceCharge(subtotal);
  const finalTotal = subtotal + tax + serviceCharge;

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
          <Link href="/scan" className="btn btn-primary">
            Scan QR Code
          </Link>
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
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">Your Order</h1>
            
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Clear All
            </button>
          </div>
        </div>
      </header>

      <div className="container-app py-6">
        <div className="max-w-2xl mx-auto">
          {/* Party Size */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Party Size</h3>
                  <p className="text-sm text-gray-600">For quantity recommendations</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                  {partySize}
                </span>
                
                <button
                  onClick={() => setPartySize(partySize + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {item.selectedVariant && (
                      <p className="text-sm text-gray-600">{item.selectedVariant.name}</p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-sm text-blue-600 italic">"{item.specialInstructions}"</p>
                    )}
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Special Instructions</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests for your order? (e.g., less spicy, no onions, extra sauce)"
              className="w-full h-24 input resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18% GST)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Service Charge (5%)</span>
                <span className="font-medium">{formatCurrency(serviceCharge)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Estimated preparation time: {calculateEstimatedTime()} minutes</span>
            </div>
          </div>

          {/* Ready for Billing Toggle */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Ready for Billing</h3>
                <p className="text-sm text-gray-600">
                  {isReadyForBilling 
                    ? 'Your order is ready for payment processing'
                    : 'Mark when you\'re done adding items'
                  }
                </p>
              </div>
              
              <button
                onClick={handleReadyForBilling}
                className={`w-12 h-6 rounded-full transition-colors ${
                  isReadyForBilling ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  isReadyForBilling ? 'transform translate-x-6' : 'transform translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleProceedToPayment}
              disabled={isProcessing || !isReadyForBilling}
              className="w-full btn btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner w-5 h-5 mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </div>
              )}
            </button>
            
            <Link href="/menu" className="w-full btn btn-outline text-lg py-4">
              Add More Items
            </Link>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Clear Cart?
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              This will remove all items from your cart. This action cannot be undone.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleClearCart}
                className="w-full btn btn-danger"
              >
                Yes, Clear Cart
              </button>
              
              <button
                onClick={() => setShowClearConfirm(false)}
                className="w-full btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
