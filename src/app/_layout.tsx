import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Platform } from 'react-native';
import { ChowProvider } from '@/context/chow-context';
import AppTabs from '@/components/app-tabs';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ChowProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
      </ThemeProvider>
    </ChowProvider>
  );
}
