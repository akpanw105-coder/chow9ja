import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { ChowTheme } from '@/constants/chow-theme';
import { useChow, FoodItem, OrderStatus } from '@/context/chow-context';
import { ChowButton } from './chow-button';

interface AdminDashboardViewProps {
  onBackToCustomer: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onBackToCustomer,
}) => {
  const {
    foods,
    orders,
    toggleFoodAvailability,
    updateFoodItem,
    addFoodItem,
    updateOrderStatus,
  } = useChow();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'sales'>('orders');

  // New meal modal state
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealDesc, setNewMealDesc] = useState('');
  const [newMealPrice, setNewMealPrice] = useState('');
  const [newMealCategory, setNewMealCategory] = useState<FoodItem['category']>('Rice Dishes');

  // Sales analytics calculations
  const totalSalesRevenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter((o) => o.status === 'delivered').length;
  const inProgressCount = orders.filter((o) => o.status !== 'delivered').length;

  const handleCreateMeal = () => {
    if (!newMealName.trim() || !newMealPrice.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a meal name and price');
      } else {
        Alert.alert('Required Fields', 'Please enter a meal name and price');
      }
      return;
    }

    addFoodItem({
      name: newMealName.trim(),
      description: newMealDesc.trim() || 'Freshly cooked authentic Nigerian delicacy prepared daily with finest spices.',
      price: parseInt(newMealPrice, 10) || 4000,
      category: newMealCategory,
      prepTimeMinutes: 20,
      isAvailable: true,
      image: require('@/assets/images/jollof.jpg'), // Default to delicious Nigerian jollof
      spiciness: 'Medium',
      proteins: [
        { id: `p-${Date.now()}-1`, name: 'Standard Chef Protein Portions', price: 0 },
        { id: `p-${Date.now()}-2`, name: 'Extra Fried Assorted Meats', price: 800 },
      ],
    });

    setShowAddMealModal(false);
    setNewMealName('');
    setNewMealDesc('');
    setNewMealPrice('');
  };

  const handleUpdatePrice = (foodId: string, currentPrice: number) => {
    let input: string | null = null;
    if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
      input = window.prompt('Enter new price (₦):', currentPrice.toString());
    }
    if (input) {
      const parsed = parseInt(input, 10);
      if (!isNaN(parsed) && parsed > 0) {
        updateFoodItem(foodId, { price: parsed });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Admin Top Header Banner */}
      <View style={styles.adminBanner}>
        <View style={styles.bannerLeft}>
          <View style={styles.kitchenBadge}>
            <Text style={styles.kitchenBadgeText}>CHOW KITCHEN OPS</Text>
          </View>
          <Text style={styles.bannerTitle}>Admin & Operations Portal</Text>
          <Text style={styles.bannerSub}>Real-time order dispatch, pricing & availability</Text>
        </View>
        <TouchableOpacity
          onPress={onBackToCustomer}
          activeOpacity={0.8}
          style={styles.switchButton}>
          <Text style={styles.switchButtonText}>Exit Admin ➔</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('orders')}
          style={[styles.tabItem, activeTab === 'orders' && styles.tabItemActive]}>
          <Text style={[styles.tabLabel, activeTab === 'orders' && styles.tabLabelActive]}>
            Incoming Orders ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('menu')}
          style={[styles.tabItem, activeTab === 'menu' && styles.tabItemActive]}>
          <Text style={[styles.tabLabel, activeTab === 'menu' && styles.tabLabelActive]}>
            Menu & Stock ({foods.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('sales')}
          style={[styles.tabItem, activeTab === 'sales' && styles.tabItemActive]}>
          <Text style={[styles.tabLabel, activeTab === 'sales' && styles.tabLabelActive]}>
            Sales & Revenue
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* TAB 1: INCOMING ORDERS */}
        {activeTab === 'orders' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Live Orders Pipeline</Text>
              <Text style={styles.subtext}>{inProgressCount} requiring kitchen attention</Text>
            </View>

            {orders.map((ord) => {
              return (
                <View key={ord.id} style={styles.orderCard}>
                  <View style={styles.orderCardHeader}>
                    <View>
                      <Text style={styles.orderCardNum}>Order #{ord.orderNumber}</Text>
                      <Text style={styles.orderCardTime}>
                        {ord.createdAt} • {ord.paymentMethod}
                      </Text>
                    </View>
                    <View style={styles.orderStatusBadge}>
                      <Text style={styles.orderStatusText}>{ord.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  {/* Delivery Location & Customer */}
                  <View style={styles.orderLocBox}>
                    <Text style={styles.orderDest}>
                      📍 {ord.address.title} ({ord.address.street})
                    </Text>
                    <Text style={styles.orderPhone}>📞 Recipient: {ord.address.phoneNumber}</Text>
                    {ord.specialInstructions && (
                      <Text style={styles.orderGateNote}>
                        Gate Note: &ldquo;{ord.specialInstructions}&rdquo;
                      </Text>
                    )}
                  </View>

                  {/* Items in order */}
                  <View style={styles.orderItemsList}>
                    {ord.items.map((it, idx) => (
                      <View key={idx} style={styles.orderItemLine}>
                        <Text style={styles.orderItemName}>
                          • {it.quantity}x {it.food.name}
                          {it.options.protein ? ` [${it.options.protein.name}]` : ''}
                        </Text>
                        <Text style={styles.orderItemPrice}>₦{it.itemTotal.toLocaleString()}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Total & Payment Verification */}
                  <View style={styles.orderFooterRow}>
                    <View>
                      <Text style={styles.totalLabel}>Total Received</Text>
                      <Text style={styles.orderTotalAmt}>₦{ord.total.toLocaleString()}</Text>
                    </View>
                    <View style={styles.paymentStatusPill}>
                      <Text style={styles.paymentStatusPillText}>
                        ● Payment {ord.paymentStatus}
                      </Text>
                    </View>
                  </View>

                  {/* Order Stage Controls */}
                  <View style={styles.stageActionsRow}>
                    <Text style={styles.stageActionPrompt}>Update Stage:</Text>
                    <View style={styles.stageButtons}>
                      {(['cooking', 'dispatched', 'arrived', 'delivered'] as OrderStatus[]).map(
                        (st) => {
                          const isCurrent = ord.status === st;
                          return (
                            <TouchableOpacity
                              key={st}
                              onPress={() => updateOrderStatus(ord.id, st)}
                              activeOpacity={0.8}
                              style={[
                                styles.stageBtn,
                                isCurrent && styles.stageBtnActive,
                              ]}>
                              <Text
                                style={[
                                  styles.stageBtnText,
                                  isCurrent && styles.stageBtnTextActive,
                                ]}>
                                {st}
                              </Text>
                            </TouchableOpacity>
                          );
                        }
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 2: MENU & STOCK MANAGEMENT */}
        {activeTab === 'menu' && (
          <View>
            <View style={styles.menuHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>Menu & Availability</Text>
                <Text style={styles.subtext}>Manage food prices, items, and sold out states</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddMealModal(true)}
                activeOpacity={0.8}
                style={styles.addMealButton}>
                <Text style={styles.addMealButtonText}>+ Add New Delicacy</Text>
              </TouchableOpacity>
            </View>

            {foods.map((food) => (
              <View key={food.id} style={styles.menuItemCard}>
                <Image source={food.image} style={styles.menuItemThumb} resizeMode="cover" />
                <View style={styles.menuItemDetails}>
                  <View style={styles.menuItemTop}>
                    <Text style={styles.menuItemName}>{food.name}</Text>
                    <Text style={styles.menuItemCategory}>{food.category}</Text>
                  </View>
                  <Text style={styles.menuItemPrice}>₦{food.price.toLocaleString()}</Text>

                  {/* Action row */}
                  <View style={styles.menuItemActions}>
                    <TouchableOpacity
                      onPress={() => toggleFoodAvailability(food.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.toggleAvailabilityBtn,
                        food.isAvailable ? styles.availInStock : styles.availSoldOut,
                      ]}>
                      <Text style={styles.availBtnText}>
                        {food.isAvailable ? 'In Stock (Available)' : 'Sold Out (Disabled)'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdatePrice(food.id, food.price)}
                      activeOpacity={0.8}
                      style={styles.editPriceBtn}>
                      <Text style={styles.editPriceText}>Edit Price</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: SALES & REVENUE HISTORY */}
        {activeTab === 'sales' && (
          <View>
            <Text style={styles.sectionHeading}>Financial & Operations Summary</Text>
            <Text style={styles.subtext}>Live settlement overview from Paystack transactions</Text>

            {/* Metric KPI cards */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Total Online Revenue</Text>
                <Text style={styles.kpiValue}>₦{totalSalesRevenue.toLocaleString()}</Text>
                <Text style={styles.kpiSub}>100% cashless gateway</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Orders Dispatched</Text>
                <Text style={styles.kpiValue}>{totalOrdersCount}</Text>
                <Text style={styles.kpiSub}>{completedOrdersCount} successfully delivered</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Average Order Value</Text>
                <Text style={styles.kpiValue}>
                  ₦
                  {totalOrdersCount > 0
                    ? Math.round(totalSalesRevenue / totalOrdersCount).toLocaleString()
                    : '0'}
                </Text>
                <Text style={styles.kpiSub}>Per customer checkout</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Courier Logistics</Text>
                <Text style={styles.kpiValue}>1 Active</Text>
                <Text style={styles.kpiSub}>Ibrahim (Blue Motorcycle)</Text>
              </View>
            </View>

            {/* Sales ledger list */}
            <View style={styles.salesLedgerCard}>
              <Text style={styles.ledgerTitle}>Recent Completed Transactions</Text>
              {orders.map((ord) => (
                <View key={ord.id} style={styles.ledgerRow}>
                  <View>
                    <Text style={styles.ledgerOrderNum}>Order #{ord.orderNumber}</Text>
                    <Text style={styles.ledgerTime}>{ord.createdAt} • Ref: {ord.paymentReference.slice(0, 12)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.ledgerAmount}>+₦{ord.total.toLocaleString()}</Text>
                    <Text style={styles.ledgerStatus}>{ord.paymentStatus}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add New Delicacy Modal */}
      <Modal visible={showAddMealModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Nigerian Meal</Text>
              <TouchableOpacity onPress={() => setShowAddMealModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Delicacy Name (e.g. Asun Fried Rice)"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={newMealName}
              onChangeText={setNewMealName}
              style={styles.modalInput}
            />

            <TextInput
              placeholder="Base Price (₦)"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={newMealPrice}
              onChangeText={setNewMealPrice}
              keyboardType="numeric"
              style={styles.modalInput}
            />

            <TextInput
              placeholder="Description & Ingredients"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={newMealDesc}
              onChangeText={setNewMealDesc}
              multiline
              numberOfLines={2}
              style={styles.modalInput}
            />

            <View style={styles.pickerRow}>
              <Text style={styles.pickerLabel}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                {(['Rice Dishes', 'Soups & Swallows', 'Grills & Suya', 'Snacks & Sides', 'Soups'] as FoodItem['category'][]).map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setNewMealCategory(cat)}
                      style={[
                        styles.catPill,
                        newMealCategory === cat && styles.catPillActive,
                      ]}>
                      <Text
                        style={[
                          styles.catPillText,
                          newMealCategory === cat && styles.catPillTextActive,
                        ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </View>

            <View style={{ marginTop: 12 }}>
              <ChowButton title="Publish Meal to Chow Menu" onPress={handleCreateMeal} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ChowTheme.colors.cream,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  adminBanner: {
    backgroundColor: ChowTheme.colors.brown,
    paddingHorizontal: ChowTheme.spacing.base,
    paddingVertical: ChowTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flex: 1,
  },
  kitchenBadge: {
    backgroundColor: ChowTheme.colors.brownDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  kitchenBadgeText: {
    color: ChowTheme.colors.nude,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bannerTitle: {
    color: ChowTheme.colors.cream,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: ChowTheme.typography.serifFont,
  },
  bannerSub: {
    color: ChowTheme.colors.nude,
    fontSize: 11,
    marginTop: 2,
  },
  switchButton: {
    backgroundColor: ChowTheme.colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: ChowTheme.radii.pill,
    marginLeft: 10,
  },
  switchButtonText: {
    color: ChowTheme.colors.brown,
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: ChowTheme.colors.creamCard,
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: ChowTheme.colors.brown,
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ChowTheme.colors.textSecondary,
  },
  tabLabelActive: {
    color: ChowTheme.colors.brown,
    fontWeight: '800',
  },
  scrollContent: {
    padding: ChowTheme.spacing.base,
    paddingBottom: 50,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
  },
  subtext: {
    fontSize: 12,
    color: ChowTheme.colors.textMuted,
    marginTop: 2,
  },
  orderCard: {
    backgroundColor: ChowTheme.colors.white,
    borderRadius: ChowTheme.radii.lg,
    padding: ChowTheme.spacing.base,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 14,
    ...ChowTheme.shadows.soft,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  orderCardNum: {
    fontSize: 15,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
  },
  orderCardTime: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    marginTop: 1,
  },
  orderStatusBadge: {
    backgroundColor: ChowTheme.colors.nudeLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: ChowTheme.radii.pill,
  },
  orderStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
  },
  orderLocBox: {
    backgroundColor: ChowTheme.colors.creamCard,
    padding: 10,
    borderRadius: ChowTheme.radii.sm,
    marginBottom: 10,
  },
  orderDest: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  orderPhone: {
    fontSize: 11,
    color: ChowTheme.colors.textSecondary,
    marginTop: 2,
  },
  orderGateNote: {
    fontSize: 11,
    color: ChowTheme.colors.brown,
    marginTop: 4,
    fontStyle: 'italic',
  },
  orderItemsList: {
    marginBottom: 8,
  },
  orderItemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  orderItemName: {
    fontSize: 12,
    color: ChowTheme.colors.textPrimary,
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: ChowTheme.colors.textMuted,
    textTransform: 'uppercase',
  },
  orderTotalAmt: {
    fontSize: 16,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
  },
  paymentStatusPill: {
    backgroundColor: ChowTheme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ChowTheme.radii.pill,
  },
  paymentStatusPillText: {
    color: ChowTheme.colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  stageActionsRow: {
    backgroundColor: ChowTheme.colors.cream,
    padding: 8,
    borderRadius: ChowTheme.radii.sm,
  },
  stageActionPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
    marginBottom: 6,
  },
  stageButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  stageBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: ChowTheme.radii.pill,
    backgroundColor: ChowTheme.colors.white,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    alignItems: 'center',
  },
  stageBtnActive: {
    backgroundColor: ChowTheme.colors.brown,
    borderColor: ChowTheme.colors.brown,
  },
  stageBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: ChowTheme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  stageBtnTextActive: {
    color: ChowTheme.colors.cream,
  },
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  addMealButton: {
    backgroundColor: ChowTheme.colors.brown,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: ChowTheme.radii.pill,
  },
  addMealButtonText: {
    color: ChowTheme.colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
  menuItemCard: {
    flexDirection: 'row',
    backgroundColor: ChowTheme.colors.white,
    borderRadius: ChowTheme.radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 10,
    alignItems: 'center',
  },
  menuItemThumb: {
    width: 68,
    height: 68,
    borderRadius: ChowTheme.radii.sm,
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  menuItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  menuItemCategory: {
    fontSize: 10,
    color: ChowTheme.colors.textMuted,
    backgroundColor: ChowTheme.colors.nudeLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
    marginVertical: 4,
  },
  menuItemActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  toggleAvailabilityBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ChowTheme.radii.pill,
  },
  availInStock: {
    backgroundColor: ChowTheme.colors.successLight,
  },
  availSoldOut: {
    backgroundColor: ChowTheme.colors.dangerLight,
  },
  availBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  editPriceBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ChowTheme.radii.pill,
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  editPriceText: {
    fontSize: 10,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 14,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: ChowTheme.colors.white,
    padding: ChowTheme.spacing.base,
    borderRadius: ChowTheme.radii.lg,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    ...ChowTheme.shadows.soft,
  },
  kpiLabel: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 10,
    color: ChowTheme.colors.textSecondary,
  },
  salesLedgerCard: {
    backgroundColor: ChowTheme.colors.white,
    borderRadius: ChowTheme.radii.lg,
    padding: ChowTheme.spacing.base,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
  },
  ledgerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
    marginBottom: 10,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
  },
  ledgerOrderNum: {
    fontSize: 13,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  ledgerTime: {
    fontSize: 10,
    color: ChowTheme.colors.textMuted,
  },
  ledgerAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: ChowTheme.colors.success,
  },
  ledgerStatus: {
    fontSize: 10,
    color: ChowTheme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: ChowTheme.colors.cream,
    borderRadius: ChowTheme.radii.xl,
    padding: ChowTheme.spacing.base,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
    fontFamily: ChowTheme.typography.serifFont,
  },
  modalClose: {
    fontSize: 18,
    color: ChowTheme.colors.textSecondary,
  },
  modalInput: {
    backgroundColor: ChowTheme.colors.white,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    borderRadius: ChowTheme.radii.sm,
    padding: 10,
    fontSize: 13,
    color: ChowTheme.colors.textPrimary,
    marginBottom: 10,
  },
  pickerRow: {
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  catPill: {
    backgroundColor: ChowTheme.colors.white,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: ChowTheme.radii.pill,
    marginRight: 6,
  },
  catPillActive: {
    backgroundColor: ChowTheme.colors.brown,
    borderColor: ChowTheme.colors.brown,
  },
  catPillText: {
    fontSize: 11,
    color: ChowTheme.colors.textSecondary,
  },
  catPillTextActive: {
    color: ChowTheme.colors.cream,
    fontWeight: '700',
  },
});
