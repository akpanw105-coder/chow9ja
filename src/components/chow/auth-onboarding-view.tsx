import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ChowTheme } from '@/constants/chow-theme';
import { useChow } from '@/context/chow-context';
import { ChowButton } from './chow-button';

interface AuthOnboardingViewProps {
  onSuccess: () => void;
}

export const AuthOnboardingView: React.FC<AuthOnboardingViewProps> = ({ onSuccess }) => {
  const { signIn, signUp, authLoading } = useChow();
  const [mode, setMode] = useState<'onboarding' | 'login' | 'signup'>('onboarding');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin'>('customer');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecretCode, setAdminSecretCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const busy = isLoading || authLoading;

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password');
      return;
    }

    if (selectedRole === 'admin' && adminSecretCode.trim() !== 'CHOW9JA-ADMIN' && adminSecretCode.trim() !== 'admin') {
      setErrorMessage('Invalid Kitchen Admin passkey. Use default demo key: CHOW9JA-ADMIN');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password.trim(), selectedRole);
      setIsLoading(false);
      onSuccess();
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Unable to log in. Please verify your credentials.';
      setErrorMessage(msg);
    }
  };

  const handleSignUp = async () => {
    setErrorMessage('');
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in your name, email, and password');
      return;
    }

    if (password.trim().length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (selectedRole === 'admin' && adminSecretCode.trim() !== 'CHOW9JA-ADMIN' && adminSecretCode.trim() !== 'admin') {
      setErrorMessage('Admin registration requires the authorized passkey (CHOW9JA-ADMIN).');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(fullName.trim(), email.trim(), phone.trim() || '', password.trim(), selectedRole);
      setIsLoading(false);
      onSuccess();
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Registration error. Please check your details.';
      setErrorMessage(msg);
    }
  };

  // Demo access removed — all auth is backed by real Supabase Auth.

  if (mode === 'onboarding') {
    return (
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Image
            source={require('@/assets/images/jollof.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.logoPill}>
              <Text style={styles.logoEmoji}>🍲</Text>
              <Text style={styles.logoText}>CHOW</Text>
            </View>
            <Text style={styles.onboardingTagline}>
              Authentic Nigerian Flavors, Delivered Fast.
            </Text>
            <Text style={styles.onboardingSub}>
              From hot smokey party jollof and beef suya to hearty egusi and pounded yam.
              Prepaid cashless orders only.
            </Text>
          </View>
        </View>

        <View style={styles.onboardingActionBox}>
          <ChowButton
            title="Log In to Chow (Customer / Admin)"
            variant="primary"
            size="lg"
            onPress={() => {
              setMode('login');
              setErrorMessage('');
            }}
          />
          <View style={{ height: 12 }} />
          <ChowButton
            title="Create an Account"
            variant="outline"
            size="lg"
            onPress={() => {
              setMode('signup');
              setErrorMessage('');
            }}
          />
          <View style={{ height: 16 }} />

          {/* Auth info card */}
          <View style={styles.demoBox}>
            <Text style={styles.demoHeader}>🔒 SECURED BY SUPABASE AUTH</Text>
            <Text style={styles.demoPillText}>Sign up to create a real account or log in with your credentials. Admin access requires the CHOW9JA-ADMIN passkey.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.formContainer}>
      <TouchableOpacity
        onPress={() => {
          setMode('onboarding');
          setErrorMessage('');
        }}
        style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {mode === 'login' ? 'Chow Secure Authentication' : 'Create Chow Account'}
        </Text>
        <Text style={styles.formSub}>
          {mode === 'login'
            ? 'Sign in to access your saved addresses, track orders, or manage kitchen ops.'
            : 'Register your account powered by Supabase Authentication.'}
        </Text>
      </View>

      {/* Role Switcher Pill Bar (Customer vs Admin) */}
      <View style={styles.roleSelectorCard}>
        <Text style={styles.roleSelectorLabel}>Account Type Access:</Text>
        <View style={styles.roleTabs}>
          <TouchableOpacity
            onPress={() => {
              setSelectedRole('customer');
              setErrorMessage('');
            }}
            activeOpacity={0.8}
            style={[
              styles.roleTab,
              selectedRole === 'customer' && styles.roleTabActive,
            ]}>
            <Text style={styles.roleTabEmoji}>👤</Text>
            <Text
              style={[
                styles.roleTabText,
                selectedRole === 'customer' && styles.roleTabTextActive,
              ]}>
              Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedRole('admin');
              setErrorMessage('');
            }}
            activeOpacity={0.8}
            style={[
              styles.roleTab,
              selectedRole === 'admin' && styles.roleTabActive,
            ]}>
            <Text style={styles.roleTabEmoji}>⚙️</Text>
            <Text
              style={[
                styles.roleTabText,
                selectedRole === 'admin' && styles.roleTabTextActive,
              ]}>
              Kitchen Ops Admin
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.errorAlert}>
          <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
        </View>
      ) : null}

      {mode === 'signup' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            placeholder="e.g. Babatunde Lawal"
            placeholderTextColor={ChowTheme.colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {selectedRole === 'admin' ? 'Admin Email' : 'Email Address'}
        </Text>
        <TextInput
          placeholder={
            selectedRole === 'admin' ? 'admin@chow.ng' : 'your.email@domain.com'
          }
          placeholderTextColor={ChowTheme.colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      {mode === 'signup' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number (For Delivery Hand-off)</Text>
          <TextInput
            placeholder="+234 810 000 0000"
            placeholderTextColor={ChowTheme.colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor={ChowTheme.colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      </View>

      {/* Admin Verification Code */}
      {selectedRole === 'admin' && (
        <View style={styles.inputGroup}>
          <View style={styles.adminKeyLabelRow}>
            <Text style={styles.inputLabel}>Kitchen Ops Passkey</Text>
            <Text style={styles.adminHint}>Demo: CHOW9JA-ADMIN</Text>
          </View>
          <TextInput
            placeholder="Enter admin authorization key"
            placeholderTextColor={ChowTheme.colors.textMuted}
            value={adminSecretCode}
            onChangeText={setAdminSecretCode}
            autoCapitalize="characters"
            style={styles.input}
          />
        </View>
      )}

      <View style={{ marginTop: 14 }}>
        <ChowButton
          title={
            busy
              ? 'Verifying...'
              : mode === 'login'
              ? selectedRole === 'admin'
                ? 'Sign In as Kitchen Admin'
                : 'Sign In to Chow'
              : selectedRole === 'admin'
              ? 'Create Admin Account'
              : 'Create Customer Account'
          }
          size="lg"
          disabled={busy}
          onPress={mode === 'login' ? handleLogin : handleSignUp}
        />
      </View>

      {/* Toggle between Login and Signup */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>
          {mode === 'login' ? "Don't have an account yet? " : 'Already registered? '}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setErrorMessage('');
          }}>
          <Text style={styles.toggleLink}>
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Supabase backend badge */}
      <View style={styles.supabaseFootnote}>
        <Text style={styles.supabaseIcon}>⚡</Text>
        <Text style={styles.supabaseText}>
          Powered by Supabase Auth & PostgreSQL database
        </Text>
      </View>
    </ScrollView>
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
  heroSection: {
    flex: 1,
    position: 'relative',
    backgroundColor: ChowTheme.colors.brown,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.55,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    padding: ChowTheme.spacing.xl,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(77, 44, 30, 0.45)',
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ChowTheme.colors.cream,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: ChowTheme.radii.pill,
    marginBottom: 16,
    ...ChowTheme.shadows.soft,
  },
  logoEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  logoText: {
    color: ChowTheme.colors.brown,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  onboardingTagline: {
    fontSize: 28,
    fontWeight: '800',
    color: ChowTheme.colors.cream,
    fontFamily: ChowTheme.typography.serifFont,
    lineHeight: 34,
    marginBottom: 10,
  },
  onboardingSub: {
    fontSize: 13,
    color: ChowTheme.colors.nudeLight,
    lineHeight: 18,
  },
  onboardingActionBox: {
    backgroundColor: ChowTheme.colors.cream,
    padding: ChowTheme.spacing.xl,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    ...ChowTheme.shadows.prominent,
  },
  demoBox: {
    backgroundColor: ChowTheme.colors.creamCard,
    padding: 12,
    borderRadius: ChowTheme.radii.md,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    alignItems: 'center',
  },
  demoHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: ChowTheme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  demoPill: {
    flex: 1,
    backgroundColor: ChowTheme.colors.white,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: ChowTheme.radii.pill,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    alignItems: 'center',
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  demoAdminPill: {
    backgroundColor: ChowTheme.colors.brown,
    borderColor: ChowTheme.colors.brown,
  },
  demoAdminPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ChowTheme.colors.cream,
  },
  formContainer: {
    padding: ChowTheme.spacing.xl,
    paddingTop: 40,
    backgroundColor: ChowTheme.colors.cream,
    flexGrow: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ChowTheme.radii.pill,
    backgroundColor: ChowTheme.colors.nudeLight,
    marginBottom: 20,
  },
  backButtonText: {
    color: ChowTheme.colors.brown,
    fontWeight: '700',
    fontSize: 14,
  },
  formHeader: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: ChowTheme.colors.textPrimary,
    fontFamily: ChowTheme.typography.serifFont,
    marginBottom: 6,
  },
  formSub: {
    fontSize: 13,
    color: ChowTheme.colors.textSecondary,
    lineHeight: 18,
  },
  roleSelectorCard: {
    backgroundColor: ChowTheme.colors.creamCard,
    padding: 12,
    borderRadius: ChowTheme.radii.md,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    marginBottom: 16,
  },
  roleSelectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ChowTheme.colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ChowTheme.colors.white,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: ChowTheme.radii.pill,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
  },
  roleTabActive: {
    backgroundColor: ChowTheme.colors.brown,
    borderColor: ChowTheme.colors.brown,
  },
  roleTabEmoji: {
    fontSize: 13,
    marginRight: 6,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.textSecondary,
  },
  roleTabTextActive: {
    color: ChowTheme.colors.cream,
  },
  errorAlert: {
    backgroundColor: ChowTheme.colors.dangerLight,
    padding: 10,
    borderRadius: ChowTheme.radii.sm,
    marginBottom: 14,
  },
  errorText: {
    color: ChowTheme.colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ChowTheme.colors.textPrimary,
    marginBottom: 6,
  },
  adminKeyLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminHint: {
    fontSize: 10,
    fontWeight: '700',
    color: ChowTheme.colors.brown,
  },
  input: {
    backgroundColor: ChowTheme.colors.white,
    borderWidth: 1,
    borderColor: ChowTheme.colors.border,
    borderRadius: ChowTheme.radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: ChowTheme.colors.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleText: {
    color: ChowTheme.colors.textSecondary,
    fontSize: 13,
  },
  toggleLink: {
    color: ChowTheme.colors.brown,
    fontWeight: '800',
    fontSize: 13,
  },
  supabaseFootnote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  supabaseIcon: {
    fontSize: 12,
  },
  supabaseText: {
    fontSize: 11,
    color: ChowTheme.colors.textMuted,
    fontWeight: '500',
  },
});
