import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { ChowTheme } from '@/constants/chow-theme';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={ChowTheme.colors.cream}
      indicatorColor={ChowTheme.colors.brown}
      labelStyle={{ selected: { color: ChowTheme.colors.brown } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Chow Food</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Admin Ops</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
