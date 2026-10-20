import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChowTheme } from '@/constants/chow-theme';
import { FoodItem } from '@/context/chow-context';

interface FoodCardProps {
  food: FoodItem;
  onPress: () => void;
  onQuickAdd?: () => void;
  layout?: 'grid' | 'horizontal';
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  onQuickAdd,
  layout = 'grid',
}) => {
  const isHorizontal = layout === 'horizontal';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        isHorizontal ? styles.cardHorizontal : styles.cardGrid,
        !food.isAvailable && styles.cardUnavailable,
      ]}>
      {/* Food Image & Badge */}
      <View style={[styles.imageWrapper, isHorizontal && styles.imageWrapperHorizontal]}>
        <Image source={food.image} style={styles.image} resizeMode="cover" />
        <View style={styles.badgeRow}>
          <View style={styles.spiceBadge}>
            <Text style={styles.spiceText}>🌶️ {food.spiciness}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {food.rating.toFixed(1)}</Text>
          </View>
        </View>

        {!food.isAvailable && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>Sold Out Today</Text>
          </View>
        )}
      </View>

      {/* Info Container */}
      <View style={[styles.infoContainer, isHorizontal && styles.infoContainerHorizontal]}>
        <Text style={styles.prepTime}>⏱️ {food.prepTimeMinutes} mins prep</Text>
        <Text style={styles.title} numberOfLines={isHorizontal ? 1 : 2}>
          {food.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {food.description}
        </Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>₦{food.price.toLocaleString()}</Text>
          </View>

          {food.isAvailable && onQuickAdd && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onQuickAdd();
              }}
              activeOpacity={0.8}
              style={styles.addButton}>
              <Text style={styles.addSign}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: ChowTheme.colors.card,
    borderRadius: ChowTheme.radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    ...ChowTheme.shadows.soft,
    marginBottom: ChowTheme.spacing.base,
  },
  cardGrid: {
    width: '100%',
  },
  cardHorizontal: {
    flexDirection: 'row',
    height: 140,
  },
  cardUnavailable: {
    opacity: 0.65,
  },
  imageWrapper: {
    width: '100%',
    height: 170,
    position: 'relative',
    backgroundColor: ChowTheme.colors.nudeLight,
  },
  imageWrapperHorizontal: {
    width: 130,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spiceBadge: {
    backgroundColor: 'rgba(77, 44, 30, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ChowTheme.radii.pill,
  },
  spiceText: {
    color: ChowTheme.colors.cream,
    fontSize: 10,
    fontWeight: '700',
  },
  ratingBadge: {
    backgroundColor: ChowTheme.colors.cream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ChowTheme.radii.pill,
    ...ChowTheme.shadows.soft,
  },
  ratingText: {
    color: ChowTheme.colors.brown,
    fontSize: 11,
    fontWeight: '800',
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(77, 44, 30, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutText: {
    color: ChowTheme.colors.cream,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  infoContainer: {
    padding: ChowTheme.spacing.base,
    backgroundColor: ChowTheme.colors.creamCard,
  },
  infoContainerHorizontal: {
    flex: 1,
    justifyContent: 'space-between',
    padding: ChowTheme.spacing.md,
  },
  prepTime: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
    lineHeight: 21,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: ChowTheme.colors.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ChowTheme.colors.border,
  },
  priceLabel: {
    fontSize: 10,
    color: ChowTheme.colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: ChowTheme.radii.pill,
    backgroundColor: ChowTheme.colors.brown,
    justifyContent: 'center',
    alignItems: 'center',
    ...ChowTheme.shadows.soft,
  },
  addSign: {
    color: ChowTheme.colors.cream,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: -2,
  },
});
