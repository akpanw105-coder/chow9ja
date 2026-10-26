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

interface ProfileAddressesViewProps {
  onBackToMenu: () => void;
  onOpenAdmin: () => void;
}

export const ProfileAddressesView: React.FC<ProfileAddressesViewProps> = ({
  onBackToMenu,
  onOpenAdmin,
}) => {
  const {
    user,
    updateUserProfile,
    addresses,
    addAddress,
    setDefaultAddress,
    deleteAddress,
    signOut,
  } = useChow();

  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');

  // Edit profile state
  const [name, setName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [savedNotice, setSavedNotice] = useState(false);

  // Add address modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addrTitle, setAddrTitle] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');

  const handleSaveProfile = () => {
    updateUserProfile({ fullName: name, phone });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleAddNewAddress = () => {
    if (!addrTitle.trim() || !addrStreet.trim()) return;
    addAddress({
      title: addrTitle.trim(),
      street: addrStreet.trim(),
      area: addrArea.trim() || 'Lagos',
      landmark: addrLandmark.trim() || undefined,
      isDefault: addresses.length === 0,
      phoneNumber: phone,
    });
    setShowAddModal(false);
    setAddrTitle('');
    setAddrStreet('');
    setAddrArea('');
    setAddrLandmark('');
  };

  return (
    <View style={styles.container}>
      {/* User Header Badge */}
      <View style={styles.userHero}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {user.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user.fullName}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.userTag}>
          <Text style={styles.userTagText}>Chow Gold Member</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('profile')}
          style={[styles.tab, activeTab === 'profile' && styles.tabActive]}>
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            Personal Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('addresses')}
          style={[styles.tab, activeTab === 'addresses' && styles.tabActive]}>
          <Text style={[styles.tabText, activeTab === 'addresses' && styles.tabTextActive]}>
            Saved Addresses ({addresses.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 40) }]}>
        {activeTab === 'profile' ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardHeading}>Account Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholderTextColor={ChowTheme.colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address (Verified)</Text>
                <TextInput
                  value={user.email}
                  editable={false}
                  style={[styles.input, styles.disabledInput]}
                  placeholderTextColor={ChowTheme.colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Phone Number</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                  placeholderTextColor={ChowTheme.colors.textMuted}
                />
              </View>

              <ChowButton
                title={savedNotice ? 'Changes Saved! ✓' : 'Save Profile Changes'}
                onPress={handleSaveProfile}
              />
            </View>

            {/* Admin Switcher Access — only for authorized admins */}
            {user.role === 'admin' && (
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Operational Controls</Text>
                <Text style={styles.cardSub}>
                  Manage live food orders, update prices, menu items and sales ledger.
                </Text>
                <ChowButton
                  title="Switch to Chow Admin Dashboard"
                  variant="secondary"
                  onPress={onOpenAdmin}
                />
              </View>
            )}

            {/* Sign out */}
            <View style={{ marginTop: 8 }}>
              <ChowButton
                title="Log Out of Chow"
                variant="outline"
                onPress={signOut}
              />
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.addrHeaderRow}>
              <Text style={styles.cardHeading}>Delivery Addresses</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.7}
                style={styles.addBtnPill}>
                <Text style={styles.addBtnPillText}>+ Add Address</Text>
              </TouchableOpacity>
            </View>

            {addresses.map((addr) => (
              <View key={addr.id} style={styles.addrCard}>
                <View style={styles.addrTopRow}>
                  <View style={styles.addrTitleBadge}>
                    <Text style={styles.addrName}>{addr.title}</Text>
                    {addr.isDefault && <Text style={styles.defBadge}>Default</Text>}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteAddress(addr.id)}
                    style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.addrStreetText}>{addr.street}</Text>
                <Text style={styles.addrAreaText}>{addr.area}</Text>
                {addr.landmark && (
                  <Text style={styles.addrLandmarkText}>Drop instructions: {addr.landmark}</Text>
                )}

                {!addr.isDefault && (
                  <TouchableOpacity
                    onPress={() => setDefaultAddress(addr.id)}
                    style={styles.makeDefBtn}>
                    <Text style={styles.makeDefText}>Set as Default Delivery Address</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Label (e.g. Campus Hostel, Lekki Flat, Office)"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={addrTitle}
              onChangeText={setAddrTitle}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Street Name & Building / Apartment"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={addrStreet}
              onChangeText={setAddrStreet}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Area / Neighborhood (e.g. Victoria Island)"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={addrArea}
              onChangeText={setAddrArea}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Drop note / Porter desk instructions"
              placeholderTextColor={ChowTheme.colors.textMuted}
              value={addrLandmark}
              onChangeText={setAddrLandmark}
              style={styles.modalInput}
            />

            <ChowButton title="Save Address" onPress={handleAddNewAddress} />
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
  userHero: {
    backgroundColor: ChowTheme.colors.brown,
    paddingTop: ChowTheme.spacing.lg,
    paddingBottom: ChowTheme.spacing.xl,
    alignItems: 'center',
    paddingHorizontal: ChowTheme.spacing.base,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ChowTheme.colors.nude,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: ChowTheme.colors.cream,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: ChowTheme.colors.cream,
    fontFamily: ChowTheme.typography.serifFont,
  },
  userEmail: {
    fontSize: 12,
    color: ChowTheme.colors.nudeLight,
    marginTop: 2,
  },
  userTag: {
    backgroundColor: 'rgba(216, 180, 156, 0.25)',
    borderWidth: 1,
    borderColor: ChowTheme.colors.nude,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: ChowTheme.radii.pill,
    marginTop: 8,
  },
  userTagText: {
    color: ChowTheme.colors.nude,
    fontSize: 11,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: ChowTheme.colors.creamCard,
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: ChowTheme.colors.brown,
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  tabText: {
    fontSize: 13,
    color: ChowTheme.colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: ChowTheme.colors.brown,
    fontWeight: '800',
  },
  scrollContent: {
    padding: ChowTheme.spacing.base,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: ChowTheme.colors.creamCard,
    borderRadius: ChowTheme.radii.lg,
    padding: ChowTheme.spacing.base,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: ChowTheme.spacing.base,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 12,
    color: ChowTheme.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 17,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: ChowTheme.colors.white,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    borderRadius: ChowTheme.radii.sm,
    padding: 10,
    fontSize: 13,
    color: ChowTheme.colors.textPrimary,
  },
  disabledInput: {
    backgroundColor: '#F3EFE0',
    color: ChowTheme.colors.textMuted,
  },
  addrHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtnPill: {
    backgroundColor: ChowTheme.colors.brown,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: ChowTheme.radii.pill,
  },
  addBtnPillText: {
    color: ChowTheme.colors.cream,
    fontSize: 11,
    fontWeight: '700',
  },
  addrCard: {
    backgroundColor: ChowTheme.colors.white,
    padding: ChowTheme.spacing.base,
    borderRadius: ChowTheme.radii.lg,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 10,
    ...ChowTheme.shadows.soft,
  },
  addrTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addrTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addrName: {
    fontSize: 14,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
  },
  defBadge: {
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: ChowTheme.colors.brown,
    color: ChowTheme.colors.cream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    color: ChowTheme.colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  addrStreetText: {
    fontSize: 13,
    color: ChowTheme.colors.textSecondary,
  },
  addrAreaText: {
    fontSize: 12,
    color: ChowTheme.colors.textMuted,
    marginTop: 2,
  },
  addrLandmarkText: {
    fontSize: 11,
    color: ChowTheme.colors.brown,
    marginTop: 4,
    fontStyle: 'italic',
  },
  makeDefBtn: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
  },
  makeDefText: {
    fontSize: 11,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
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
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
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
});
