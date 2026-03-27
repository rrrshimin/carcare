import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { CommonActions, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { useAuth } from '@/context/auth-context';
import { verifyEmailOtp, sendEmailOtp } from '@/services/auth-service';
import { routes } from '@/navigation/routes';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

type OtpRouteParams = RouteProp<{ params: { email: string } }, 'params'>;

export function OtpVerificationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<OtpRouteParams>();
  const insets = useSafeAreaInsets();
  const { refreshProfile, isAuthenticated, needsUsername } = useAuth();

  const email = route.params.email;

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (needsUsername) {
        navigation.replace(routes.username);
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: routes.appFlow,
                state: { routes: [{ name: routes.garage }] },
              },
            ],
          }),
        );
      }
    }
  }, [isAuthenticated, needsUsername, navigation]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = useCallback(async (otpCode: string) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);
    setError(null);

    try {
      await verifyEmailOtp(email, otpCode);
      await refreshProfile();
      navigation.replace(routes.username);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Verification failed.';
      if (msg.toLowerCase().includes('expired')) {
        setError('Code expired. Please request a new one.');
      } else {
        setError('Invalid code. Please try again.');
      }
      setCode('');
      inputRef.current?.focus();
    } finally {
      setVerifying(false);
      verifyingRef.current = false;
    }
  }, [email, refreshProfile, navigation]);

  function handleCodeChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(digits);
    if (error) setError(null);

    if (digits.length === OTP_LENGTH) {
      handleVerify(digits);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await sendEmailOtp(email);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCode('');
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Failed to resend code.';
      Alert.alert('Resend failed', msg);
    } finally {
      setResending(false);
    }
  }

  const headerShown = navigation.getParent?.() !== undefined;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0C111F]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: headerShown ? 24 : insets.top + 24,
            paddingHorizontal: 24,
            paddingBottom: 32,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenTitleBlock
            title="Verify your email"
            subtitle={`Enter the 6-digit code sent to ${email}`}
          />

          {/* ── Code input ─────────────────────────────────────────── */}
          <View className="mt-10 items-center">
            <TextInput
              ref={inputRef}
              className="w-full rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-4 text-center text-2xl tracking-[12px] text-white"
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              autoFocus
              selectionColor="#367DFF"
              editable={!verifying}
              placeholder="------"
              placeholderTextColor="#A3ACBF"
            />
          </View>

          {error ? (
            <Text className="mt-3 text-center text-[13px] text-red-400">
              {error}
            </Text>
          ) : null}

          {/* ── Verify button ──────────────────────────────────────── */}
          <View className="mt-6">
            <PrimaryButton
              label={verifying ? 'Verifying...' : 'Verify'}
              onPress={() => handleVerify(code)}
              disabled={verifying || code.length < OTP_LENGTH}
            />
          </View>

          {/* ── Resend ─────────────────────────────────────────────── */}
          <View className="mt-6 items-center">
            <Text className="text-sm text-[#A3ACBF]">
              Didn't receive a code?
            </Text>
            <Text
              onPress={handleResend}
              className={`mt-1 text-sm ${
                resendCooldown > 0 || resending
                  ? 'text-[#A3ACBF]'
                  : 'text-[#367DFF]'
              }`}
            >
              {resending
                ? 'Sending...'
                : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Resend code'}
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
