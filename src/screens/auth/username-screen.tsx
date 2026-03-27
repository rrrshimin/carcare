import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { useAuth } from '@/context/auth-context';
import { createProfile } from '@/services/api/user-profile-api';
import { loadEntitlement } from '@/hooks/use-entitlement';
import { routes } from '@/navigation/routes';

const VALID_USERNAME = /^[a-zA-Z0-9\-,.\s]+$/;

export function UsernameScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { session, userProfile, refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks whether handleSave is actively routing. When true the
  // safety-net effect must not compete with the explicit navigation.
  const handledRef = useRef(false);

  // Safety net: if the user already has a profile when this screen
  // mounts (e.g. deep-link race or back-navigation), redirect to app.
  // Skipped while handleSave is in control of the navigation.
  useEffect(() => {
    if (userProfile && !handledRef.current) {
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: routes.appFlow }] }),
      );
    }
  }, [userProfile, navigation]);

  function validateUsername(): string | null {
    const trimmed = username.trim();
    if (!trimmed) return 'Username is required.';
    if (trimmed.length < 2) return 'Username must be at least 2 characters.';
    if (!VALID_USERNAME.test(trimmed)) {
      return 'Only letters, numbers, hyphens, commas, and periods are allowed.';
    }
    return null;
  }

  async function handleSave() {
    const validationError = validateUsername();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Error', 'No authenticated session found.');
      return;
    }

    setError(null);
    setSaving(true);
    handledRef.current = true;
    try {
      await createProfile(session.user.id, username.trim());

      // Ensure entitlement is fresh before deciding the route
      const plan = await loadEntitlement();
      await refreshProfile();

      if (plan === 'pro') {
        navigation.navigate(routes.businessDetails);
      } else {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: routes.appFlow }] }),
        );
      }
    } catch (e) {
      handledRef.current = false;
      const msg = e instanceof Error ? e.message : 'Failed to save username.';
      setError(msg);
    } finally {
      setSaving(false);
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
            title="Choose a username"
            subtitle="This will be your public display name in CarCare Diary."
          />

          <View className="mt-8">
            <LabeledTextInput
              label="Username"
              placeholder="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (error) setError(null);
              }}
              maxLength={50}
              autoCapitalize="none"
              autoCorrect={false}
              error={error}
            />
          </View>

          <View className="mt-6">
            <PrimaryButton
              label="Continue"
              onPress={handleSave}
              disabled={saving || username.trim().length < 2}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
