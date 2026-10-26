import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ChowTheme } from '@/constants/chow-theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Chow - Page Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🍲</Text>
        <Text style={styles.title}>This delicacy doesn&apos;t exist.</Text>
        <Text style={styles.subtitle}>
          The page you requested could not be found or has moved.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>‹ Back to Chow Menu</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: ChowTheme.colors.cream,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  emoji: {
    fontSize: 54,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: ChowTheme.colors.brown,
    fontFamily: ChowTheme.typography.serifFont,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: ChowTheme.colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: ChowTheme.colors.brown,
    borderRadius: ChowTheme.radii.pill,
  },
  linkText: {
    color: ChowTheme.colors.cream,
    fontWeight: '800',
    fontSize: 14,
  },
});
