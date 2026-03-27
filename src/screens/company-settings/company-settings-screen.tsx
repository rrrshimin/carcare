import { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { useAuth } from '@/context/auth-context';
import {
  getCompanyProfile,
  upsertCompanyProfile,
} from '@/services/api/company-profile-api';
import { routes } from '@/navigation/routes';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.companySettings>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CompanySettingsScreen({ navigation }: Props) {
  const { session } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const authUserId = session?.user?.id;
      if (!authUserId) {
        setLoading(false);
        return;
      }

      getCompanyProfile(authUserId)
        .then((profile) => {
          if (cancelled) return;
          if (profile) {
            setCompanyName(profile.company_name);
            setBillingEmail(profile.billing_email);
            setBusinessAddress(profile.business_address ?? '');
            setHasExisting(true);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => { cancelled = true; };
    }, [session?.user?.id]),
  );

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

  async function handleSave() {
    if (!validate()) return;
    const authUserId = session?.user?.id;
    if (!authUserId) {
      Alert.alert('Error', 'You must be signed in to save company details.');
      return;
    }

    setSaving(true);
    try {
      await upsertCompanyProfile(authUserId, {
        company_name: companyName.trim(),
        billing_email: billingEmail.trim(),
        business_address: businessAddress.trim() || null,
      });
      setHasExisting(true);
      Alert.alert('Saved', 'Your company details have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        'Save failed',
        e instanceof Error ? e.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0C111F]">
        <Text
          className="text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0C111F]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 48,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className="text-sm text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            {hasExisting
              ? 'Update your company information used for invoices and PDF exports.'
              : 'Add your company details for invoices and PDF exports. This is optional.'}
          </Text>

          <View style={{ gap: 16, marginTop: 24 }}>
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
              label={saving ? 'Saving...' : hasExisting ? 'Update' : 'Save'}
              onPress={handleSave}
              disabled={saving}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
