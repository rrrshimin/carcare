import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { OutlineButton } from '@/components/buttons/outline-button';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { useAuth } from '@/context/auth-context';
import { signInWithApple, signInWithGoogle } from '@/services/auth-service';
import { routes } from '@/navigation/routes';

export function AuthScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { refreshProfile, isAuthenticated, needsUsername } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (needsUsername) {
        navigation.replace(routes.username);
      } else {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: routes.appFlow }] }),
        );
      }
    }
  }, [isAuthenticated, needsUsername, navigation]);

  async function handleApple() {
    setLoading(true);
    try {
      await signInWithApple();
      await refreshProfile();
      navigation.replace(routes.username);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Apple sign-in failed.';
      Alert.alert('Sign in error', msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const session = await signInWithGoogle();
      if (session) {
        await refreshProfile();
        navigation.replace(routes.username);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed.';
      Alert.alert('Sign in error', msg);
    } finally {
      setLoading(false);
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
            title="Create your account"
            subtitle="An account lets you manage multiple cars, access subscriptions, and keep your data safe."
          />

          <View className="mt-10 gap-4">
            {Platform.OS === 'ios' && (
              <PrimaryButton
                label="Continue with Apple"
                onPress={handleApple}
                disabled={loading}
              />
            )}
            <OutlineButton
              label="Continue with Google"
              onPress={handleGoogle}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
