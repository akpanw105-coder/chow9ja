import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChowTheme } from '@/constants/chow-theme';

interface ChowHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const ChowHeader: React.FC<ChowHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBack && onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityLabel="Go back">
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🍲</Text>
          </View>
        )}
      </View>

      <View style={styles.centerContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightContainer}>{rightAction || <View style={{ width: 38 }} />}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ChowTheme.spacing.base,
    backgroundColor: ChowTheme.colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: ChowTheme.colors.border,
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: ChowTheme.radii.pill,
    backgroundColor: ChowTheme.colors.card,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...ChowTheme.shadows.soft,
  },
  backArrow: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
    color: ChowTheme.colors.brown,
    marginTop: -2,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: ChowTheme.radii.pill,
    backgroundColor: ChowTheme.colors.nudeLight,
    borderWidth: 1,
    borderColor: ChowTheme.colors.nude,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    color: ChowTheme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
});
