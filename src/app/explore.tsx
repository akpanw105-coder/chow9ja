import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminDashboardView } from '@/components/chow/admin-dashboard-view';
import { ChowTheme } from '@/constants/chow-theme';
import { router } from 'expo-router';
import { useChow } from '@/context/chow-context';

export default function ExploreScreen() {
  const { currentRole, isAuthenticated, authLoading } = useChow();

  // Redirect non-admins away from this screen
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || currentRole !== 'admin')) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, currentRole]);

  if (authLoading || currentRole !== 'admin') return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AdminDashboardView onBackToCustomer={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ChowTheme.colors.cream,
  },
  container: {
    flex: 1,
    backgroundColor: ChowTheme.colors.cream,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
});
