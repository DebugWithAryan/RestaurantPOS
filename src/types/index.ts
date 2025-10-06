// Core types for the Restaurant SaaS application

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  restaurantId?: string;
  loyaltyPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  coverImage?: string;
  theme: RestaurantTheme;
  settings: RestaurantSettings;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logo?: string;
}

export interface RestaurantSettings {
  allowSplitBilling: boolean;
  acceptCash: boolean;
  acceptUPI: boolean;
  acceptCards: boolean;
  enableLoyalty: boolean;
  enableFeedback: boolean;
  autoAcceptOrders: boolean;
  requireTableConfirmation: boolean;
  taxRate: number;
  serviceCharge: number;
  currency: string;
  timezone: string;
  workingHours: WorkingHours;
  notificationSettings: NotificationSettings;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
  orderNotifications: boolean;
  paymentNotifications: boolean;
  feedbackNotifications: boolean;
}

export interface Table {
  id: string;
  restaurantId: string;
  number: string;
  qrCode: string;
  capacity: number;
  isActive: boolean;
  currentSessionId?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  tableId: string;
  restaurantId: string;
  customerId?: string;
  customerPhone?: string;
  status: SessionStatus;
  isReadyForBilling: boolean;
  startedAt: Date;
  endedAt?: Date;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionStatus = 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  isVeg: boolean;
  isAvailable: boolean;
  isRecommended: boolean;
  preparationTime: number; // in minutes
  variants: MenuItemVariant[];
  addOns: MenuItemAddOn[];
  quickAddOrder: number;
  recommendedQuantity?: RecommendedQuantity;
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemVariant {
  id: string;
  name: string;
  priceModifier: number; // can be positive or negative
  isDefault: boolean;
}

export interface MenuItemAddOn {
  id: string;
  name: string;
  price: number;
  isRequired: boolean;
  maxQuantity?: number;
}

export interface RecommendedQuantity {
  item: string;
  baseQuantity: number;
  perPerson: number;
  description: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  sessionId: string;
  quantity: number;
  selectedVariant?: MenuItemVariant;
  selectedAddOns: SelectedAddOn[];
  specialInstructions?: string;
  price: number;
  createdAt: Date;
  name: string;
  menuItem: MenuItem;
}

export interface SelectedAddOn {
  addOnId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  sessionId: string;
  restaurantId: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  estimatedPreparationTime: number;
  specialInstructions?: string;
  placedAt: Date;
  preparedAt?: Date;
  servedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedVariant?: MenuItemVariant;
  selectedAddOns: SelectedAddOn[];
  specialInstructions?: string;
  price: number;
}

export interface Payment {
  id: string;
  sessionId: string;
  orderId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  upiId?: string;
  bankDetails?: BankDetails;
  processedAt: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
}

export type PaymentMethod = 'upi' | 'card' | 'cash' | 'wallet' | 'split';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface Bill {
  id: string;
  sessionId: string;
  restaurantId: string;
  tableId: string;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethods: PaymentMethodSummary[];
  billNumber: string;
  generatedAt: Date;
  pdfUrl?: string;
}

export interface BillItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
  addOns?: string[];
}

export interface PaymentMethodSummary {
  method: PaymentMethod;
  amount: number;
  count: number;
}

export interface Feedback {
  id: string;
  sessionId: string;
  restaurantId: string;
  customerId?: string;
  customerPhone?: string;
  rating: number; // 1-5
  comments?: string;
  categories: FeedbackCategory[];
  isAnonymous: boolean;
  submittedAt: Date;
}

export interface FeedbackCategory {
  category: string; // 'food', 'service', 'ambiance', 'value'
  rating: number;
  comments?: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  restaurantId: string;
  sessionId?: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  reason: string;
  description?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  restaurantId: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_item';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableItems?: string[]; // menu item IDs
  createdBy: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId?: string;
  restaurantId: string;
  tableId?: string;
  sessionId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
}

export type NotificationType = 
  | 'new_order'
  | 'order_ready'
  | 'payment_received'
  | 'feedback_received'
  | 'loyalty_points'
  | 'system_alert'
  | 'promotion';

export interface AuditLog {
  id: string;
  restaurantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Real-time event types
export interface SocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface OrderUpdateEvent {
  orderId: string;
  status: OrderStatus;
  estimatedTime?: number;
  message?: string;
}

export interface CartUpdateEvent {
  sessionId: string;
  cartItems: CartItem[];
  totalAmount: number;
}

export interface SessionUpdateEvent {
  sessionId: string;
  status: SessionStatus;
  isReadyForBilling: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  restaurantName?: string;
}

export interface MenuItemForm {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isVeg: boolean;
  preparationTime: number;
  images: File[];
  variants: Omit<MenuItemVariant, 'id'>[];
  addOns: Omit<MenuItemAddOn, 'id'>[];
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
