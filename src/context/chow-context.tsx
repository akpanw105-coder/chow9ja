import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User, AuthError } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// Domain types
// ─────────────────────────────────────────────────────────────────────────────

export interface FoodOption {
  id: string;
  name: string;
  price: number;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Soups & Swallows' | 'Rice Dishes' | 'Grills & Suya' | 'Snacks & Sides' | 'Soups';
  prepTimeMinutes: number;
  calories?: number;
  isAvailable: boolean;
  image: any;
  spiciness: 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';
  proteins: FoodOption[];
  swallows?: FoodOption[];
  portionSizes?: FoodOption[];
  rating: number;
  reviewCount: number;
}

export interface CartItemOption {
  protein?: FoodOption;
  swallow?: FoodOption;
  portionSize?: FoodOption;
  specialInstructions?: string;
}

export interface CartItem {
  cartItemId: string;
  food: FoodItem;
  quantity: number;
  options: CartItemOption;
  itemTotal: number;
}

export interface DeliveryAddress {
  id: string;
  title: string;
  street: string;
  area: string;
  landmark?: string;
  isDefault: boolean;
  phoneNumber: string;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'cooking'
  | 'dispatched'
  | 'arrived'
  | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  statusUpdates: { status: OrderStatus; time: string; note: string }[];
  address: DeliveryAddress;
  specialInstructions?: string;
  paymentMethod: 'Paystack Card' | 'Bank Transfer (Online)' | 'USSD';
  paymentReference: string;
  paymentStatus: 'Paid' | 'Processing' | 'Failed';
  createdAt: string;
  estimatedDeliveryTime: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  addresses: DeliveryAddress[];
  role: 'customer' | 'admin';
}

