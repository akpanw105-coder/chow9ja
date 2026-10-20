import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ChowTheme } from '@/constants/chow-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%', backgroundColor: ChowTheme.colors.cream }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>🍲 Chow Delicacies</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>⚙️ Kitchen Ops (Admin)</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        style={[
          styles.tabButtonView,
          isFocused ? styles.tabButtonActive : styles.tabButtonInactive,
        ]}>
        <ThemedText
          type="smallBold"
          style={[styles.tabText, isFocused ? styles.tabTextActive : styles.tabTextInactive]}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <ThemedText style={styles.logoEmoji}>🍲</ThemedText>
          </View>
          <ThemedText style={styles.brandText}>CHOW</ThemedText>
        </View>

        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: ChowTheme.radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    backgroundColor: ChowTheme.colors.brown,
    borderWidth: 1,
    borderColor: ChowTheme.colors.nude,
    ...ChowTheme.shadows.prominent,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 'auto',
    gap: 6,
  },
  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ChowTheme.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 12,
  },
  brandText: {
    fontWeight: '900',
    letterSpacing: 1.5,
    color: ChowTheme.colors.cream,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.8,
  },
  tabButtonView: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: ChowTheme.radii.pill,
  },
  tabButtonActive: {
    backgroundColor: ChowTheme.colors.cream,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
  },
  tabTextActive: {
    color: ChowTheme.colors.brown,
    fontWeight: '800',
  },
  tabTextInactive: {
    color: ChowTheme.colors.nudeLight,
    fontWeight: '600',
  },
});
