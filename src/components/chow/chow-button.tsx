import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChowTheme } from '@/constants/chow-theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const ChowButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        size === 'sm' && styles.sizeSm,
        size === 'md' && styles.sizeMd,
        size === 'lg' && styles.sizeLg,
        isPrimary && styles.primaryBg,
        isSecondary && styles.secondaryBg,
        isOutline && styles.outlineBg,
        isDanger && styles.dangerBg,
        isGhost && styles.ghostBg,
        disabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || isSecondary || isGhost ? ChowTheme.colors.brown : ChowTheme.colors.cream}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.textBase,
              size === 'sm' && styles.textSm,
              size === 'md' && styles.textMd,
              size === 'lg' && styles.textLg,
              isPrimary && styles.primaryText,
              isSecondary && styles.secondaryText,
              isOutline && styles.outlineText,
              isDanger && styles.dangerText,
              isGhost && styles.ghostText,
            ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: ChowTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  sizeLg: {
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  primaryBg: {
    backgroundColor: ChowTheme.colors.brown,
    borderWidth: 1,
    borderColor: ChowTheme.colors.brown,
  },
  secondaryBg: {
    backgroundColor: ChowTheme.colors.nude,
    borderWidth: 1,
    borderColor: ChowTheme.colors.nudeDark,
  },
  outlineBg: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: ChowTheme.colors.brown,
  },
  dangerBg: {
    backgroundColor: ChowTheme.colors.danger,
    borderWidth: 1,
    borderColor: ChowTheme.colors.danger,
  },
  ghostBg: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 17,
  },
  primaryText: {
    color: ChowTheme.colors.cream,
  },
  secondaryText: {
    color: ChowTheme.colors.brown,
  },
  outlineText: {
    color: ChowTheme.colors.brown,
  },
  dangerText: {
    color: ChowTheme.colors.white,
  },
  ghostText: {
    color: ChowTheme.colors.textSecondary,
  },
});
