import { useState } from 'react';
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
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { useAuth } from '@/context/auth-context';
import { upsertCompanyProfile } from '@/services/api/company-profile-api';
import { routes } from '@/navigation/routes';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BusinessDetailsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  function validate(): boolean {
    const next: Record<string, string | null> = {};
    if (!companyName.trim()) next.companyName = 'Company name is required.';
    if (!billingEmail.trim()) {
      next.billingEmail = 'Billing email is required.';
    } else if (!EMAIL_REGEX.test(billingEmail.trim())) {
      next.billingEmail = 'Enter a valid email address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goToApp() {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: routes.appFlow }] }),
    );
  }

  async function handleSave() {
    if (!validate()) return;
    if (!session?.user?.id) {
      Alert.alert('Error', 'No authenticated session found.');
      return;
    }

    setSaving(true);
    try {
      await upsertCompanyProfile(session.user.id, {
        company_name: companyName.trim(),
        billing_email: billingEmail.trim(),
        business_address: businessAddress.trim() || null,
      });
      goToApp();
    } catch (e) {
      Alert.alert(
        'Save failed',
        e instanceof Error ? e.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleSkip() {
    goToApp();
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
            title="Business Details"
            subtitle={
              'Add your company info for invoices and PDF exports.\n' +
              'This is optional — you can always complete it later in Account.'
            }
          />

          <View style={{ gap: 16, marginTop: 32 }}>
            <LabeledTextInput
              label="Company Name"
              placeholder="Acme Auto Services"
              value={companyName}
              onChangeText={(t) => {
                setCompanyName(t);
                if (errors.companyName) setErrors((p) => ({ ...p, companyName: null }));
              }}
              maxLength={120}
              autoCapitalize="words"
              error={errors.companyName}
            />

            <LabeledTextInput
              label="Billing Email"
              placeholder="billing@example.com"
              value={billingEmail}
              onChangeText={(t) => {
                setBillingEmail(t);
                if (errors.billingEmail) setErrors((p) => ({ ...p, billingEmail: null }));
              }}
              maxLength={200}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.billingEmail}
            />

            <LabeledTextInput
              label="Business Address"
              placeholder="123 Main St, City, Country"
              value={businessAddress}
              onChangeText={setBusinessAddress}
              maxLength={300}
              autoCapitalize="sentences"
            />
          </View>

          <View className="mt-8">
            <PrimaryButton
              label={saving ? 'Saving...' : 'Save'}
              onPress={handleSave}
              disabled={saving}
            />
          </View>

          <Pressable
            onPress={handleSkip}
            className="mt-4 items-center py-3"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text
              className="text-sm text-[#6B7490]"
              style={{ fontFamily: 'Poppins' }}
            >
              Skip for now
            </Text>
          </Pressable>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
