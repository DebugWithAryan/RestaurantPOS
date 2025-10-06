'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Clock, Star, Filter, Search, Users, Zap } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { formatCurrency, getRecommendedQuantity } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  isVeg: boolean;
  isAvailable: boolean;
  isRecommended: boolean;
  preparationTime: number;
  variants: any[];
  addOns: any[];
  recommendedQuantity?: {
    item: string;
    baseQuantity: number;
    perPerson: number;
    description: string;
  };
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  menuItems: MenuItem[];
}

interface SessionData {
  sessionId: string;
  tableId: string;
  tableNumber: string;
  restaurantId: string;
  restaurantName: string;
}

function MenuPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem, items, itemCount, totalAmount, setReadyForBilling, isReadyForBilling } = useCart();
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [partySize, setPartySize] = useState(1);
  const [showPartySizeModal, setShowPartySizeModal] = useState(false);
  const [quickAddItems, setQuickAddItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const sessionId = searchParams.get('session');
    const tableId = searchParams.get('table');
    const restaurantId = searchParams.get('restaurant');

    if (!sessionId || !tableId || !restaurantId) {
      router.push('/scan');
      return;
    }

    // Set session data
    setSessionData({
      sessionId,
      tableId,
      restaurantId,
      tableNumber: '1', // This would come from the API
      restaurantName: 'Demo Restaurant',
    });

    loadMenuData(restaurantId);
  }, [searchParams, router]);

  const loadMenuData = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/menu/${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        setQuickAddItems(data.quickAddItems);
      } else {
        // Fallback to demo data
        setCategories(getDemoCategories());
        setQuickAddItems(getDemoQuickAddItems());
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      // Fallback to demo data
      setCategories(getDemoCategories());
      setQuickAddItems(getDemoQuickAddItems());
    } finally {
      setLoading(false);
    }
  };

  const getDemoCategories = (): Category[] => [
    {
      id: '1',
      name: 'Starters',
      description: 'Begin your meal with our delicious appetizers',
      sortOrder: 1,
      menuItems: [
        {
          id: '1',
          name: 'Paneer Tikka',
          description: 'Cottage cheese marinated in spices and grilled',
          price: 280,
          images: ['/demo/paneer-tikka.jpg'],
          isVeg: true,
          isAvailable: true,
          isRecommended: true,
          preparationTime: 15,
          variants: [],
          addOns: [],
          category: { id: '1', name: 'Starters' },
        },
        {
          id: '2',
          name: 'Chicken Wings',
          description: 'Spicy chicken wings with tangy sauce',
          price: 320,
          images: ['/demo/chicken-wings.jpg'],
          isVeg: false,
          isAvailable: true,
          isRecommended: false,
          preparationTime: 20,
          variants: [],
          addOns: [],
          category: { id: '1', name: 'Starters' },
        },
      ],
    },
    {
      id: '2',
      name: 'Main Course',
      description: 'Hearty main dishes to satisfy your appetite',
      sortOrder: 2,
      menuItems: [
        {
          id: '3',
          name: 'Butter Chicken',
          description: 'Tender chicken in rich tomato and cream sauce',
          price: 450,
          images: ['/demo/butter-chicken.jpg'],
          isVeg: false,
          isAvailable: true,
          isRecommended: true,
          preparationTime: 25,
          variants: [],
          addOns: [],
          recommendedQuantity: {
            item: 'roti',
            baseQuantity: 2,
            perPerson: 2,
            description: 'Recommended: 2 rotis per person',
          },
          category: { id: '2', name: 'Main Course' },
        },
        {
          id: '4',
          name: 'Dal Makhani',
          description: 'Creamy black lentils slow-cooked to perfection',
          price: 380,
          images: ['/demo/dal-makhani.jpg'],
          isVeg: true,
          isAvailable: true,
          isRecommended: true,
          preparationTime: 20,
          variants: [],
          addOns: [],
          recommendedQuantity: {
            item: 'roti',
            baseQuantity: 2,
            perPerson: 2,
            description: 'Recommended: 2 rotis per person',
          },
          category: { id: '2', name: 'Main Course' },
        },
      ],
    },
    {
      id: '3',
      name: 'Bread & Rice',
      description: 'Fresh breads and aromatic rice dishes',
      sortOrder: 3,
      menuItems: [
        {
          id: '5',
          name: 'Butter Roti',
          description: 'Soft wheat bread with butter',
          price: 25,
          images: ['/demo/butter-roti.jpg'],
          isVeg: true,
          isAvailable: true,
          isRecommended: false,
          preparationTime: 5,
          variants: [],
          addOns: [],
          category: { id: '3', name: 'Bread & Rice' },
        },
        {
          id: '6',
          name: 'Basmati Rice',
          description: 'Aromatic long-grain basmati rice',
          price: 180,
          images: ['/demo/basmati-rice.jpg'],
          isVeg: true,
          isAvailable: true,
          isRecommended: false,
          preparationTime: 10,
          variants: [],
          addOns: [],
          category: { id: '3', name: 'Bread & Rice' },
        },
      ],
    },
    {
      id: '4',
      name: 'Beverages',
      description: 'Refreshing drinks and beverages',
      sortOrder: 4,
      menuItems: [
        {
          id: '7',
          name: 'Fresh Lime Soda',
          description: 'Refreshing lime with soda water',
          price: 80,
          images: ['/demo/lime-soda.jpg'],
          isVeg: true,
          isAvailable: true,
          isRecommended: false,
          preparationTime: 3,
          variants: [],
          addOns: [],
          category: { id: '4', name: 'Beverages' },
        },
      ],
    },
  ];

  const getDemoQuickAddItems = (): MenuItem[] => [
    {
      id: '5',
      name: 'Butter Roti',
      description: 'Soft wheat bread with butter',
      price: 25,
      images: ['/demo/butter-roti.jpg'],
      isVeg: true,
      isAvailable: true,
      isRecommended: false,
      preparationTime: 5,
      variants: [],
      addOns: [],
      category: { id: '3', name: 'Bread & Rice' },
    },
    {
      id: '6',
      name: 'Basmati Rice',
      description: 'Aromatic long-grain basmati rice',
      price: 180,
      images: ['/demo/basmati-rice.jpg'],
      isVeg: true,
      isAvailable: true,
      isRecommended: false,
      preparationTime: 10,
      variants: [],
      addOns: [],
      category: { id: '3', name: 'Bread & Rice' },
    },
    {
      id: '7',
      name: 'Fresh Lime Soda',
      description: 'Refreshing lime with soda water',
      price: 80,
      images: ['/demo/lime-soda.jpg'],
      isVeg: true,
      isAvailable: true,
      isRecommended: false,
      preparationTime: 3,
      variants: [],
      addOns: [],
      category: { id: '4', name: 'Beverages' },
    },
  ];

  const filteredCategories = categories.filter(category => {
    if (selectedCategory !== 'all' && category.id !== selectedCategory) {
      return false;
    }
    
    if (searchQuery) {
      const hasMatchingItems = category.menuItems.some(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return hasMatchingItems;
    }
    
    return true;
  });

  const handleAddToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }

    // Create a simplified menu item for the cart
    const cartItem = {
      id: item.id,
      restaurantId: 'demo-restaurant',
      categoryId: item.category.id,
      name: item.name,
      description: item.description,
      price: item.price,
      images: item.images,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      isRecommended: item.isRecommended,
      preparationTime: item.preparationTime,
      variants: item.variants,
      addOns: item.addOns,
      quickAddOrder: 0,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addItem(cartItem, 1);
  };

  const handleQuickAdd = (item: MenuItem) => {
    if (item.recommendedQuantity) {
      const recommendedQty = getRecommendedQuantity(
        item.recommendedQuantity.baseQuantity,
        item.recommendedQuantity.perPerson,
        partySize
      );
      
      const cartItem = {
        id: item.id,
        restaurantId: 'demo-restaurant',
        categoryId: item.category.id,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        isRecommended: item.isRecommended,
        preparationTime: item.preparationTime,
        variants: item.variants,
        addOns: item.addOns,
        quickAddOrder: 0,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      addItem(cartItem, recommendedQty);
      toast.success(`Added ${recommendedQty} ${item.name} (recommended for ${partySize} people)`);
    } else {
      const cartItem = {
        id: item.id,
        restaurantId: 'demo-restaurant',
        categoryId: item.category.id,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        isRecommended: item.isRecommended,
        preparationTime: item.preparationTime,
        variants: item.variants,
        addOns: item.addOns,
        quickAddOrder: 0,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      addItem(cartItem, 1);
    }
  };

  const handleReadyForBilling = () => {
    if (itemCount === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setReadyForBilling(!isReadyForBilling);
    toast.success(isReadyForBilling ? 'Order reopened for editing' : 'Ready for billing!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Session not found. Please scan QR code again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-app py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{sessionData.restaurantName}</h1>
              <p className="text-sm text-gray-600">Table {sessionData.tableNumber}</p>
            </div>
            
            <button
              onClick={() => setShowPartySizeModal(true)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <Users className="w-4 h-4" />
              <span>{partySize} {partySize === 1 ? 'person' : 'people'}</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-32"
            >
              <option value="all">All</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Quick Add Section */}
      {quickAddItems.length > 0 && (
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="container-app">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-900">Quick Add</span>
            </div>
            
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {quickAddItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleQuickAdd(item)}
                  disabled={!item.isAvailable}
                  className="flex items-center space-x-2 bg-primary-50 hover:bg-primary-100 disabled:bg-gray-100 disabled:text-gray-400 text-primary-700 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Categories */}
      <div className="container-app py-6">
        {filteredCategories.map(category => (
          <div key={category.id} className="mb-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600 mt-1">{category.description}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.menuItems.map(item => (
                <div key={item.id} className="menu-item-card">
                  <div className="relative">
                    {item.images.length > 0 && (
                      <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Image placeholder</span>
                        </div>
                      </div>
                    )}
                    
                    {item.isRecommended && (
                      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      <span className="font-bold text-primary-600">{formatCurrency(item.price)}</span>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.preparationTime} min
                      </div>
                      
                      {item.recommendedQuantity && (
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {item.recommendedQuantity.description}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.isAvailable}
                      className="w-full mt-3 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-2xl shadow-strong p-4 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Your Order</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{itemCount} items</span>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-primary-600" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-900">{item.quantity}x {item.name}</span>
                <span className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-primary-600">{formatCurrency(totalAmount)}</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/cart')}
                className="flex-1 btn btn-outline text-sm py-2"
              >
                View Cart
              </button>
              
              <button
                onClick={handleReadyForBilling}
                disabled={itemCount === 0}
                className={`flex-1 btn text-sm py-2 ${
                  isReadyForBilling 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'btn-primary'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isReadyForBilling ? 'Ready ✓' : 'Ready for Bill'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Party Size Modal */}
      {showPartySizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Party Size</h3>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="text-2xl font-bold text-gray-900 w-12 text-center">
                {partySize}
              </div>
              
              <button
                onClick={() => setPartySize(partySize + 1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 text-center mb-6">
              This helps us recommend the right quantities for your group
            </p>
            
            <button
              onClick={() => setShowPartySizeModal(false)}
              className="w-full btn btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}