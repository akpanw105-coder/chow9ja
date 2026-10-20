import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChowTheme } from '@/constants/chow-theme';
import { FoodItem, FoodOption, useChow } from '@/context/chow-context';
import { ChowButton } from './chow-button';

interface FoodDetailModalProps {
  food: FoodItem;
  onClose: () => void;
  onGoToCart?: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  onClose,
  onGoToCart,
}) => {
  const { addToCart } = useChow();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [selectedProtein, setSelectedProtein] = useState<FoodOption>(food.proteins[0]);
  const [selectedSwallow, setSelectedSwallow] = useState<FoodOption | undefined>(
    food.swallows ? food.swallows[0] : undefined
  );
  const [selectedPortion, setSelectedPortion] = useState<FoodOption | undefined>(
    food.portionSizes ? food.portionSizes[0] : undefined
  );
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedNotice, setAddedNotice] = useState(false);

  // Compute live price
  const basePrice = food.price;
  const proteinCost = selectedProtein ? selectedProtein.price : 0;
  const swallowCost = selectedSwallow ? selectedSwallow.price : 0;
  const portionCost = selectedPortion ? selectedPortion.price : 0;
  const unitPrice = basePrice + proteinCost + swallowCost + portionCost;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(food, quantity, {
      protein: selectedProtein,
      swallow: selectedSwallow,
      portionSize: selectedPortion,
      specialInstructions: specialInstructions.trim() ? specialInstructions.trim() : undefined,
    });
    setAddedNotice(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Image with Close Button */}
      <View style={styles.imageHeader}>
        <Image source={food.image} style={styles.heroImage} resizeMode="cover" />
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{food.category}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + Math.max(insets.bottom, 16) },
        ]}>
        {/* Title, Prep Time & Spice */}
        <View style={styles.titleSection}>
          <Text style={styles.foodTitle}>{food.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaBadge}>⏱️ {food.prepTimeMinutes} mins</Text>
            <Text style={styles.metaBadge}>🌶️ {food.spiciness}</Text>
            <Text style={styles.metaBadge}>★ {food.rating} ({food.reviewCount} reviews)</Text>
          </View>
          <Text style={styles.description}>{food.description}</Text>
        </View>

        {/* Proteins / Meats Selection */}
        {food.proteins && food.proteins.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Choose Protein / Meat</Text>
              <Text style={styles.requiredTag}>Required (Pick 1)</Text>
            </View>
            <View style={styles.optionsList}>
              {food.proteins.map((option) => {
                const isSelected = selectedProtein?.id === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedProtein(option)}
                    activeOpacity={0.8}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}>
                    <View style={styles.optionLeft}>
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                        {option.name}
                      </Text>
                    </View>
                    <Text style={styles.optionPrice}>
                      {option.price === 0 ? 'Free' : `+₦${option.price.toLocaleString()}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Swallow Options (for soups) */}
        {food.swallows && food.swallows.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Select Preferred Swallow</Text>
              <Text style={styles.requiredTag}>Included</Text>
            </View>
            <View style={styles.optionsList}>
              {food.swallows.map((option) => {
                const isSelected = selectedSwallow?.id === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedSwallow(option)}
                    activeOpacity={0.8}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}>
                    <View style={styles.optionLeft}>
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                        {option.name}
                      </Text>
                    </View>
                    <Text style={styles.optionPrice}>
                      {option.price === 0 ? 'Free' : `+₦${option.price.toLocaleString()}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Portion Sizes */}
        {food.portionSizes && food.portionSizes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Portion Size</Text>
              <Text style={styles.optionalTag}>Choice</Text>
            </View>
            <View style={styles.optionsList}>
              {food.portionSizes.map((option) => {
                const isSelected = selectedPortion?.id === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedPortion(option)}
                    activeOpacity={0.8}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}>
                    <View style={styles.optionLeft}>
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                        {option.name}
                      </Text>
                    </View>
                    <Text style={styles.optionPrice}>
                      {option.price === 0 ? 'Included' : `+₦${option.price.toLocaleString()}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Special Instructions Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Kitchen Instructions</Text>
          <TextInput
            placeholder="e.g. Mild pepper please, package swallow separately..."
            placeholderTextColor={ChowTheme.colors.textMuted}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            style={styles.instructionInput}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              style={styles.qtyBtn}
              activeOpacity={0.7}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity((q) => q + 1)}
              style={styles.qtyBtn}
              activeOpacity={0.7}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.priceColumn}>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerPrice}>₦{totalPrice.toLocaleString()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <ChowButton
            title={addedNotice ? 'Added to Chow Cart! ✓' : `Add ${quantity} to Cart`}
            variant={addedNotice ? 'secondary' : 'primary'}
            onPress={handleAddToCart}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ChowTheme.colors.cream,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  imageHeader: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: ChowTheme.radii.pill,
    backgroundColor: 'rgba(77, 44, 30, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: ChowTheme.colors.cream,
    fontSize: 16,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    backgroundColor: ChowTheme.colors.brown,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: ChowTheme.radii.pill,
  },
  categoryText: {
    color: ChowTheme.colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: ChowTheme.spacing.base,
    paddingBottom: 110,
  },
  titleSection: {
    marginBottom: ChowTheme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
    paddingBottom: ChowTheme.spacing.base,
  },
  foodTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metaBadge: {
    fontSize: 12,
    color: ChowTheme.colors.brown,
    backgroundColor: ChowTheme.colors.nudeLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ChowTheme.radii.pill,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: ChowTheme.colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: ChowTheme.spacing.base,
    backgroundColor: ChowTheme.colors.creamCard,
    padding: ChowTheme.spacing.base,
    borderRadius: ChowTheme.radii.md,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
  },
  sectionHeaderRow: {
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
  requiredTag: {
    fontSize: 11,
    color: ChowTheme.colors.brown,
    fontWeight: '700',
  },
  optionalTag: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    fontWeight: '600',
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: ChowTheme.radii.sm,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    backgroundColor: ChowTheme.colors.white,
  },
  optionRowSelected: {
    borderColor: ChowTheme.colors.brown,
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: ChowTheme.colors.nudeDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: ChowTheme.colors.brown,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ChowTheme.colors.brown,
  },
  optionName: {
    fontSize: 13,
    color: ChowTheme.colors.textPrimary,
    fontWeight: '500',
  },
  optionNameSelected: {
    fontWeight: '700',
  },
  optionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  instructionInput: {
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    backgroundColor: ChowTheme.colors.white,
    borderRadius: ChowTheme.radii.sm,
    padding: 10,
    fontSize: 13,
    color: ChowTheme.colors.textPrimary,
    marginTop: 8,
    textAlignVertical: 'top',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ChowTheme.colors.creamCard,
    padding: ChowTheme.spacing.base,
    borderRadius: ChowTheme.radii.md,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ChowTheme.colors.white,
    borderRadius: ChowTheme.radii.pill,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 40,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  qtyText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ChowTheme.colors.cream,
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
    paddingHorizontal: ChowTheme.spacing.base,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    ...ChowTheme.shadows.prominent,
  },
  priceColumn: {
    justifyContent: 'center',
  },
  footerLabel: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: ChowTheme.colors.brown,
  },
});
