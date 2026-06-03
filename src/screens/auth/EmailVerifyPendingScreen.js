import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { resendVerification } from '../../api/endpoints/auth';

export const EmailVerifyPendingScreen = ({ route, navigation }) => {
  const { email } = route.params || { email: 'your email address' };
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle countdown cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await resendVerification(email);
      setSuccessMsg('A new verification link has been sent to your inbox.');
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Could not resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Envelope Icon */}
        <View style={styles.iconCircle}>
          <MaterialIcons name="mail-outline" size={48} color={COLORS.accent.primary} />
        </View>

        {/* Heading */}
        <Text style={styles.title}>Check your inbox</Text>

        <Text style={styles.description}>
          We sent an email verification link to:{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <Text style={styles.instructions}>
          Please tap the link inside the email to verify your account and log in. If you don't see it, check your spam folder.
        </Text>

        {/* Error/Success Feedbacks */}
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

        {/* Resend Button with Cooldown */}
        <TouchableOpacity
          style={[styles.resendBtn, cooldown > 0 && styles.resendBtnDisabled]}
          onPress={handleResend}
          disabled={cooldown > 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.accent.primary} />
          ) : (
            <Text style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}>
              {cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend verification email'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Back to Login link */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('AuthScreen', { initialTab: 'login' })}
        >
          <Text style={styles.backText}>Back to Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.pagePad * 1.5,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accent.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#505F76',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#1A1A2E',
  },
  instructions: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  errorBox: {
    width: '100%',
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
  resendBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendBtnDisabled: {
    borderColor: '#E5E5E5',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  resendTextDisabled: {
    color: '#94A3B8',
  },
  backBtn: {
    paddingVertical: 12,
  },
  backText: {
    fontSize: 14,
    color: '#505F76',
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});

