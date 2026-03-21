import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GoogleLogoIcon, AppleLogoIcon } from '@/components/icons/app-icons';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { useAuth } from '@/context/auth-context';
import { signInWithGoogle } from '@/services/auth-service';
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
            <Pressable
              onPress={handleGoogle}
              disabled={loading}
              className="min-h-[52px] flex-row items-center justify-center gap-3 rounded-xl bg-white px-4 py-3"
              style={({ pressed }) => ({
                opacity: loading ? 0.6 : pressed ? 0.85 : 1,
              })}
            >
              <GoogleLogoIcon size={20} />
              <Text
                className="text-sm text-[#1F1F1F]"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Continue with Google
              </Text>
            </Pressable>

            <Pressable
              disabled
              className="min-h-[52px] flex-row items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 opacity-40"
            >
              <AppleLogoIcon size={20} color="#000000" />
              <Text
                className="text-sm text-[#1F1F1F]"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Continue with Apple
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