// ─────────────────────────────────────────────────────────────────────────────
// Static food catalogue (local data – future: sync with public.foods table)
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_FOODS: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Smokey Party Jollof & Peppered Chicken',
    description: 'Iconic Nigerian firewood-smokey jollof rice paired with tender, spiced peppered grilled chicken quarter and golden fried sweet plantains (dodo).',
    price: 4500,
    category: 'Rice Dishes',
    prepTimeMinutes: 20,
    calories: 780,
    isAvailable: true,
    image: require('@/assets/images/jollof.jpg'),
    spiciness: 'Medium',
    rating: 4.9,
    reviewCount: 342,
    proteins: [
      { id: 'p1', name: 'Peppered Grilled Chicken', price: 0 },
      { id: 'p2', name: 'Fried Assorted Beef', price: 500 },
      { id: 'p3', name: 'Grilled Croaker Fish', price: 1200 },
      { id: 'p4', name: 'Smoked Turkey', price: 1000 },
    ],
    portionSizes: [
      { id: 'sz1', name: 'Single Box (1 Portion)', price: 0 },
      { id: 'sz2', name: 'Chow King Pack (Extra Rice & 2 Dodo)', price: 1400 },
    ],
  },
  {
    id: 'food-2',
    name: 'Pounded Yam & Efo Riro Supreme',
    description: 'Fresh aromatic vegetable soup slow-simmered with iru (locust beans), crayfish, shaki, cow foot and pan-seared fresh fish served with piping hot pounded yam.',
    price: 5200,
    category: 'Soups & Swallows',
    prepTimeMinutes: 25,
    calories: 840,
    isAvailable: true,
    image: require('@/assets/images/eforiro.jpg'),
    spiciness: 'Medium',
    rating: 4.8,
    reviewCount: 219,
    proteins: [
      { id: 'p21', name: 'Pan-seared Fresh Fish & Shaki', price: 0 },
      { id: 'p22', name: 'Tender Goat Meat & Ponmo', price: 800 },
      { id: 'p23', name: 'Full Stockfish Medley', price: 1500 },
    ],
    swallows: [
      { id: 'sw1', name: 'Smooth Pounded Yam (Default)', price: 0 },
      { id: 'sw2', name: 'Yellow Garri (Eba)', price: 0 },
      { id: 'sw3', name: 'Wheat Meal', price: 200 },
      { id: 'sw4', name: 'Amala Dudu', price: 300 },
    ],
  },
  {
    id: 'food-3',
    name: 'Egusi Soup with Assorted Meat & Swallows',
    description: 'Rich, ground melon seed soup enriched with tender shredded beef, honeycomb tripe, dried stockfish flakes, and fresh bitter leaf or ugwu.',
    price: 5000,
    category: 'Soups & Swallows',
    prepTimeMinutes: 22,
    calories: 890,
    isAvailable: true,
    image: require('@/assets/images/egusi.jpg'),
    spiciness: 'Medium',
    rating: 4.9,
    reviewCount: 412,
    proteins: [
      { id: 'p31', name: 'Assorted Tripe & Beef', price: 0 },
      { id: 'p32', name: 'Jumbo Fried Catfish', price: 1200 },
      { id: 'p33', name: 'Crispy Fried Beef', price: 600 },
    ],
    swallows: [
      { id: 'sw31', name: 'Pounded Yam', price: 0 },
      { id: 'sw32', name: 'Ijebu Garri Eba', price: 0 },
      { id: 'sw33', name: 'Semovita', price: 0 },
      { id: 'sw34', name: 'Amala', price: 200 },
    ],
  },
  {
    id: 'food-4',
    name: 'Authentic Beef Suya Skewers & Yaji Spice',
    description: 'Thinly sliced tender prime beef marinated in traditional northern yaji spice and peanut blend, open-flame grilled to smokey perfection. Served with sweet red onions and tomatoes.',
    price: 3200,
    category: 'Grills & Suya',
    prepTimeMinutes: 15,
    calories: 520,
    isAvailable: true,
    image: require('@/assets/images/suya.jpg'),
    spiciness: 'Hot',
    rating: 4.95,
    reviewCount: 520,
    proteins: [
      { id: 'ps1', name: 'Prime Beef Suya (3 Large Skewers)', price: 0 },
      { id: 'ps2', name: 'Chicken Breast Suya', price: 300 },
      { id: 'ps3', name: 'Tozo Suya (Juicy Marbled Cut)', price: 900 },
    ],
    portionSizes: [
      { id: 'sp1', name: 'Regular Pack (3 Skewers)', price: 0 },
      { id: 'sp2', name: 'Party Feast Pack (7 Skewers + Extra Yaji)', price: 3200 },
    ],
  },
  {
    id: 'food-5',
    name: 'Hot & Spicy Goat Meat Pepper Soup',
    description: 'Steaming, aromatic Nigerian herbal broth loaded with tender bite-sized goat meat chunks, uziza seeds, uda, and scent leaf. Deeply soothing.',
    price: 3800,
    category: 'Soups',
    prepTimeMinutes: 15,
    calories: 410,
    isAvailable: true,
    image: require('@/assets/images/peppersoup.jpg'),
    spiciness: 'Extra Hot',
    rating: 4.85,
    reviewCount: 184,
    proteins: [
      { id: 'psb1', name: 'Bone-in Goat Meat Chunks', price: 0 },
      { id: 'psb2', name: 'Fresh Catfish Point & Kill', price: 1400 },
      { id: 'psb3', name: 'Assorted Offal & Intestines', price: 500 },
    ],
  },
  {
    id: 'food-6',
    name: 'Golden Fluffy Puff-Puff (Chow Box)',
    description: 'Deep-fried sweet yeast dough balls with a soft, pillowy interior and light golden exterior. Freshly fried per order.',
    price: 1500,
    category: 'Snacks & Sides',
    prepTimeMinutes: 10,
    calories: 380,
    isAvailable: true,
    image: require('@/assets/images/puffpuff.jpg'),
    spiciness: 'Mild',
    rating: 4.75,
    reviewCount: 167,
    proteins: [
      { id: 'pp1', name: 'Classic Sweet Spiced', price: 0 },
      { id: 'pp2', name: 'Chilli Infused Peppered', price: 200 },
      { id: 'pp3', name: 'Caramel Glaze Topped', price: 500 },
    ],
    portionSizes: [
      { id: 'pb1', name: 'Box of 10 Puffs', price: 0 },
      { id: 'pb2', name: 'Family Box of 25 Puffs', price: 1800 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────────────────

interface ChowContextType {
  // Food items & Admin controls
  foods: FoodItem[];
  addFoodItem: (food: Omit<FoodItem, 'id' | 'rating' | 'reviewCount'>) => void;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;
  deleteFoodItem: (id: string) => void;
  toggleFoodAvailability: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (food: FoodItem, quantity: number, options: CartItemOption) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  createOrder: (params: {
    address: DeliveryAddress;
    paymentMethod: 'Paystack Card' | 'Bank Transfer (Online)' | 'USSD';
    specialInstructions?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  updateOrderPaymentStatus: (orderId: string, status: 'Paid' | 'Processing' | 'Failed') => void;

  // User Profile & Addresses
  user: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addresses: DeliveryAddress[];
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => void;
  setDefaultAddress: (id: string) => void;
  deleteAddress: (id: string) => void;

  // Auth State (backed by real Supabase Auth)
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  signIn: (email: string, password: string, role?: 'customer' | 'admin') => Promise<void>;
  signUp: (name: string, email: string, phone: string, password: string, role?: 'customer' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  currentRole: 'customer' | 'admin';
  switchRole: (role: 'customer' | 'admin') => void;

  // Tracking
  currentTrackingOrderId: string;
  setCurrentTrackingOrderId: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

const ChowContext = createContext<ChowContextType | undefined>(undefined);

const GUEST_USER: UserProfile = {
  id: '',
  fullName: '',
  email: '',
  phone: '',
  addresses: [],
  role: 'customer',
};

export const ChowProvider = ({ children }: { children: ReactNode }) => {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ── App state ───────────────────────────────────────────────────────────────
  const [foods, setFoods] = useState<FoodItem[]>(INITIAL_FOODS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [currentTrackingOrderId, setCurrentTrackingOrderId] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<'customer' | 'admin'>('customer');
  const [user, setUser] = useState<UserProfile>(GUEST_USER);

  // ── Load orders from public.orders table ──────────────────────────────────
  const loadOrders = async (userId: string, role: 'customer' | 'admin') => {
    const query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Admins see all orders; customers see only their own
    if (role !== 'admin') {
      query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[Chow] Orders fetch error:', error.message);
      return;
    }

    const mapped: Order[] = (data ?? []).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      items: (row.items_json as CartItem[]) ?? [],
      subtotal: row.subtotal,
      deliveryFee: row.delivery_fee,
      serviceFee: row.service_fee,
      total: row.total,
      status: row.status as OrderStatus,
      statusUpdates: (row.status_updates_json as Order['statusUpdates']) ?? [
        { status: row.status as OrderStatus, time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Order placed' },
      ],
      address: row.address_json as DeliveryAddress,
      specialInstructions: row.special_instructions ?? undefined,
      paymentMethod: row.payment_method as Order['paymentMethod'],
      paymentReference: row.payment_reference,
      paymentStatus: row.payment_status as Order['paymentStatus'],
      createdAt: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedDeliveryTime: '20-30 mins',
    }));

    setOrders(mapped);
  };

  // ── Load addresses from public.addresses table ──────────────────────────────
  const loadAddresses = async (userId: string) => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      console.warn('[Chow] Addresses fetch error:', error.message);
      return;
    }

    const mapped: DeliveryAddress[] = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      street: row.street,
      area: row.area,
      landmark: row.landmark ?? undefined,
      isDefault: row.is_default,
      phoneNumber: row.phone_number ?? '',
    }));

    setAddresses(mapped);
  };

  // ── Load profile from public.profiles table ─────────────────────────────────
  const loadProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('[Chow] Profile fetch error:', error.message);
      }

      const profile = data ?? null;
      const role: 'customer' | 'admin' =
        profile?.role === 'admin' ? 'admin' : 'customer';

      setCurrentRole(role);
      setUser({
        id: authUser.id,
        fullName: profile?.full_name ?? authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? '',
        email: authUser.email ?? '',
        phone: profile?.phone ?? authUser.user_metadata?.phone ?? '',
        role,
        addresses: [],
      });

      // Load addresses and orders for this user
      loadAddresses(authUser.id);
      loadOrders(authUser.id, role);
    } catch (err) {
      console.warn('[Chow] Unexpected profile error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Bootstrap: restore session & listen for auth changes ───────────────────
  useEffect(() => {
    // Load current session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        loadProfile(s.user);
      } else {
        setAuthLoading(false);
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s?.user) {
          await loadProfile(s.user);
        } else {
          setUser(GUEST_USER);
          setCurrentRole('customer');
          setOrders([]);
          setAddresses([]);
          setAuthLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Real-time order subscription (admin: all new orders; customer: own) ─────
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          // Customers only receive their own order events
          if (currentRole !== 'admin' && row['user_id'] !== session.user.id) return;
          const newOrder: Order = {
            id: row['id'] as string,
            orderNumber: row['order_number'] as string,
            items: (row['items_json'] as CartItem[]) ?? [],
            subtotal: row['subtotal'] as number,
            deliveryFee: row['delivery_fee'] as number,
            serviceFee: row['service_fee'] as number,
            total: row['total'] as number,
            status: row['status'] as OrderStatus,
            statusUpdates: [{ status: row['status'] as OrderStatus, time: new Date(row['created_at'] as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Order placed' }],
            address: row['address_json'] as DeliveryAddress,
            specialInstructions: (row['special_instructions'] as string) ?? undefined,
            paymentMethod: row['payment_method'] as Order['paymentMethod'],
            paymentReference: row['payment_reference'] as string,
            paymentStatus: row['payment_status'] as Order['paymentStatus'],
            createdAt: new Date(row['created_at'] as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            estimatedDeliveryTime: '20-30 mins',
          };
          setOrders((prev) => {
            // Avoid duplicates (the createOrder local optimistic update may already be present)
            if (prev.some((o) => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === (row['id'] as string)
                ? { ...o, status: row['status'] as OrderStatus }
                : o
            )
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, currentRole]);

  // ── Auth: sign in ───────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string, role: 'customer' | 'admin' = 'customer') => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { error }: { error: AuthError | null } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        throw error;
      }
      // onAuthStateChange will fire and call loadProfile
      setCurrentRole(role);
    } catch (err: unknown) {
      setAuthLoading(false);
      throw err;
    }
  };

  // ── Auth: sign up ───────────────────────────────────────────────────────────
  const signUp = async (
    fullName: string,
    email: string,
    phone: string,
    password: string,
    role: 'customer' | 'admin' = 'customer'
  ) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { error }: { error: AuthError | null } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role,
          },
        },
      });
      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        throw error;
      }
      // Trigger fires on the database to create the profile row.
      // onAuthStateChange will fire and call loadProfile
      setCurrentRole(role);
    } catch (err: unknown) {
      setAuthLoading(false);
      throw err;
    }
  };

  // ── Auth: sign out ──────────────────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setCart([]);
    setOrders([]);
    setAddresses([]);
    // user reset is handled in onAuthStateChange
  };

  // ── Derived auth state ──────────────────────────────────────────────────────
  const isAuthenticated = !!session;

  // ── Cart ────────────────────────────────────────────────────────────────────
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);

  const addToCart = (food: FoodItem, quantity: number, options: CartItemOption) => {
    let unitPrice = food.price;
    if (options.protein) unitPrice += options.protein.price;
    if (options.swallow) unitPrice += options.swallow.price;
    if (options.portionSize) unitPrice += options.portionSize.price;

    const cartItemId = `${food.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setCart((prev) => [...prev, { cartItemId, food, quantity, options, itemTotal: unitPrice * quantity }]);
  };

  const removeFromCart = (cartItemId: string) =>
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) { removeFromCart(cartItemId); return; }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const unitPrice = item.itemTotal / item.quantity;
          return { ...item, quantity: newQty, itemTotal: unitPrice * newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  // ── Orders ──────────────────────────────────────────────────────────────────
  const createOrder = ({
    address,
    paymentMethod,
    specialInstructions,
  }: {
    address: DeliveryAddress;
    paymentMethod: 'Paystack Card' | 'Bank Transfer (Online)' | 'USSD';
    specialInstructions?: string;
  }): Order => {
    const subtotal = cartSubtotal;
    const deliveryFee = 800;
    const serviceFee = 400;
    const total = subtotal + deliveryFee + serviceFee;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `CHW-${randomSuffix}`;
    const orderId = `ord-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      items: [...cart],
      subtotal,
      deliveryFee,
      serviceFee,
      total,
      status: 'confirmed',
      statusUpdates: [
        {
          status: 'placed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Payment authorized via ${paymentMethod}`,
        },
        {
          status: 'confirmed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: 'Chow kitchen accepted your order',
        },
      ],
      address,
      specialInstructions,
      paymentMethod,
      paymentReference: `PSTK-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      paymentStatus: 'Paid',
      createdAt: 'Just now',
      estimatedDeliveryTime: '20-30 mins',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentTrackingOrderId(orderId);
    clearCart();

    // Persist to Supabase (fire-and-forget; errors logged but do not break UX)
    if (session?.user) {
      supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: session.user.id,
          subtotal,
          delivery_fee: deliveryFee,
          service_fee: serviceFee,
          total,
          status: 'confirmed',
          payment_method: paymentMethod,
          payment_reference: newOrder.paymentReference,
          payment_status: 'Paid',
          address_json: address as unknown as Record<string, unknown>,
          items_json: cart as unknown as Record<string, unknown>[],
          special_instructions: specialInstructions ?? null,
        })
        .then(({ error }) => {
          if (error) console.warn('[Chow] Order persist error:', error.message);
        });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    const defaultNotes: Record<OrderStatus, string> = {
      placed: 'Order received and payment verified',
      confirmed: 'Kitchen accepted the order',
      cooking: 'Chef is preparing your fresh meal',
      dispatched: 'Dispatched for drop-off with courier',
      arrived: 'Courier arrived at delivery location',
      delivered: 'Order marked delivered. Enjoy your chow!',
    };
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
            statusUpdates: [...order.statusUpdates, { status, time: timeString, note: note || defaultNotes[status] }],
          };
        }
        return order;
      })
    );
    // Persist status change to Supabase (admin action)
    supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .then(({ error }) => {
        if (error) console.warn('[Chow] Order status update error:', error.message);
      });
  };

  const updateOrderPaymentStatus = (orderId: string, paymentStatus: 'Paid' | 'Processing' | 'Failed') =>
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, paymentStatus } : order)));

  // ── Food Admin ──────────────────────────────────────────────────────────────
  const addFoodItem = (food: Omit<FoodItem, 'id' | 'rating' | 'reviewCount'>) => {
    setFoods((prev) => [{ ...food, id: `food-${Date.now()}`, rating: 5.0, reviewCount: 1 }, ...prev]);
  };

  const updateFoodItem = (id: string, updates: Partial<FoodItem>) =>
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));

  const deleteFoodItem = (id: string) =>
    setFoods((prev) => prev.filter((f) => f.id !== id));

  const toggleFoodAvailability = (id: string) =>
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, isAvailable: !f.isAvailable } : f)));

  // ── Addresses ───────────────────────────────────────────────────────────────
  const addAddress = async (addr: Omit<DeliveryAddress, 'id'>) => {
    const newAddr: DeliveryAddress = { ...addr, id: `addr-${Date.now()}` };
    if (newAddr.isDefault) {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setAddresses((prev) => [...prev, newAddr]);
    }

    if (session?.user) {
      supabase
        .from('addresses')
        .insert({
          user_id: session.user.id,
          title: addr.title,
          street: addr.street,
          area: addr.area,
          landmark: addr.landmark ?? null,
          phone_number: addr.phoneNumber,
          is_default: addr.isDefault,
        })
        .then(({ error }) => {
          if (error) console.warn('[Chow] Address persist error:', error.message);
        });
    }
  };

  const setDefaultAddress = (id: string) =>
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));

  const deleteAddress = (id: string) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id));

  const updateUserProfile = (profile: Partial<UserProfile>) =>
    setUser((prev) => ({ ...prev, ...profile }));

  // ── Role switch (UI convenience — actual role enforced by DB RLS) ───────────
  const switchRole = (role: 'customer' | 'admin') => setCurrentRole(role);

  const activeOrder = orders.find((o) => o.id === currentTrackingOrderId) || orders[0] || null;

  return (
    <ChowContext.Provider
      value={{
        foods,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        toggleFoodAvailability,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        orders,
        activeOrder,
        createOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        user,
        updateUserProfile,
        addresses,
        addAddress,
        setDefaultAddress,
        deleteAddress,
        isAuthenticated,
        authLoading,
        authError,
        signIn,
        signUp,
        signOut,
        currentRole,
        switchRole,
        currentTrackingOrderId,
        setCurrentTrackingOrderId,
      }}>
      {children}
    </ChowContext.Provider>
  );
};

export const useChow = () => {
  const context = useContext(ChowContext);
  if (!context) {
    throw new Error('useChow must be used within a ChowProvider');
  }
  return context;
};
