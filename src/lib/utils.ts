import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Indian phone numbers
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

export function generateBillNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `BILL-${timestamp}-${random}`;
}

export function generateQRCode(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`.toUpperCase();
}

export function calculateEstimatedTime(items: any[]): number {
  // Calculate estimated preparation time based on menu items
  return items.reduce((total, item) => {
    return total + (item.preparationTime * item.quantity);
  }, 0);
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return formatDate(date);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateTax(amount: number, taxRate: number): number {
  return (amount * taxRate) / 100;
}

export function calculateServiceCharge(amount: number, serviceChargeRate: number): number {
  return (amount * serviceChargeRate) / 100;
}

export function calculateFinalAmount(
  subtotal: number,
  taxRate: number,
  serviceChargeRate: number,
  discountAmount: number = 0
): number {
  const tax = calculateTax(subtotal, taxRate);
  const serviceCharge = calculateServiceCharge(subtotal, serviceChargeRate);
  return subtotal + tax + serviceCharge - discountAmount;
}

export function parseQRCode(qrCode: string): { tableId?: string; restaurantId?: string } {
  try {
    const parts = qrCode.split('-');
    if (parts.length >= 2) {
      return {
        tableId: parts[0],
        restaurantId: parts[1],
      };
    }
    return {};
  } catch {
    return {};
  }
}

export function generateQRData(tableId: string, restaurantId: string): string {
  return `${tableId}-${restaurantId}`;
}

export function getRecommendedQuantity(
  baseQuantity: number,
  perPerson: number,
  partySize: number
): number {
  return Math.max(baseQuantity, perPerson * partySize);
}

export function isValidCoupon(
  coupon: any,
  orderAmount: number,
  currentDate: Date = new Date()
): { isValid: boolean; message?: string } {
  if (!coupon.isActive) {
    return { isValid: false, message: 'Coupon is not active' };
  }

  if (currentDate < coupon.validFrom || currentDate > coupon.validUntil) {
    return { isValid: false, message: 'Coupon has expired' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { isValid: false, message: 'Coupon usage limit reached' };
  }

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return { 
      isValid: false, 
      message: `Minimum order amount is ${formatCurrency(coupon.minOrderAmount)}` 
    };
  }

  return { isValid: true };
}

export function calculateCouponDiscount(
  coupon: any,
  orderAmount: number
): number {
  let discount = 0;

  if (coupon.type === 'PERCENTAGE') {
    discount = (orderAmount * coupon.value) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else if (coupon.type === 'FIXED') {
    discount = coupon.value;
  }

  return Math.min(discount, orderAmount);
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject();
      }
      document.body.removeChild(textArea);
    });
  }
}

export function downloadFile(data: Blob, filename: string): void {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getImageOptimizationUrl(
  imageUrl: string,
  width: number,
  height?: number,
  quality: number = 80
): string {
  // This would integrate with your image optimization service (Cloudinary, etc.)
  const baseUrl = process.env.CLOUDINARY_CLOUD_NAME 
    ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch`
    : imageUrl;
  
  if (baseUrl.includes('cloudinary.com')) {
    const transformations = [
      `w_${width}`,
      height ? `h_${height}` : '',
      `q_${quality}`,
      'f_auto'
    ].filter(Boolean).join(',');
    
    return `${baseUrl}/${transformations}/${encodeURIComponent(imageUrl)}`;
  }
  
  return imageUrl;
}
