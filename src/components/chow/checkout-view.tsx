import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChowTheme } from '@/constants/chow-theme';
import { useChow } from '@/context/chow-context';
import { ChowButton } from './chow-button';

interface CheckoutViewProps {
  onBackToCart: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onBackToCart,
  onOrderSuccess,
}) => {
  const {
    cart,
    cartSubtotal,
    addresses,
    addAddress,
    createOrder,
    user,
  } = useChow();

  const insets = useSafeAreaInsets();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<'Paystack Card' | 'Bank Transfer (Online)' | 'USSD'>('Paystack Card');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');

  // New address form state
  const [newTitle, setNewTitle] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newPhone, setNewPhone] = useState(user.phone || '');

  const deliveryFee = 800;
  const serviceFee = 400;
  const grandTotal = cartSubtotal + deliveryFee + serviceFee;

  const currentAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleSaveAddress = () => {
    if (!newTitle.trim() || !newStreet.trim()) return;
    addAddress({
      title: newTitle,
      street: newStreet,
      area: newArea || 'Lagos',
      landmark: newLandmark,
      isDefault: false,
      phoneNumber: newPhone || user.phone,
    });
    setShowNewAddressModal(false);
    setNewTitle('');
    setNewStreet('');
    setNewArea('');
    setNewLandmark('');
  };

  const handlePayAndPlaceOrder = async () => {
    // Guard against repeated clicks and missing address
    if (isProcessingPayment) return;
    setPaymentError(null);

    if (!currentAddress) {
      setPaymentError('Please select or add a delivery address to proceed.');
      return;
    }

    if (cart.length === 0) {
      setPaymentError('Your cart is empty. Please add items to checkout.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Simulate real-world payment gateway verification handshake (e.g. 1.2s delay)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const order = await createOrder({
        address: currentAddress,
        paymentMethod,
        specialInstructions: specialInstructions.trim() || undefined,
      });

      setCreatedOrderId(order.id);
      setCreatedOrderNumber(order.orderNumber);
      setIsProcessingPayment(false);
      setShowSuccessModal(true);
    } catch (err: unknown) {
      setIsProcessingPayment(false);
      const msg = err instanceof Error ? err.message : 'Unable to complete test payment. Please try again.';
      setPaymentError(msg);
    }
  };

  const handleContinueToTracking = () => {
    setShowSuccessModal(false);
    if (createdOrderId) {
      onOrderSuccess(createdOrderId);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + Math.max(insets.bottom, 16) },
        ]}>
        {/* Mock Payment Test Banner */}
        <View style={styles.testModeBanner}>
          <View style={styles.testBadgeRow}>
            <Text style={styles.testBadge}>MOCK GATEWAY</Text>
            <Text style={styles.testModeTitle}>TEST PAYMENT — NO REAL MONEY IS CHARGED</Text>
          </View>
          <Text style={styles.testModeDesc}>
            Payment will be simulated instantly. Your order will be stored with a unique ID and marked as paid (test mode).
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepBanner}>
          <Text style={styles.stepTitle}>Final Step: Delivery & Payment</Text>
          <Text style={styles.stepSubtitle}>
            Simulated cashless Nigerian payment gateway (Paystack / Instant Transfer)
          </Text>
        </View>

        {paymentError ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorText}>⚠️ {paymentError}</Text>
          </View>
        ) : null}

        {/* Delivery Address Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
            <TouchableOpacity
              onPress={() => setShowNewAddressModal(true)}
              activeOpacity={0.7}>
              <Text style={styles.addAddressAction}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <TouchableOpacity
                key={addr.id}
                onPress={() => setSelectedAddressId(addr.id)}
                activeOpacity={0.8}
                style={[styles.addressItem, isSelected && styles.addressItemSelected]}>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.addrTitleRow}>
                    <Text style={styles.addrTitle}>{addr.title}</Text>
                    {addr.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
                  </View>
                  <Text style={styles.addrStreet}>{addr.street}</Text>
                  <Text style={styles.addrArea}>{addr.area}</Text>
                  {addr.landmark && (
                    <Text style={styles.addrLandmark}>Note: {addr.landmark}</Text>
                  )}
                  <Text style={styles.addrPhone}>📞 {addr.phoneNumber}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Delivery Instructions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📝 Delivery & Gate Instructions</Text>
          <TextInput
            placeholder="e.g. Leave with security guard at Gate 2, call when outside..."
            placeholderTextColor={ChowTheme.colors.textMuted}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            style={styles.instructionInput}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Payment Methods (Online ONLY - No cash on delivery) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💳 Online Payment Gateway</Text>
            <View style={styles.noCodBadge}>
              <Text style={styles.noCodText}>No Cash On Delivery</Text>
            </View>
          </View>
          <Text style={styles.paymentNotice}>
            Chow is a cashless kitchen. All orders must be prepaid securely.
          </Text>

          {/* Option 1: Paystack Card */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('Paystack Card')}
            activeOpacity={0.8}
            style={[
              styles.paymentOption,
              paymentMethod === 'Paystack Card' && styles.paymentOptionSelected,
            ]}>
            <View style={styles.paymentRadioRow}>
              <View
                style={[
                  styles.radio,
                  paymentMethod === 'Paystack Card' && styles.radioSelected,
                ]}>
                {paymentMethod === 'Paystack Card' && <View style={styles.radioDot} />}
              </View>
              <View>
                <Text style={styles.paymentTitle}>Debit / Credit Card (Paystack)</Text>
                <Text style={styles.paymentSub}>Mastercard, Visa, Verve</Text>
              </View>
            </View>
            <Text style={styles.paymentBadge}>Instant</Text>
          </TouchableOpacity>

          {/* Option 2: Bank Transfer Online */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('Bank Transfer (Online)')}
            activeOpacity={0.8}
            style={[
              styles.paymentOption,
              paymentMethod === 'Bank Transfer (Online)' && styles.paymentOptionSelected,
            ]}>
            <View style={styles.paymentRadioRow}>
              <View
                style={[
                  styles.radio,
                  paymentMethod === 'Bank Transfer (Online)' && styles.radioSelected,
                ]}>
                {paymentMethod === 'Bank Transfer (Online)' && <View style={styles.radioDot} />}
              </View>
              <View>
                <Text style={styles.paymentTitle}>Instant Bank Transfer</Text>
                <Text style={styles.paymentSub}>Automated dynamic virtual account</Text>
              </View>
            </View>
            <Text style={styles.paymentBadge}>Popular</Text>
          </TouchableOpacity>

          {/* Option 3: USSD */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('USSD')}
            activeOpacity={0.8}
            style={[
              styles.paymentOption,
              paymentMethod === 'USSD' && styles.paymentOptionSelected,
            ]}>
            <View style={styles.paymentRadioRow}>
              <View
                style={[styles.radio, paymentMethod === 'USSD' && styles.radioSelected]}>
                {paymentMethod === 'USSD' && <View style={styles.radioDot} />}
              </View>
              <View>
                <Text style={styles.paymentTitle}>USSD Quick Code (*737#, *966#)</Text>
                <Text style={styles.paymentSub}>Dial on your mobile device</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🧾 Order Summary ({cart.length} items)</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Meal Subtotal</Text>
            <Text style={styles.summaryValue}>₦{cartSubtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Dispatch Fee</Text>
            <Text style={styles.summaryValue}>₦{deliveryFee.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Eco Packaging & Service</Text>
            <Text style={styles.summaryValue}>₦{serviceFee.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total (Prepaid)</Text>
            <Text style={styles.totalValue}>₦{grandTotal.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Payment Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.testModeMicroNotice}>
          <Text style={styles.testModeMicroText}>🧪 TEST PAYMENT — NO REAL MONEY CHARGED</Text>
        </View>
        <ChowButton
          title={
            isProcessingPayment
              ? 'Simulating Payment Verification...'
              : `Pay ₦${grandTotal.toLocaleString()} Now (Test Mode)`
          }
          loading={isProcessingPayment}
          disabled={isProcessingPayment}
          onPress={handlePayAndPlaceOrder}
          size="lg"
        />
      </View>

      {/* Payment Success Screen Modal (Simulated Payment) */}
      <Modal visible={showSuccessModal} animationType="fade" transparent>
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalCard}>
            <View style={styles.successIconBadge}>
              <Text style={styles.successEmoji}>🎉</Text>
            </View>

            <View style={styles.successSimulatedTag}>
              <Text style={styles.successSimulatedTagText}>PAYMENT SIMULATED • TEST MODE</Text>
            </View>

            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSub}>
              Your test transaction was verified successfully. No real money was charged.
            </Text>

            <View style={styles.successReceiptBox}>
              <View style={styles.successReceiptRow}>
                <Text style={styles.successReceiptLabel}>Order Number:</Text>
                <Text style={styles.successReceiptValue}>#{createdOrderNumber}</Text>
              </View>
              <View style={styles.successReceiptRow}>
                <Text style={styles.successReceiptLabel}>Amount Paid:</Text>
                <Text style={styles.successReceiptTotal}>₦{grandTotal.toLocaleString()}</Text>
              </View>
              <View style={styles.successReceiptRow}>
                <Text style={styles.successReceiptLabel}>Method:</Text>
                <Text style={styles.successReceiptValue}>{paymentMethod}</Text>
              </View>
              <View style={styles.successReceiptRow}>
                <Text style={styles.successReceiptLabel}>Customer:</Text>
                <Text style={styles.successReceiptValue}>
                  {user?.fullName || currentAddress?.title || 'Customer'}
                </Text>
              </View>
              <View style={styles.successReceiptRow}>
                <Text style={styles.successReceiptLabel}>Status:</Text>
                <View style={styles.successStatusPill}>
                  <Text style={styles.successStatusPillText}>payment simulated</Text>
                </View>
              </View>
            </View>

            <ChowButton
              title="View Order Confirmation & Track ➔"
              size="lg"
              onPress={handleContinueToTracking}
            />
          </View>
        </View>
      </Modal>

      {/* New Address Modal */}
      <Modal visible={showNewAddressModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowNewAddressModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Label (e.g. My Apartment, Office, Hall B)"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Street Address & House / Flat No."
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={newStreet}
              onChangeText={setNewStreet}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Area / Neighborhood (e.g. Lekki Phase 1, Campus)"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={newArea}
              onChangeText={setNewArea}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Landmark or Reception Drop Note"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={newLandmark}
              onChangeText={setNewLandmark}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Recipient Phone Number"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
              style={styles.modalInput}
            />

            <ChowButton title="Save & Use Address" onPress={handleSaveAddress} />
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
  scrollContent: {
    padding: ChowTheme.spacing.base,
    paddingBottom: 110,
  },
  stepBanner: {
    backgroundColor: ChowTheme.colors.brown,
    padding: ChowTheme.spacing.base,
    borderRadius: ChowTheme.radii.lg,
    marginBottom: ChowTheme.spacing.base,
  },
  stepTitle: {
    color: ChowTheme.colors.cream,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: ChowTheme.typography.serifFont,
  },
  stepSubtitle: {
    color: ChowTheme.colors.nude,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: ChowTheme.colors.creamCard,
    padding: ChowTheme.spacing.base,
    borderRadius: ChowTheme.radii.lg,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: ChowTheme.spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  addAddressAction: {
    fontSize: 13,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: ChowTheme.colors.white,
    padding: 12,
    borderRadius: ChowTheme.radii.md,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 8,
  },
  addressItemSelected: {
    borderColor: ChowTheme.colors.brown,
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ChowTheme.colors.nudeDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  radioSelected: {
    borderColor: ChowTheme.colors.brown,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ChowTheme.colors.brown,
  },
  addrTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  addrTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  defaultBadge: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: ChowTheme.colors.brown,
    color: ChowTheme.colors.cream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addrStreet: {
    fontSize: 13,
    color: ChowTheme.colors.textSecondary,
  },
  addrArea: {
    fontSize: 12,
    color: ChowTheme.colors.textMuted,
    marginTop: 1,
  },
  addrLandmark: {
    fontSize: 11,
    color: ChowTheme.colors.brown,
    marginTop: 2,
    fontStyle: 'italic',
  },
  addrPhone: {
    fontSize: 11,
    color: ChowTheme.colors.textSecondary,
    marginTop: 4,
  },
  instructionInput: {
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    backgroundColor: ChowTheme.colors.white,
    borderRadius: ChowTheme.radii.sm,
    padding: 12,
    fontSize: 13,
    color: ChowTheme.colors.textPrimary,
    marginTop: 8,
    textAlignVertical: 'top',
  },
  noCodBadge: {
    backgroundColor: ChowTheme.colors.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ChowTheme.radii.pill,
  },
  noCodText: {
    color: ChowTheme.colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  paymentNotice: {
    fontSize: 12,
    color: ChowTheme.colors.textSecondary,
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ChowTheme.colors.white,
    padding: 12,
    borderRadius: ChowTheme.radii.md,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 8,
  },
  paymentOptionSelected: {
    borderColor: ChowTheme.colors.brown,
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  paymentRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  paymentSub: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
  },
  paymentBadge: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: ChowTheme.colors.cream,
    borderWidth: 1,
    borderColor: ChowTheme.colors.nudeDark,
    color: ChowTheme.colors.brown,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: ChowTheme.radii.pill,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: ChowTheme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: ChowTheme.colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ChowTheme.colors.cream,
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
    padding: ChowTheme.spacing.base,
    paddingBottom: 24,
    ...ChowTheme.shadows.prominent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: ChowTheme.colors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: ChowTheme.spacing.base,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
  },
  modalClose: {
    fontSize: 18,
    color: ChowTheme.colors.textSecondary,
    padding: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    backgroundColor: ChowTheme.colors.white,
    borderRadius: ChowTheme.radii.sm,
    padding: 12,
    fontSize: 13,
    color: ChowTheme.colors.textPrimary,
    marginBottom: 10,
  },
  testModeBanner: {
    backgroundColor: ChowTheme.colors.brownDark,
    borderRadius: ChowTheme.radii.lg,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: ChowTheme.colors.nude,
  },
  testBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  testBadge: {
    backgroundColor: ChowTheme.colors.brown,
    color: ChowTheme.colors.cream,
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  testModeTitle: {
    color: ChowTheme.colors.cream,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    flex: 1,
  },
  testModeDesc: {
    color: ChowTheme.colors.nudeLight,
    fontSize: 11,
    lineHeight: 15,
  },
  errorAlert: {
    backgroundColor: ChowTheme.colors.dangerLight,
    padding: 10,
    borderRadius: ChowTheme.radii.sm,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ChowTheme.colors.danger,
  },
  errorText: {
    color: ChowTheme.colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  testModeMicroNotice: {
    alignItems: 'center',
    marginBottom: 8,
  },
  testModeMicroText: {
    fontSize: 10,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
    letterSpacing: 0.5,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 15, 10, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ChowTheme.spacing.base,
  },
  successModalCard: {
    backgroundColor: ChowTheme.colors.cream,
    borderRadius: ChowTheme.radii.xl,
    padding: ChowTheme.spacing.xl,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    ...ChowTheme.shadows.prominent,
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ChowTheme.colors.nudeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: ChowTheme.colors.brown,
  },
  successEmoji: {
    fontSize: 32,
  },
  successSimulatedTag: {
    backgroundColor: ChowTheme.colors.brown,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ChowTheme.radii.pill,
    marginBottom: 8,
  },
  successSimulatedTagText: {
    color: ChowTheme.colors.cream,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
    fontFamily: ChowTheme.typography.serifFont,
    textAlign: 'center',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 12,
    color: ChowTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  successReceiptBox: {
    backgroundColor: ChowTheme.colors.white,
    borderRadius: ChowTheme.radii.md,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    padding: 14,
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  successReceiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successReceiptLabel: {
    fontSize: 12,
    color: ChowTheme.colors.textMuted,
    fontWeight: '600',
  },
  successReceiptValue: {
    fontSize: 13,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
  },
  successReceiptTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
  },
  successStatusPill: {
    backgroundColor: ChowTheme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ChowTheme.radii.pill,
  },
  successStatusPillText: {
    color: ChowTheme.colors.success,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
