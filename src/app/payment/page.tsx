'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Users, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

type PaymentMethod = 'upi' | 'card' | 'cash' | 'wallet' | 'split';
type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
}

export default function PaymentPage() {
  const router = useRouter();
  const { items, itemCount, totalAmount, clearCart } = useCart();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [showBill, setShowBill] = useState(false);
  const [billData, setBillData] = useState<any>(null);

  const paymentOptions: PaymentOption[] = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pay via UPI apps like PhonePe, Google Pay, Paytm',
      enabled: true,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Pay using your credit or debit card',
      enabled: true,
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: <Banknote className="w-6 h-6" />,
      description: 'Pay with cash at the counter',
      enabled: true,
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pay using digital wallets',
      enabled: true,
    },
    {
      id: 'split',
      name: 'Split Payment',
      icon: <Users className="w-6 h-6" />,
      description: 'Split the bill among multiple people',
      enabled: true,
    },
  ];

  useEffect(() => {
    if (itemCount === 0) {
      router.push('/scan');
    }
  }, [itemCount, router]);

  const calculateFinalAmount = () => {
    const subtotal = totalAmount;
    const tax = subtotal * 0.18; // 18% GST
    const serviceCharge = subtotal * 0.05; // 5% service charge
    return subtotal + tax + serviceCharge;
  };

  const calculateSplitAmount = () => {
    const finalAmount = calculateFinalAmount();
    return Math.round(finalAmount / splitCount);
  };

  const handlePayment = async () => {
    if (selectedPaymentMethod === 'upi' && !upiId.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }

    if (selectedPaymentMethod === 'cash' && !cashAmount) {
      toast.error('Please enter cash amount');
      return;
    }

    setPaymentStatus('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate bill data
      const billData = {
        billNumber: `BILL-${Date.now()}`,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal: totalAmount,
        tax: totalAmount * 0.18,
        serviceCharge: totalAmount * 0.05,
        total: calculateFinalAmount(),
        paymentMethod: selectedPaymentMethod,
        timestamp: new Date().toISOString(),
      };

      setBillData(billData);
      setPaymentStatus('success');
      setShowBill(true);

      // Clear cart after successful payment
      setTimeout(() => {
        clearCart();
      }, 5000);

      toast.success('Payment successful!');

    } catch (error) {
      setPaymentStatus('failed');
      toast.error('Payment failed. Please try again.');
    }
  };

  const downloadBill = () => {
    // This would generate and download a PDF bill
    toast.success('Bill downloaded successfully!');
  };

  const shareBill = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Your Restaurant Bill',
        text: `Bill Number: ${billData?.billNumber}\nTotal: ${formatCurrency(billData?.total)}`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`Bill Number: ${billData?.billNumber}\nTotal: ${formatCurrency(billData?.total)}`);
      toast.success('Bill details copied to clipboard!');
    }
  };

  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case 'upi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@paytm or 9876543210@ybl"
                className="input"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>Supported UPI apps:</p>
              <div className="flex space-x-4 mt-2">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">PhonePe</span>
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">Google Pay</span>
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">Paytm</span>
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="1234 5678 9012 3456"
                className="input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  maxLength={3}
                  className="input"
                />
              </div>
            </div>
          </div>
        );

      case 'cash':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash Amount
              </label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder={formatCurrency(calculateFinalAmount())}
                className="input"
              />
            </div>
            {cashAmount && parseFloat(cashAmount) > calculateFinalAmount() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  Change: {formatCurrency(parseFloat(cashAmount) - calculateFinalAmount())}
                </p>
              </div>
            )}
          </div>
        );

      case 'split':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split Among
              </label>
              <select
                value={splitCount}
                onChange={(e) => setSplitCount(parseInt(e.target.value))}
                className="input"
              >
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    {num} people
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Each person pays: <span className="font-semibold">{formatCurrency(calculateSplitAmount())}</span>
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (paymentStatus === 'success' && showBill) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-app py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Thank you for your payment. Your order has been confirmed.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-900">Bill Number</span>
                  <span className="font-mono text-gray-600">{billData?.billNumber}</span>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="font-bold text-primary-600">{formatCurrency(billData?.total)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Payment Method</span>
                  <span className="text-gray-600 capitalize">{billData?.paymentMethod}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={downloadBill}
                  className="flex-1 btn btn-outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Bill
                </button>
                
                <button
                  onClick={shareBill}
                  className="flex-1 btn btn-primary"
                >
                  Share Bill
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link href="/feedback" className="btn btn-outline mr-3">
                  Leave Feedback
                </Link>
                
                <Link href="/scan" className="btn btn-primary">
                  New Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-app py-8">
          <div className="max-w-md mx-auto">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h1>
              
              <p className="text-gray-600 mb-6">
                We couldn't process your payment. Please try again or choose a different payment method.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentStatus('pending')}
                  className="w-full btn btn-primary"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => router.back()}
                  className="w-full btn btn-outline"
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
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
              <span>Back to Cart</span>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">Payment</h1>
            
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="container-app py-6">
        <div className="max-w-2xl mx-auto">
          {/* Order Summary */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}x {item.name}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18% GST)</span>
                <span className="font-medium">{formatCurrency(totalAmount * 0.18)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Service Charge (5%)</span>
                <span className="font-medium">{formatCurrency(totalAmount * 0.05)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(calculateFinalAmount())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Payment Method</h2>
            
            <div className="space-y-3 mb-6">
              {paymentOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedPaymentMethod(option.id)}
                  disabled={!option.enabled}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedPaymentMethod === option.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!option.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedPaymentMethod === option.id ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPaymentMethod === option.id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === option.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Form */}
            {renderPaymentForm()}
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={paymentStatus === 'processing'}
            className="w-full btn btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paymentStatus === 'processing' ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner w-5 h-5 mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Pay {formatCurrency(calculateFinalAmount())}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
