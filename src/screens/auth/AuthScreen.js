import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING } from '../../constants/theme';
import { STORAGE_KEYS } from '../../constants/storage';
import { useAuthStore } from '../../store/authStore';
import {
  login as apiLogin,
  register as apiRegister,
  verifyEmail as apiVerifyEmail,
  forgotPassword as apiForgotPassword,
  googleLogin as apiGoogleLogin,
} from '../../api/endpoints/auth';

WebBrowser.maybeCompleteAuthSession();

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
];

export const AuthScreen = ({ route, navigation }) => {
  const initialTab = route.params?.initialTab || 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  // Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Verification deep link states
  const [verifyingToken, setVerifyingToken] = useState(false);

  const { setUser } = useAuthStore();

  // Google Sign-In setup
  const [request, googleResponse, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  // Handle deep link verification token on mount or parameter update
  useEffect(() => {
    const handleDeepLinkVerify = async () => {
      const token = route.params?.token;
      if (token) {
        setVerifyingToken(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
          const data = await apiVerifyEmail(token);
          await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
          await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.user));
          setUser(data.user);
        } catch (err) {
          setErrorMsg(err.response?.data?.error || 'Verification link is invalid or expired.');
        } finally {
          setVerifyingToken(false);
        }
      }
    };
    handleDeepLinkVerify();
  }, [route.params?.token, setUser]);

  // Handle tab routing parameter updates
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  // Handle Google Login Response
  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (googleResponse?.type === 'success' && googleResponse.authentication?.idToken) {
        setLoading(true);
        setErrorMsg('');
        try {
          const idToken = googleResponse.authentication.idToken;
          const data = await apiGoogleLogin(idToken);
          await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
          await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.user));
          setUser(data.user);
        } catch (err) {
          setErrorMsg(err.response?.data?.error || 'Google Authentication failed.');
        } finally {
          setLoading(false);
        }
      }
    };
    handleGoogleAuth();
  }, [googleResponse, setUser]);

  // Real-time Validation Checks
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isPasswordLengthValid = password.length >= 8;
  const isPasswordComplexValid = /\d/.test(password);
  const isPasswordValid = isPasswordLengthValid && isPasswordComplexValid;

  const isNameValid = name.trim().length >= 2;
  const doesPasswordMatch = confirmPassword === password;

  const isLoginEnabled = isEmailValid && password.length > 0 && !loading;
  const isRegisterEnabled =
    isNameValid && isEmailValid && isPasswordValid && doesPasswordMatch && !loading;

  // Password Strength Estimator
  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '', color: 'transparent', score: 0 };
    if (!isPasswordLengthValid || !isPasswordComplexValid) {
      return { label: 'Weak', color: COLORS.status.error, score: 1 };
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    if (hasUpperCase && hasSpecialChar) {
      return { label: 'Strong', color: COLORS.status.synced, score: 3 };
    }
    return { label: 'Fair', color: COLORS.status.warning, score: 2 };
  };

  const strength = getPasswordStrength();

  const handleLogin = async () => {
    if (!isLoginEnabled) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await apiLogin({ email, password });
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setErrorMsg(err.response.data.error);
        // We navigate to EmailVerifyPending and pass the email
        navigation.navigate('EmailVerifyPending', { email });
      } else {
        setErrorMsg(err.response?.data?.error || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isRegisterEnabled) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await apiRegister({
        name,
        email,
        homeCountry: selectedCountry.name,
        password,
      });
      // Move to Email Verification Pending screen on success
      navigation.navigate('EmailVerifyPending', { email });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailRegex.test(forgotEmail)) return;
    setForgotLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await apiForgotPassword(forgotEmail);
      setSuccessMsg(data.message);
      setShowForgotModal(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Could not send reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida/ADBb0uhW8Qk3GmEfkUZ-VwjCPMrQfE-gSiC61l9N0j5yndyS9ecd10oCb82K9h5tS3vclcuPxAsPawa8lDckGZjY6F6NocgxqtZ9O1DvVPOXUiuiMPQm3wtkfN1SPW4lMNOemKTyLC2LrXZRalkEvmzpWyU_ITu_QmYEWx1wUEVnj5U8iEHPMsm-95Zuqqz7ahmtNQ9UdTg8v40aKIP_8fdcyLlUNairg6Nl62vEp0aDY_p8lqs2NtS4XwON4GHS',
              }}
              style={styles.logo}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {activeTab === 'login' ? 'Welcome back' : 'Create account'}
            </Text>
            <Text style={styles.headerSub}>
              {activeTab === 'login'
                ? 'Log in to continue your journey'
                : 'Join the community and start pinning'}
            </Text>
          </View>

          {/* Feedback Messages */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={20} color={COLORS.status.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successBox}>
              <MaterialIcons name="check-circle-outline" size={20} color={COLORS.status.synced} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {/* Segmented Control Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'login' && styles.tabButtonActive]}
              onPress={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
            >
              <Text
                style={[styles.tabText, activeTab === 'login' ? styles.tabTextActive : styles.tabTextInactive]}
              >
                Log in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'signup' && styles.tabButtonActive]}
              onPress={() => {
                setActiveTab('signup');
                setErrorMsg('');
              }}
            >
              <Text
                style={[styles.tabText, activeTab === 'signup' ? styles.tabTextActive : styles.tabTextInactive]}
              >
                Sign up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          {activeTab === 'login' ? (
            /* LOGIN TAB */
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter your password"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <MaterialIcons
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowForgotModal(true)}
                style={styles.forgotBtn}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryCTA, !isLoginEnabled && styles.primaryCTADisabled]}
                onPress={handleLogin}
                disabled={!isLoginEnabled}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryCTAText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* REGISTER TAB */
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Display name</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person" size={20} color="#ccc3d8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Adventurer Jane"
                    placeholderTextColor="#CBD5E1"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email address</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="mail" size={20} color="#ccc3d8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="jane@example.com"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Home country</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, { justifyContent: 'space-between' }]}
                  onPress={() => setShowCountryModal(true)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="public" size={20} color="#ccc3d8" style={styles.inputIcon} />
                    <Text style={[styles.input, { color: COLORS.text.primary, paddingVertical: 14 }]}>
                      {selectedCountry.flag} {selectedCountry.name}
                    </Text>
                  </View>
                  <MaterialIcons name="expand-more" size={24} color="#94A3B8" style={{ marginRight: 8 }} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color="#ccc3d8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <MaterialIcons
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Strength Indicator Bar */}
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarBg}>
                      <View
                        style={[
                          styles.strengthBarFill,
                          {
                            backgroundColor: strength.color,
                            width: `${(strength.score / 3) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>
                      Password strength: {strength.label}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock-reset" size={20} color="#ccc3d8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && !doesPasswordMatch && (
                  <Text style={styles.matchErrorText}>Passwords do not match</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryCTA, !isRegisterEnabled && styles.primaryCTADisabled]}
                onPress={handleRegister}
                disabled={!isRegisterEnabled}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryCTAText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Auth */}
          <TouchableOpacity
            style={styles.socialCTA}
            onPress={() => promptAsync()}
            disabled={loading}
          >
            <Image
              source={{
                uri: 'data:image/png;base64,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',
              }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          {/* Footer Policies */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing you agree to our{' '}
              <Text style={styles.footerLink} onPress={() => {}}>
                Terms
              </Text>{' '}
              &{' '}
              <Text style={styles.footerLink} onPress={() => {}}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Modal Picker */}
      <Modal visible={showCountryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal (Bottom-Sheet dialog) */}
      <Modal visible={showForgotModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 300 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Forgot Password</Text>
              <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: SPACING.pagePad }}>
              <Text style={styles.forgotInstruction}>
                Enter your email address and we will send you a password reset link.
              </Text>
              <View style={[styles.inputWrapper, { marginTop: 12 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.primaryCTA,
                  { marginTop: 16 },
                  !emailRegex.test(forgotEmail) && styles.primaryCTADisabled,
                ]}
                onPress={handleForgotPassword}
                disabled={!emailRegex.test(forgotEmail) || forgotLoading}
              >
                {forgotLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryCTAText}>Send reset link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full-screen Verification Loading Overlay */}
      {verifyingToken && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent.primary} />
          <Text style={styles.loadingOverlayText}>Verifying your email address...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: SPACING.pagePad,
    alignItems: 'center',
  },
  logoSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  logo: {
    height: 40,
    width: 160,
    resizeMode: 'contain',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 6,
    fontFamily: 'Inter_600SemiBold',
  },
  headerSub: {
    fontSize: 14,
    color: '#505F76',
    fontFamily: 'Inter_400Regular',
  },
  errorBox: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDAD6', // error-container
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#93000a',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Inter_500Medium',
  },
  successBox: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE', // success-container / accent.light
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: {
    color: COLORS.accent.primary,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Inter_500Medium',
  },
  tabContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#F5F2FF', // surface-container-low
    padding: 4,
    borderRadius: 9999,
    flexDirection: 'row',
    marginBottom: 28,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  tabButtonActive: {
    backgroundColor: COLORS.accent.primary, // #7C3AED
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#505F76',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#505F76', // secondary
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCC3D8', // outline-variant
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    fontSize: 12,
    color: COLORS.accent.primary,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  primaryCTA: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.accent.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryCTADisabled: {
    opacity: 0.5,
  },
  primaryCTAText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  divider: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCC3D8',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 11,
    fontWeight: '600',
    color: '#505F76',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  socialCTA: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  socialIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  },
  socialText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    marginVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#505F76',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  footerLink: {
    color: COLORS.accent.primary,
    fontWeight: '500',
  },
  strengthContainer: {
    marginTop: 6,
    gap: 4,
  },
  strengthBarBg: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  matchErrorText: {
    fontSize: 11,
    color: COLORS.status.error,
    marginTop: 4,
    paddingLeft: 4,
    fontFamily: 'Inter_500Medium',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.pagePad,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    fontFamily: 'Inter_600SemiBold',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.pagePad,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    fontSize: 14,
    color: '#1A1A2E',
    fontFamily: 'Inter_400Regular',
  },
  forgotInstruction: {
    fontSize: 13,
    color: '#505F76',
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingOverlayText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
    fontFamily: 'Inter_500Medium',
  },
});

