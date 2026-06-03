import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { resetPassword as apiResetPassword } from '../../api/endpoints/auth';

export const ResetPasswordScreen = ({ route, navigation }) => {
  const token = route.params?.token || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password validations
  const isPasswordLengthValid = password.length >= 8;
  const isPasswordComplexValid = /\d/.test(password);
  const isPasswordValid = isPasswordLengthValid && isPasswordComplexValid;
  const doesPasswordMatch = confirmPassword === password;

  const isResetEnabled = isPasswordValid && doesPasswordMatch && token.length > 0 && !loading;

  // Password Strength Check
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

  const handleResetPassword = async () => {
    if (!isResetEnabled) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await apiResetPassword(token, password);
      setSuccessMsg('Your password has been successfully updated.');
      setTimeout(() => {
        navigation.navigate('AuthScreen', { initialTab: 'login' });
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="lock-open" size={36} color={COLORS.accent.primary} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
              Enter your new secure password below to regain access to your account.
            </Text>
          </View>

          {/* Feedback boxes */}
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

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
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
              <Text style={styles.label}>Confirm New Password</Text>
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
              style={[styles.primaryCTA, !isResetEnabled && styles.primaryCTADisabled]}
              onPress={handleResetPassword}
              disabled={!isResetEnabled}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryCTAText}>Reset password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 10,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#505F76',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 20,
  },
  errorBox: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDAD6',
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
    backgroundColor: '#EDE9FE',
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
    color: '#505F76',
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
    borderColor: '#CCC3D8',
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
  primaryCTA: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.accent.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
});

