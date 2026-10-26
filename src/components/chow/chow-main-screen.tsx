import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChowTheme } from '@/constants/chow-theme';
import { useChow, FoodItem } from '@/context/chow-context';
import { FoodCard } from '@/components/chow/food-card';
import { FoodDetailModal } from '@/components/chow/food-detail-modal';
import { CheckoutView } from '@/components/chow/checkout-view';
import { OrderTrackingView } from '@/components/chow/order-tracking-view';
import { AdminDashboardView } from '@/components/chow/admin-dashboard-view';
import { ProfileAddressesView } from '@/components/chow/profile-addresses-view';
import { AuthOnboardingView } from '@/components/chow/auth-onboarding-view';
import { ChowButton } from '@/components/chow/chow-button';

const CATEGORIES: ('All Delicacies' | FoodItem['category'])[] = [
  'All Delicacies',
  'Rice Dishes',
  'Soups & Swallows',
  'Grills & Suya',
  'Snacks & Sides',
  'Soups',
];

export default function ChowMainScreen() {
  const {
    foods,
    cart,
    cartCount,
    cartSubtotal,
    updateCartQuantity,
    orders,
    isAuthenticated,
    authLoading,
    currentRole,
    setCurrentTrackingOrderId,
  } = useChow();

  const insets = useSafeAreaInsets();

  // Navigation Sub-views
  const [selectedTabScreen, setSelectedTabScreen] = useState<
    'menu' | 'cart' | 'checkout' | 'tracking' | 'orders' | 'profile' | 'admin' | null
  >(null);

  // When selectedTabScreen is null (e.g. after login/session restore), route admins to 'admin' and customers to 'menu'
  const activeScreen: 'menu' | 'cart' | 'checkout' | 'tracking' | 'orders' | 'profile' | 'admin' =
    selectedTabScreen ?? (currentRole === 'admin' ? 'admin' : 'menu');

  const setActiveScreen = (
    screen: 'menu' | 'cart' | 'checkout' | 'tracking' | 'orders' | 'profile' | 'admin'
  ) => {
    setSelectedTabScreen(screen);
  };

  // Search & Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('All Delicacies');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected food for customization modal
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Show branded loader while Supabase restores session from storage
  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FDF8F3', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 32, marginBottom: 16 }}>🍲</Text>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#4D2C1E', letterSpacing: 2, marginBottom: 24 }}>CHOW</Text>
        <ActivityIndicator size="large" color="#C0562A" />
        <Text style={{ marginTop: 16, fontSize: 13, color: '#9E7A66' }}>Loading your Chow session...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthOnboardingView
        onSuccess={() => {
          setSelectedTabScreen(null);
        }}
      />
    );
  }

  // Filter food items
  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      selectedCategory === 'All Delicacies' || food.category === selectedCategory;
    const matchesQuery =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <View style={styles.container}>
      {/* Universal Top Nav Header */}
      <View style={styles.topNavbar}>
        <View style={styles.navBrand}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandIcon}>🍲</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>CHOW</Text>
            <Text style={styles.brandTagline}>Taste of Naija</Text>
          </View>
        </View>

        {/* Header Right Actions */}
        <View style={styles.navRightActions}>
          {/* Admin Switcher Pill — only visible to admin role */}
          {currentRole === 'admin' && (
            <TouchableOpacity
              onPress={() => {
                if (activeScreen === 'admin') {
                  setActiveScreen('menu');
                } else {
                  setActiveScreen('admin');
                }
              }}
              style={[
                styles.rolePill,
                activeScreen === 'admin' && styles.rolePillActive,
              ]}>
              <Text
                style={[
                  styles.rolePillText,
                  activeScreen === 'admin' && styles.rolePillTextActive,
                ]}>
                {activeScreen === 'admin' ? 'Exit Admin' : 'Admin'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Cart Icon Badge */}
          <TouchableOpacity
            onPress={() => setActiveScreen('cart')}
            activeOpacity={0.8}
            style={styles.cartIconWrapper}>
            <Text style={styles.cartEmoji}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeCount}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Routing Body */}
      {activeScreen === 'menu' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.menuScroll,
            { paddingBottom: 80 + Math.max(insets.bottom, 16) },
          ]}>
          {/* Delivery Location Strip */}
          <View style={styles.locationStrip}>
            <View style={styles.locationLeft}>
              <Text style={styles.locationPin}>📍</Text>
              <View>
                <Text style={styles.locationLabel}>Delivering To</Text>
                <Text style={styles.locationAddress}>Silverline Hall • Campus Hostel</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setActiveScreen('profile')}>
              <Text style={styles.changeLocText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Promotional Banner */}
          <View style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <View style={styles.promoPill}>
                <Text style={styles.promoPillText}>HOT & FRESH</Text>
              </View>
              <Text style={styles.promoTitle}>Authentic Firewood Jollof & Beef Suya</Text>
              <Text style={styles.promoSub}>
                100% cashless delivery across campus and residences.
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Search jollof, egusi, suya, swallow..."
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Categories Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesBar}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>{selectedCategory}</Text>
            <Text style={styles.itemCountText}>{filteredFoods.length} meals available</Text>
          </View>

          {/* Foods Grid / Feed */}
          {filteredFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onPress={() => setSelectedFood(food)}
              onQuickAdd={() => setSelectedFood(food)}
            />
          ))}

          {filteredFoods.length === 0 && (
            <View style={styles.noResultsBox}>
              <Text style={styles.noResultsEmoji}>🍽️</Text>
              <Text style={styles.noResultsTitle}>No delicacies found</Text>
              <Text style={styles.noResultsSub}>
                Try searching for another dish or clear category filters.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* SCREEN 2: CART */}
      {activeScreen === 'cart' && (
        <View style={styles.viewBody}>
          <View style={styles.viewHeader}>
            <TouchableOpacity onPress={() => setActiveScreen('menu')}>
              <Text style={styles.headerBack}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.viewTitle}>My Chow Cart</Text>
            <View style={{ width: 40 }} />
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCartBox}>
              <Text style={styles.emptyCartEmoji}>🛍️</Text>
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
              <Text style={styles.emptyCartSub}>
                Hungry for some hot Naija food? Check out our jollof, egusi and grills!
              </Text>
              <View style={{ width: 220, marginTop: 16 }}>
                <ChowButton title="Browse Menu" onPress={() => setActiveScreen('menu')} />
              </View>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.cartContent,
                { paddingBottom: 80 + Math.max(insets.bottom, 16) },
              ]}>
              {cart.map((item) => (
                <View key={item.cartItemId} style={styles.cartItemCard}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.food.name}</Text>
                    {item.options.protein && (
                      <Text style={styles.cartItemSub}>
                        Protein: {item.options.protein.name}
                      </Text>
                    )}
                    {item.options.swallow && (
                      <Text style={styles.cartItemSub}>
                        Swallow: {item.options.swallow.name}
                      </Text>
                    )}
                    {item.options.specialInstructions && (
                      <Text style={styles.cartItemNote}>
                        Note: &ldquo;{item.options.specialInstructions}&rdquo;
                      </Text>
                    )}
                    <Text style={styles.cartItemPrice}>
                      ₦{item.itemTotal.toLocaleString()}
                    </Text>
                  </View>

                  {/* Quantity controls */}
                  <View style={styles.cartQtyControls}>
                    <TouchableOpacity
                      onPress={() =>
                        updateCartQuantity(item.cartItemId, item.quantity - 1)
                      }
                      style={styles.cartQtyBtn}>
                      <Text style={styles.cartQtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.cartQtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        updateCartQuantity(item.cartItemId, item.quantity + 1)
                      }
                      style={styles.cartQtyBtn}>
                      <Text style={styles.cartQtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Pricing breakdown */}
              <View style={styles.cartSummaryCard}>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLineLabel}>Items Subtotal</Text>
                  <Text style={styles.summaryLineValue}>
                    ₦{cartSubtotal.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLineLabel}>Estimated Delivery</Text>
                  <Text style={styles.summaryLineValue}>₦800</Text>
                </View>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLineLabel}>Packaging & Service</Text>
                  <Text style={styles.summaryLineValue}>₦400</Text>
                </View>
                <View style={[styles.summaryLine, styles.grandTotalLine]}>
                  <Text style={styles.grandTotalLabel}>Total</Text>
                  <Text style={styles.grandTotalValue}>
                    ₦{(cartSubtotal + 1200).toLocaleString()}
                  </Text>
                </View>
              </View>

              <ChowButton
                title="Proceed to Cashless Checkout ➔"
                size="lg"
                onPress={() => setActiveScreen('checkout')}
              />
            </ScrollView>
          )}
        </View>
      )}

      {/* SCREEN 3: CHECKOUT */}
      {activeScreen === 'checkout' && (
        <View style={styles.viewBody}>
          <View style={styles.viewHeader}>
            <TouchableOpacity onPress={() => setActiveScreen('cart')}>
              <Text style={styles.headerBack}>‹ Cart</Text>
            </TouchableOpacity>
            <Text style={styles.viewTitle}>Cashless Checkout</Text>
            <View style={{ width: 40 }} />
          </View>
          <CheckoutView
            onBackToCart={() => setActiveScreen('cart')}
            onOrderSuccess={(orderId) => {
              setCurrentTrackingOrderId(orderId);
              setActiveScreen('tracking');
            }}
          />
        </View>
      )}

      {/* SCREEN 4: LIVE TRACKING */}
      {activeScreen === 'tracking' && (
        <View style={styles.viewBody}>
          <View style={styles.viewHeader}>
            <TouchableOpacity onPress={() => setActiveScreen('menu')}>
              <Text style={styles.headerBack}>‹ Menu</Text>
            </TouchableOpacity>
            <Text style={styles.viewTitle}>Live Order Tracking</Text>
            <TouchableOpacity onPress={() => setActiveScreen('orders')}>
              <Text style={styles.headerHistory}>History</Text>
            </TouchableOpacity>
          </View>
          <OrderTrackingView
            onBackToHome={() => setActiveScreen('menu')}
            onViewAllOrders={() => setActiveScreen('orders')}
          />
        </View>
      )}

      {/* SCREEN 5: ORDER HISTORY */}
      {activeScreen === 'orders' && (
        <View style={styles.viewBody}>
          <View style={styles.viewHeader}>
            <TouchableOpacity onPress={() => setActiveScreen('menu')}>
              <Text style={styles.headerBack}>‹ Menu</Text>
            </TouchableOpacity>
            <Text style={styles.viewTitle}>Order History</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.ordersContent,
              { paddingBottom: 80 + Math.max(insets.bottom, 16) },
            ]}>
            {orders.map((ord) => (
              <TouchableOpacity
                key={ord.id}
                onPress={() => {
                  setCurrentTrackingOrderId(ord.id);
                  setActiveScreen('tracking');
                }}
                activeOpacity={0.8}
                style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyNum}>Order #{ord.orderNumber}</Text>
                  <View style={styles.historyStatusPill}>
                    <Text style={styles.historyStatusText}>{ord.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.historyDate}>
                  {ord.createdAt} • {ord.paymentMethod} (Paid)
                </Text>
                <Text style={styles.historyItems}>
                  {ord.items.map((i) => `${i.quantity}x ${i.food.name}`).join(', ')}
                </Text>
                <View style={styles.historyFooter}>
                  <Text style={styles.historyTotal}>₦{ord.total.toLocaleString()}</Text>
                  <Text style={styles.trackActionText}>Track Order ➔</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* SCREEN 6: PROFILE & ADDRESSES */}
      {activeScreen === 'profile' && (
        <View style={styles.viewBody}>
          <View style={styles.viewHeader}>
            <TouchableOpacity onPress={() => setActiveScreen('menu')}>
              <Text style={styles.headerBack}>‹ Menu</Text>
            </TouchableOpacity>
            <Text style={styles.viewTitle}>Profile & Addresses</Text>
            <View style={{ width: 40 }} />
          </View>
          <ProfileAddressesView
            onBackToMenu={() => setActiveScreen('menu')}
            onOpenAdmin={() => setActiveScreen('admin')}
          />
        </View>
      )}

      {/* SCREEN 7: ADMIN DASHBOARD */}
      {activeScreen === 'admin' && (
        <View style={styles.viewBody}>
          <AdminDashboardView onBackToCustomer={() => setActiveScreen('menu')} />
        </View>
      )}

      {/* Persistent Bottom Tab Bar (Matching Chow Brand Palette) */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 6), height: 56 + Math.max(insets.bottom, 0) }]}>
        <TouchableOpacity
          onPress={() => setActiveScreen('menu')}
          style={styles.tabBarItem}>
          <Text style={styles.tabBarIcon}>🍲</Text>
          <Text
            style={[
              styles.tabBarLabel,
              activeScreen === 'menu' && styles.tabBarLabelActive,
            ]}>
            Menu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveScreen('cart')}
          style={styles.tabBarItem}>
          <View>
            <Text style={styles.tabBarIcon}>🛍️</Text>
            {cartCount > 0 && (
              <View style={styles.tabBarBadge}>
                <Text style={styles.tabBarBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabBarLabel,
              activeScreen === 'cart' && styles.tabBarLabelActive,
            ]}>
            Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveScreen('tracking')}
          style={styles.tabBarItem}>
          <Text style={styles.tabBarIcon}>🛵</Text>
          <Text
            style={[
              styles.tabBarLabel,
              activeScreen === 'tracking' && styles.tabBarLabelActive,
            ]}>
            Track
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveScreen('orders')}
          style={styles.tabBarItem}>
          <Text style={styles.tabBarIcon}>📜</Text>
          <Text
            style={[
              styles.tabBarLabel,
              activeScreen === 'orders' && styles.tabBarLabelActive,
            ]}>
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveScreen('profile')}
          style={styles.tabBarItem}>
          <Text style={styles.tabBarIcon}>👤</Text>
          <Text
            style={[
              styles.tabBarLabel,
              activeScreen === 'profile' && styles.tabBarLabelActive,
            ]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Food Customization Modal */}
      <Modal visible={selectedFood !== null} animationType="slide">
        {selectedFood && (
          <FoodDetailModal
            food={selectedFood}
            onClose={() => setSelectedFood(null)}
            onGoToCart={() => {
              setSelectedFood(null);
              setActiveScreen('cart');
            }}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ChowTheme.colors.cream,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  topNavbar: {
    height: 60,
    backgroundColor: ChowTheme.colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ChowTheme.spacing.base,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: ChowTheme.radii.pill,
    backgroundColor: ChowTheme.colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandIcon: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
    letterSpacing: 1.5,
    fontFamily: ChowTheme.typography.serifFont,
  },
  brandTagline: {
    fontSize: 10,
    color: ChowTheme.colors.nudeDark,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rolePill: {
    backgroundColor: ChowTheme.colors.nudeLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: ChowTheme.radii.pill,
    borderWidth: 1,
    borderColor: ChowTheme.colors.nude,
  },
  rolePillActive: {
    backgroundColor: ChowTheme.colors.brown,
    borderColor: ChowTheme.colors.brown,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  rolePillTextActive: {
    color: ChowTheme.colors.cream,
  },
  cartIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: ChowTheme.radii.pill,
    backgroundColor: ChowTheme.colors.white,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...ChowTheme.shadows.soft,
  },
  cartEmoji: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: ChowTheme.colors.brown,
    borderRadius: ChowTheme.radii.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeCount: {
    color: ChowTheme.colors.cream,
    fontSize: 10,
    fontWeight: '800',
  },
  menuScroll: {
    padding: ChowTheme.spacing.base,
    paddingBottom: 90,
  },
  locationStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ChowTheme.colors.creamCard,
    padding: 10,
    borderRadius: ChowTheme.radii.md,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 12,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPin: {
    fontSize: 18,
    marginRight: 8,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: ChowTheme.colors.textMuted,
    textTransform: 'uppercase',
  },
  locationAddress: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  changeLocText: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  promoBanner: {
    backgroundColor: ChowTheme.colors.brown,
    borderRadius: ChowTheme.radii.lg,
    padding: ChowTheme.spacing.base,
    marginBottom: 14,
    ...ChowTheme.shadows.soft,
  },
  promoContent: {
    alignItems: 'flex-start',
  },
  promoPill: {
    backgroundColor: ChowTheme.colors.nude,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: ChowTheme.radii.pill,
    marginBottom: 6,
  },
  promoPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
    letterSpacing: 1,
  },
  promoTitle: {
    color: ChowTheme.colors.cream,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: ChowTheme.typography.serifFont,
    marginBottom: 4,
  },
  promoSub: {
    color: ChowTheme.colors.nudeLight,
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ChowTheme.colors.white,
    borderRadius: ChowTheme.radii.pill,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 12,
    ...ChowTheme.shadows.soft,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: ChowTheme.colors.textPrimary,
  },
  clearSearch: {
    color: ChowTheme.colors.textMuted,
    fontSize: 14,
    padding: 4,
  },
  categoriesBar: {
    paddingVertical: 4,
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    backgroundColor: ChowTheme.colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: ChowTheme.radii.pill,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: ChowTheme.colors.brown,
    borderColor: ChowTheme.colors.brown,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: ChowTheme.colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: ChowTheme.colors.cream,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
  },
  itemCountText: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    fontWeight: '600',
  },
  noResultsBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  noResultsSub: {
    fontSize: 12,
    color: ChowTheme.colors.textSecondary,
    marginTop: 4,
  },
  viewBody: {
    flex: 1,
    backgroundColor: ChowTheme.colors.cream,
  },
  viewHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ChowTheme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
    backgroundColor: ChowTheme.colors.cream,
  },
  headerBack: {
    fontSize: 14,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  viewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
  },
  headerHistory: {
    fontSize: 13,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  cartContent: {
    padding: ChowTheme.spacing.base,
    paddingBottom: 80,
  },
  emptyCartBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ChowTheme.spacing.xl,
  },
  emptyCartEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
  },
  emptyCartSub: {
    fontSize: 13,
    color: ChowTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: ChowTheme.colors.white,
    padding: ChowTheme.spacing.base,
    borderRadius: ChowTheme.radii.lg,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 10,
    alignItems: 'center',
    ...ChowTheme.shadows.soft,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
  },
  cartItemSub: {
    fontSize: 11,
    color: ChowTheme.colors.textSecondary,
    marginTop: 2,
  },
  cartItemNote: {
    fontSize: 10,
    color: ChowTheme.colors.brown,
    marginTop: 2,
    fontStyle: 'italic',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
    marginTop: 4,
  },
  cartQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ChowTheme.colors.nudeLight,
    borderRadius: ChowTheme.radii.pill,
  },
  cartQtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartQtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  cartQtyText: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
  },
  cartSummaryCard: {
    backgroundColor: ChowTheme.colors.creamCard,
    padding: ChowTheme.spacing.base,
    borderRadius: ChowTheme.radii.lg,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginVertical: 14,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLineLabel: {
    fontSize: 12,
    color: ChowTheme.colors.textSecondary,
  },
  summaryLineValue: {
    fontSize: 12,
    fontWeight: '600',
    color: ChowTheme.colors.textPrimary,
  },
  grandTotalLine: {
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
    paddingTop: 8,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
  },
  grandTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
  },
  ordersContent: {
    padding: ChowTheme.spacing.base,
    paddingBottom: 80,
  },
  historyCard: {
    backgroundColor: ChowTheme.colors.white,
    padding: ChowTheme.spacing.base,
    borderRadius: ChowTheme.radii.lg,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 12,
    ...ChowTheme.shadows.soft,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyNum: {
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
  },
  historyStatusPill: {
    backgroundColor: ChowTheme.colors.nudeLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ChowTheme.radii.pill,
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
  },
  historyDate: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    marginBottom: 6,
  },
  historyItems: {
    fontSize: 12,
    color: ChowTheme.colors.textSecondary,
    marginBottom: 10,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
    paddingTop: 8,
  },
  historyTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
  },
  trackActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  bottomTabBar: {
    minHeight: 56,
    backgroundColor: ChowTheme.colors.cream,
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    width: 60,
  },
  tabBarIcon: {
    fontSize: 18,
  },
  tabBarBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: ChowTheme.colors.brown,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBarBadgeText: {
    color: ChowTheme.colors.cream,
    fontSize: 9,
    fontWeight: '800',
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: ChowTheme.colors.textSecondary,
    marginTop: 2,
  },
  tabBarLabelActive: {
    color: ChowTheme.colors.brown,
    fontWeight: '800',
  },
});
