import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { ChowTheme } from '@/constants/chow-theme';
import { useChow, Order, OrderStatus } from '@/context/chow-context';
import { ChowButton } from './chow-button';

interface OrderTrackingViewProps {
  order?: Order | null;
  onBackToHome: () => void;
  onViewAllOrders?: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order: propOrder,
  onBackToHome,
  onViewAllOrders,
}) => {
  const { activeOrder } = useChow();
  const order = propOrder || activeOrder;

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🍲</Text>
        <Text style={styles.emptyTitle}>No Active Orders</Text>
        <Text style={styles.emptySubtitle}>
          You don&apos;t have any meals in transit right now. Explore today&apos;s special menu!
        </Text>
        <ChowButton title="Browse Menu" onPress={onBackToHome} />
      </View>
    );
  }

  // Stages matching Stitch design
  const stages: { status: OrderStatus; label: string; desc: string; icon: string }[] = [
    {
      status: 'placed',
      label: 'Order Placed & Paid',
      desc: 'Online payment confirmed via Paystack',
      icon: '💳',
    },
    {
      status: 'confirmed',
      label: 'Accepted by Kitchen',
      desc: 'Mama Cass Kitchen confirmed recipe queue',
      icon: '✅',
    },
    {
      status: 'cooking',
      label: 'Simmering & Packing',
      desc: 'Freshly prepped & secured in tamper-proof seal',
      icon: '🍲',
    },
    {
      status: 'dispatched',
      label: 'Dispatched with Courier',
      desc: 'In transit to your delivery address',
      icon: '🛵',
    },
    {
      status: 'arrived',
      label: 'Arrived at Gate / Reception',
      desc: 'Awaiting student or resident hand-off',
      icon: '📍',
    },
    {
      status: 'delivered',
      label: 'Collected & Delivered',
      desc: 'Order completed. Enjoy your meal!',
      icon: '🎉',
    },
  ];

  const statusOrder: OrderStatus[] = [
    'placed',
    'confirmed',
    'cooking',
    'dispatched',
    'arrived',
    'delivered',
  ];

  const currentStatusIndex = statusOrder.indexOf(order.status);

  const getEstimatedText = () => {
    switch (order.status) {
      case 'placed':
        return 'Arriving in 30-35 mins';
      case 'confirmed':
        return 'Arriving in 25-30 mins';
      case 'cooking':
        return 'Simmering hot • ~20 mins';
      case 'dispatched':
        return 'Arriving in 10-15 mins';
      case 'arrived':
        return 'Arrived at your location!';
      case 'delivered':
        return 'Delivered & Completed';
      default:
        return 'Estimated ~20 mins';
    }
  };

  const handleCallDispatcher = () => {
    const url = 'tel:+2348105550192';
    if (Platform.OS !== 'web') {
      Linking.openURL(url);
    } else {
      alert('Calling Chow Dispatcher Ibrahim (+234 810 555 0192)');
    }
  };

  const handleSmsDispatcher = () => {
    const url = 'sms:+2348105550192';
    if (Platform.OS !== 'web') {
      Linking.openURL(url);
    } else {
      alert('Messaging Chow Dispatcher Ibrahim (+234 810 555 0192)');
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {/* Stitch Design Hero Status Card */}
      <View style={styles.heroCard}>
        <View style={styles.fireBadge}>
          <Text style={styles.fireEmoji}>
            {order.status === 'delivered' ? '🎉' : order.status === 'cooking' ? '🔥' : '🍲'}
          </Text>
        </View>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>
            {order.status === 'dispatched' ? 'ON THE WAY' : order.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.heroTime}>{getEstimatedText()}</Text>
        <Text style={styles.heroSub}>
          Mama Cass Kitchen has packed your order. Dispatched for drop-off at {order.address.title}.
        </Text>
      </View>

      {/* Route Waypoints Card (Visual Dispatch Progress from Stitch) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>Route Waypoints</Text>
          <Text style={styles.cardHeaderSub}>Lekki Kitchen → {order.address.area}</Text>
        </View>

        <View style={styles.waypointsContainer}>
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            const isLast = idx === stages.length - 1;

            return (
              <View key={stage.status} style={styles.stageRow}>
                {/* Visual Line & Node */}
                <View style={styles.timelineColumn}>
                  <View
                    style={[
                      styles.timelineNode,
                      isCompleted && styles.timelineNodeCompleted,
                      isCurrent && styles.timelineNodeCurrent,
                    ]}>
                    <Text style={styles.stageIconText}>{stage.icon}</Text>
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>

                {/* Content */}
                <View style={[styles.stageDetails, !isCompleted && styles.stageDetailsPending]}>
                  <View style={styles.stageTitleRow}>
                    <Text
                      style={[
                        styles.stageLabel,
                        isCurrent && styles.stageLabelCurrent,
                        !isCompleted && styles.stageLabelPending,
                      ]}>
                      {stage.label}
                    </Text>
                    {isCurrent && (
                      <View style={styles.livePulseBadge}>
                        <Text style={styles.livePulseText}>LIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stageDesc}>{stage.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Dispatch Coordinator Card (Ibrahim from Stitch design) */}
      <View style={styles.card}>
        <View style={styles.coordinatorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>IB</Text>
          </View>
          <View style={styles.coordinatorInfo}>
            <View style={styles.coordTitleRow}>
              <Text style={styles.coordName}>Ibrahim</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Chow Dispatch</Text>
              </View>
            </View>
            <Text style={styles.coordMeta}>🛵 Blue Motorcycle • Active Dispatch</Text>
          </View>

          {/* Action Call & SMS buttons from Stitch */}
          <View style={styles.coordButtons}>
            <TouchableOpacity
              onPress={handleSmsDispatcher}
              activeOpacity={0.8}
              style={styles.smsButton}
              accessibilityLabel="SMS Dispatcher">
              <Text style={styles.smsIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCallDispatcher}
              activeOpacity={0.8}
              style={styles.callButton}
              accessibilityLabel="Call Dispatcher">
              <Text style={styles.callButtonText}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.handOffNotice}>
          <Text style={styles.handOffEmoji}>ℹ️</Text>
          <Text style={styles.handOffText}>
            Manual delivery coordination by Chow Admin for direct reception drop-off.
          </Text>
        </View>
      </View>

      {/* Order Summary & Receipt Card */}
      <View style={styles.card}>
        <View style={styles.receiptHeader}>
          <View>
            <Text style={styles.orderIdText}>Order #{order.orderNumber}</Text>
            <Text style={styles.receiptPaymentMeta}>
              Paid via {order.paymentMethod} • Ref: {order.paymentReference.slice(0, 10)}...
            </Text>
          </View>
          <View style={styles.receiptPriceCol}>
            <Text style={styles.receiptTotal}>₦{order.total.toLocaleString()}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.receiptItems}>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.receiptItemRow}>
              <Text style={styles.receiptItemName}>
                {item.quantity}x {item.food.name}
                {item.options.protein ? ` (${item.options.protein.name})` : ''}
              </Text>
              <Text style={styles.receiptItemPrice}>₦{item.itemTotal.toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.receiptItemRow}>
            <Text style={styles.receiptMutedText}>Delivery & Dispatch Fee</Text>
            <Text style={styles.receiptMutedText}>₦{order.deliveryFee.toLocaleString()}</Text>
          </View>
          <View style={styles.receiptItemRow}>
            <Text style={styles.receiptMutedText}>Packaging & Service</Text>
            <Text style={styles.receiptMutedText}>₦{order.serviceFee.toLocaleString()}</Text>
          </View>
        </View>

        {/* Address and Delivery Instructions Note */}
        <View style={styles.deliveryDetails}>
          <Text style={styles.deliverySectionLabel}>Delivering To:</Text>
          <Text style={styles.deliveryTarget}>{order.address.title} - {order.address.street}</Text>
          {order.specialInstructions && (
            <Text style={styles.deliveryInstructionsNote}>
              Note: &ldquo;{order.specialInstructions}&rdquo;
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <ChowButton
          title="Back to Food Menu"
          variant="secondary"
          onPress={onBackToHome}
        />
        {onViewAllOrders && (
          <View style={{ marginTop: 10 }}>
            <ChowButton
              title="View All My Orders"
              variant="outline"
              onPress={onViewAllOrders}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: ChowTheme.spacing.base,
    paddingBottom: 40,
    backgroundColor: ChowTheme.colors.cream,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    padding: ChowTheme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ChowTheme.colors.cream,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
    fontFamily: ChowTheme.typography.serifFont,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: ChowTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: ChowTheme.colors.brown,
    borderRadius: ChowTheme.radii.xl,
    padding: ChowTheme.spacing.xl,
    alignItems: 'center',
    marginBottom: ChowTheme.spacing.base,
    ...ChowTheme.shadows.prominent,
  },
  fireBadge: {
    width: 64,
    height: 64,
    borderRadius: ChowTheme.radii.lg,
    backgroundColor: ChowTheme.colors.brownDark,
    borderWidth: 1,
    borderColor: ChowTheme.colors.nude,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  fireEmoji: {
    fontSize: 30,
  },
  badgePill: {
    backgroundColor: 'rgba(216, 180, 156, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: ChowTheme.radii.pill,
    borderWidth: 1,
    borderColor: ChowTheme.colors.nude,
    marginBottom: 6,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: ChowTheme.colors.nude,
    letterSpacing: 1.5,
  },
  heroTime: {
    fontSize: 24,
    fontWeight: '800',
    color: ChowTheme.colors.cream,
    fontFamily: ChowTheme.typography.serifFont,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 12,
    color: ChowTheme.colors.nudeLight,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '90%',
  },
  card: {
    backgroundColor: ChowTheme.colors.creamCard,
    borderRadius: ChowTheme.radii.lg,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    padding: ChowTheme.spacing.base,
    marginBottom: ChowTheme.spacing.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardHeaderSub: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    fontWeight: '600',
  },
  waypointsContainer: {
    paddingLeft: 4,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  timelineNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ChowTheme.colors.white,
    borderWidth: 1.5,
    borderColor: ChowTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineNodeCompleted: {
    borderColor: ChowTheme.colors.brown,
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  timelineNodeCurrent: {
    borderColor: ChowTheme.colors.brown,
    backgroundColor: ChowTheme.colors.brown,
  },
  stageIconText: {
    fontSize: 12,
  },
  timelineLine: {
    width: 2,
    height: 28,
    backgroundColor: ChowTheme.colors.border,
    marginTop: -2,
    marginBottom: -2,
  },
  timelineLineCompleted: {
    backgroundColor: ChowTheme.colors.brown,
  },
  stageDetails: {
    flex: 1,
  },
  stageDetailsPending: {
    opacity: 0.45,
  },
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  stageLabelCurrent: {
    color: ChowTheme.colors.brown,
    fontWeight: '800',
  },
  stageLabelPending: {
    color: ChowTheme.colors.textMuted,
  },
  livePulseBadge: {
    backgroundColor: ChowTheme.colors.brown,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ChowTheme.radii.pill,
  },
  livePulseText: {
    color: ChowTheme.colors.cream,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stageDesc: {
    fontSize: 11,
    color: ChowTheme.colors.textSecondary,
    marginTop: 2,
  },
  coordinatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ChowTheme.colors.brown,
    borderWidth: 1,
    borderColor: ChowTheme.colors.nude,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: ChowTheme.colors.cream,
    fontSize: 14,
    fontWeight: '800',
  },
  coordinatorInfo: {
    flex: 1,
  },
  coordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coordName: {
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
  },
  roleTag: {
    backgroundColor: ChowTheme.colors.nudeLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  coordMeta: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    marginTop: 2,
  },
  coordButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ChowTheme.colors.white,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsIcon: {
    fontSize: 15,
  },
  callButton: {
    backgroundColor: ChowTheme.colors.brown,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: ChowTheme.radii.pill,
  },
  callButtonText: {
    color: ChowTheme.colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
  handOffNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
  },
  handOffEmoji: {
    fontSize: 12,
  },
  handOffText: {
    fontSize: 11,
    color: ChowTheme.colors.textSecondary,
    flex: 1,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
    paddingBottom: 10,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
  },
  receiptPaymentMeta: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    marginTop: 2,
  },
  receiptPriceCol: {
    alignItems: 'flex-end',
  },
  receiptTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
  },
  verifiedBadge: {
    backgroundColor: ChowTheme.colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: ChowTheme.colors.success,
  },
  receiptItems: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  receiptItemName: {
    fontSize: 12,
    color: ChowTheme.colors.textPrimary,
    flex: 1,
  },
  receiptItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  receiptMutedText: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
  },
  deliveryDetails: {
    paddingTop: 8,
  },
  deliverySectionLabel: {
    fontSize: 10,
    color: ChowTheme.colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  deliveryTarget: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
    marginTop: 2,
  },
  deliveryInstructionsNote: {
    fontSize: 11,
    color: ChowTheme.colors.brown,
    marginTop: 3,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 8,
  },
});
