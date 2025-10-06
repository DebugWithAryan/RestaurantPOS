'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, MenuItem, MenuItemVariant, SelectedAddOn } from '@/types';
import { useSocket } from './SocketProvider';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  sessionId?: string;
  isReadyForBilling: boolean;
}

interface CartContextType extends CartState {
  addItem: (item: MenuItem, quantity: number, variant?: MenuItemVariant, addOns?: SelectedAddOn[], instructions?: string) => void;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setReadyForBilling: (ready: boolean) => void;
  updateCartFromServer: (items: CartItem[]) => void;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_READY_FOR_BILLING'; payload: boolean }
  | { type: 'UPDATE_FROM_SERVER'; payload: CartItem[] }
  | { type: 'SET_SESSION_ID'; payload: string };

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.menuItemId === action.payload.menuItemId
      );

      let newItems;
      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        totalAmount,
        itemCount,
      };
    }

    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        totalAmount,
        itemCount,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        totalAmount,
        itemCount,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalAmount: 0,
        itemCount: 0,
        isReadyForBilling: false,
      };

    case 'SET_READY_FOR_BILLING':
      return {
        ...state,
        isReadyForBilling: action.payload,
      };

    case 'UPDATE_FROM_SERVER':
      const totalAmount = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: action.payload,
        totalAmount,
        itemCount,
      };

    case 'SET_SESSION_ID':
      return {
        ...state,
        sessionId: action.payload,
      };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalAmount: 0,
    itemCount: 0,
    isReadyForBilling: false,
  });

  const { emit, on, off } = useSocket();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'UPDATE_FROM_SERVER', payload: parsedCart.items || [] });
        if (parsedCart.sessionId) {
          dispatch({ type: 'SET_SESSION_ID', payload: parsedCart.sessionId });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartData = {
      items: state.items,
      sessionId: state.sessionId,
      timestamp: Date.now(),
    };
    localStorage.setItem('restaurant-cart', JSON.stringify(cartData));
  }, [state.items, state.sessionId]);

  // Listen for real-time cart updates
  useEffect(() => {
    const handleCartUpdate = (data: { sessionId: string; items: CartItem[] }) => {
      if (data.sessionId === state.sessionId) {
        dispatch({ type: 'UPDATE_FROM_SERVER', payload: data.items });
      }
    };

    on('cart_update', handleCartUpdate);

    return () => {
      off('cart_update', handleCartUpdate);
    };
  }, [on, off, state.sessionId]);

  const addItem = (
    item: MenuItem,
    quantity: number,
    variant?: MenuItemVariant,
    addOns: SelectedAddOn[] = [],
    instructions?: string
  ) => {
    // Calculate price with variant and add-ons
    let price = item.price;
    if (variant) {
      price += variant.priceModifier;
    }
    if (addOns.length > 0) {
      price += addOns.reduce((sum, addOn) => sum + (addOn.quantity * (addOn.price || 0)), 0);
    }

    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      sessionId: state.sessionId || '',
      quantity,
      selectedVariant: variant,
      selectedAddOns: addOns,
      specialInstructions: instructions,
      price,
      createdAt: new Date(),
      name: item.name,
      menuItem: item,
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });

    // Emit to server for real-time sync
    if (state.sessionId) {
      emit('cart_item_added', {
        sessionId: state.sessionId,
        item: cartItem,
      });
    }

    toast.success(`${item.name} added to cart`);
  };

  const updateItem = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { itemId, quantity } });

    // Emit to server for real-time sync
    if (state.sessionId) {
      emit('cart_item_updated', {
        sessionId: state.sessionId,
        itemId,
        quantity,
      });
    }
  };

  const removeItem = (itemId: string) => {
    const item = state.items.find(item => item.id === itemId);
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });

    // Emit to server for real-time sync
    if (state.sessionId) {
      emit('cart_item_removed', {
        sessionId: state.sessionId,
        itemId,
      });
    }

    if (item) {
      toast.success('Item removed from cart');
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });

    // Emit to server for real-time sync
    if (state.sessionId) {
      emit('cart_cleared', {
        sessionId: state.sessionId,
      });
    }
  };

  const setReadyForBilling = (ready: boolean) => {
    dispatch({ type: 'SET_READY_FOR_BILLING', payload: ready });

    // Emit to server for real-time sync
    if (state.sessionId) {
      emit('billing_ready_toggled', {
        sessionId: state.sessionId,
        isReady: ready,
      });
    }
  };

  const updateCartFromServer = (items: CartItem[]) => {
    dispatch({ type: 'UPDATE_FROM_SERVER', payload: items });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        setReadyForBilling,
        updateCartFromServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
