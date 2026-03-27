import { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { OutlineButton } from '@/components/buttons/outline-button';
import {
  BellIcon,
  BuildingIcon,
  ChevronRightIcon,
  DollarIcon,
  SubscriptionStarIcon,
  SupportIcon,
  PrivacyPolicyIcon,
} from '@/components/icons/app-icons';
import { useAuth } from '@/context/auth-context';
import { useEntitlement } from '@/hooks/use-entitlement';
import { useCurrency } from '@/hooks/use-currency';
import { deleteAccount } from '@/features/account/delete-account';
import { signOut } from '@/services/auth-service';
import { getPlanDisplayName, getPlanCarLimit } from '@/services/entitlement-service';
import { CURRENCIES } from '@/services/currency-service';
import { routes } from '@/navigation/routes';
import type { AppStackParamList } from '@/types/navigation';
import type { ReactNode } from 'react';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.account>;

const SUPPORT_URL = 'https://carcarediaryapp.com/support';
const PRIVACY_URL = 'https://carcarediaryapp.com/privacy';

function GuestContent({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View className="rounded-2xl bg-[#141A2B] p-5">
      <Text
        className="text-lg text-white"
        style={{ fontFamily: 'Poppins-Bold' }}
      >
        Sign in to unlock more
      </Text>
      <Text
        className="mt-2 text-sm text-[#A3ACBF]"
        style={{ fontFamily: 'Poppins' }}
      >
        Create an account to manage multiple cars, access subscriptions, and
        keep your data safe across devices.
      </Text>
      <View className="mt-4">
        <PrimaryButton label="Sign in / Create account" onPress={onSignIn} />
      </View>
    </View>
  );
}

function RegisteredContent({
  username,
  publicId,
  planLabel,
  planAction,
  onUpgrade,
}: {
  username: string;
  publicId: string | null;
  planLabel: string;
  planAction: string | null;
  onUpgrade: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopyId() {
    if (!publicId) return;
    await Clipboard.setStringAsync(publicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View className="gap-4">
      <View className="rounded-2xl bg-[#141A2B] p-5">
        <Text
          className="text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          Username
        </Text>
        <Text
          className="mt-1 text-lg text-white"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          {username}
        </Text>
      </View>

      <View className="rounded-2xl bg-[#141A2B] p-5">
        <Text
          className="text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          Your CarCare ID
        </Text>
        <Text
          className="mt-1 text-[13px] text-[#6B7490]"
          style={{ fontFamily: 'Poppins' }}
          numberOfLines={1}
        >
          Share this ID with others so they can transfer vehicles to you.
        </Text>
        <View className="mt-3 flex-row items-center gap-3">
          <View className="flex-1 rounded-xl bg-[#0C111F] px-3 py-2.5">
            <Text
              className="text-sm text-white"
              style={{ fontFamily: 'Poppins-SemiBold' }}
              selectable
              numberOfLines={1}
            >
              {publicId ?? '—'}
            </Text>
          </View>
          <Pressable
            onPress={handleCopyId}
            disabled={!publicId}
            className="rounded-xl bg-[#1A2240] px-4 py-2.5"
            style={({ pressed }) => ({ opacity: !publicId ? 0.4 : pressed ? 0.7 : 1 })}
          >
            <Text
              className="text-sm text-[#367DFF]"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </Pressable>
        </View>
      </View>

      {planAction ? (
        <Pressable
          className="rounded-2xl bg-[#141A2B] p-5"
          onPress={onUpgrade}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <Text
            className="text-sm text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            Plan
          </Text>
          <View className="mt-1 flex-row items-center justify-between">
            <Text
              className="text-lg text-white"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {planLabel}
            </Text>
            <Text
              className="text-sm text-[#367DFF]"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {planAction}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View className="rounded-2xl bg-[#141A2B] p-5">
          <Text
            className="text-sm text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            Plan
          </Text>
          <Text
            className="mt-1 text-lg text-white"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            {planLabel}
          </Text>
        </View>
      )}
    </View>
  );
}

function UpgradeToProCard({ onPress }: { onPress: () => void }) {
  return (
    <View className="rounded-2xl bg-[#141A2B] p-5">
      <View className="flex-row items-center gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#1A2240]">
          <SubscriptionStarIcon size={24} />
        </View>
        <View className="flex-1">
          <Text
            className="text-base text-white"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            Expand Your Garage
          </Text>
          <Text
            className="mt-1 text-[13px] text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
            numberOfLines={2}
          >
            Need more than 3 cars? Upgrade to Pro for unlimited vehicles and all features.
          </Text>
        </View>
      </View>
      <View className="mt-4">
        <PrimaryButton label="View Plans" onPress={onPress} />
      </View>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  rightLabel,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  rightLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-2xl bg-[#141A2B] px-5 py-4"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View className="mr-4">{icon}</View>
      <Text
        className="flex-1 text-sm text-white"
        style={{ fontFamily: 'Poppins' }}
      >
        {label}
      </Text>
      {rightLabel ? (
        <Text
          className="mr-2 text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          {rightLabel}
        </Text>
      ) : null}
      <ChevronRightIcon size={18} color="#A3ACBF" />
    </Pressable>
  );
}

function CurrencyPickerModal({
  visible,
  currentCode,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentCode: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? CURRENCIES.filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed) ||
          c.code.toLowerCase().includes(trimmed) ||
          c.symbol.toLowerCase().includes(trimmed),
      )
    : CURRENCIES;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View className="rounded-t-3xl bg-[#0C111F] pb-8" style={{ maxHeight: '72%' }}>
        <View className="px-5 pb-3 pt-5">
          <Text
            className="text-base text-white"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            Choose Currency
          </Text>
          <Text
            className="mt-1 text-sm text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            This affects how cost fields are displayed on this device.
          </Text>

          {/* Search input */}
          <View className="mt-3 flex-row items-center rounded-xl border border-[#1F2740] bg-[#141A2B] px-3">
            <Text className="mr-2 text-base text-[#6B7490]">🔍</Text>
            <TextInput
              className="flex-1 py-2.5 text-sm text-white"
              placeholder="Search currency..."
              placeholderTextColor="#6B7490"
              value={query}
              onChangeText={setQuery}
              selectionColor="#367DFF"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Text className="text-sm text-[#6B7490]">✕</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {filtered.length === 0 ? (
          <View className="px-5 py-6 items-center">
            <Text
              className="text-sm text-[#6B7490]"
              style={{ fontFamily: 'Poppins' }}
            >
              No currencies match "{query}"
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
            renderItem={({ item }) => {
              const isSelected = item.code === currentCode;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.code);
                    onClose();
                  }}
                  className="flex-row items-center rounded-xl px-4 py-3"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    backgroundColor: isSelected ? '#1A2240' : 'transparent',
                    marginBottom: 2,
                  })}
                >
                  <Text
                    className="w-10 text-base text-white"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    {item.symbol}
                  </Text>
                  <Text
                    className="flex-1 text-sm text-white"
                    style={{ fontFamily: 'Poppins' }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className="text-sm text-[#A3ACBF]"
                    style={{ fontFamily: 'Poppins' }}
                  >
                    {item.code}
                  </Text>
                  {isSelected ? (
                    <View className="ml-3 h-2 w-2 rounded-full bg-[#367DFF]" />
                  ) : (
                    <View className="ml-3 h-2 w-2" />
                  )}
                </Pressable>
              );
            }}
          />
        )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});

export function AccountScreen({ navigation }: Props) {
  const { isAuthenticated, userProfile, needsUsername } = useAuth();
  const { plan } = useEntitlement();
  const { currencyCode, currencySymbol, updateCurrency } = useCurrency();
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const limit = getPlanCarLimit(plan);
  const planLabel =
    limit === Infinity
      ? `${getPlanDisplayName(plan)} \u2014 Unlimited cars`
      : `${getPlanDisplayName(plan)} \u2014 ${limit} ${limit === 1 ? 'car' : 'cars'}`;

  const planAction = plan === 'pro' ? null : plan === 'base' ? 'Upgrade' : 'Manage';

  useEffect(() => {
    if (isAuthenticated && needsUsername) {
      navigation.replace(routes.username);
    }
  }, [isAuthenticated, needsUsername, navigation]);

  function handleSignIn() {
    navigation.navigate(routes.auth);
  }

  function handleUpgrade() {
    navigation.navigate(routes.paywall);
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: routes.setupFlow }],
              }),
            );
          } catch {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete your account?',
      'This will permanently delete your account and associated data from CarCare Diary.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'This action cannot be undone',
              'Your vehicles, logs, reminders, analytics, and account data will be permanently removed.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete my account',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeleting(true);
                    try {
                      await deleteAccount();
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: routes.setupFlow }],
                        }),
                      );
                    } catch {
                      setIsDeleting(false);
                      Alert.alert(
                        'Deletion failed',
                        'Something went wrong while deleting your account. Please try again.',
                      );
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }

  if (isAuthenticated && needsUsername) {
    return null;
  }

  return (
    <ScrollView
      className="flex-1 bg-[#0C111F]"
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
    >
      {/* Auth-specific content */}
      {isAuthenticated && userProfile ? (
        <RegisteredContent
          username={userProfile.username}
          publicId={userProfile.public_id}
          planLabel={planLabel}
          planAction={planAction}
          onUpgrade={handleUpgrade}
        />
      ) : (
        <View className="gap-4">
          <GuestContent onSignIn={handleSignIn} />

          {/* Plan card — visible even when not signed in */}
          {planAction ? (
            <Pressable
              className="rounded-2xl bg-[#141A2B] p-5"
              onPress={handleUpgrade}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Text
                className="text-sm text-[#A3ACBF]"
                style={{ fontFamily: 'Poppins' }}
              >
                Plan
              </Text>
              <View className="mt-1 flex-row items-center justify-between">
                <Text
                  className="text-lg text-white"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {planLabel}
                </Text>
                <Text
                  className="text-sm text-[#367DFF]"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {planAction}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View className="rounded-2xl bg-[#141A2B] p-5">
              <Text
                className="text-sm text-[#A3ACBF]"
                style={{ fontFamily: 'Poppins' }}
              >
                Plan
              </Text>
              <Text
                className="mt-1 text-lg text-white"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                {planLabel}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Upgrade prompt for non-Pro users */}
      {plan !== 'pro' ? (
        <View className="mt-4">
          <UpgradeToProCard onPress={handleUpgrade} />
        </View>
      ) : null}

      {/* Menu items (always visible) */}
      <View style={{ gap: 12, marginTop: 20 }}>
        <MenuRow
          icon={<BellIcon size={20} color="rgba(255,255,255,0.2)" />}
          label="Reminders"
          onPress={() => navigation.navigate(routes.reminderSettings)}
        />
        {isAuthenticated ? (
          <MenuRow
            icon={<BuildingIcon size={20} color="rgba(255,255,255,0.2)" />}
            label="Company Settings"
            onPress={() => navigation.navigate(routes.companySettings)}
          />
        ) : null}
        <MenuRow
          icon={<DollarIcon size={20} color="rgba(255,255,255,0.2)" />}
          label="Currency"
          rightLabel={currencyCode}
          onPress={() => setCurrencyPickerVisible(true)}
        />
        <MenuRow
          icon={<SupportIcon size={20} color="rgba(255,255,255,0.2)" />}
          label="Support"
          onPress={() => Linking.openURL(SUPPORT_URL).catch(() => {})}
        />
        <MenuRow
          icon={<PrivacyPolicyIcon size={20} color="rgba(255,255,255,0.2)" />}
          label="Privacy Policy"
          onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})}
        />
        {isAuthenticated ? (
          <View className="mt-2 gap-3">
            <OutlineButton label="Sign out" onPress={handleSignOut} disabled={isDeleting} />
            <Pressable
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              className={`min-h-12 justify-center rounded-xl border border-[#1F2740] bg-[#141A2B] px-4 py-3 ${isDeleting ? 'opacity-60' : 'opacity-100'}`}
              style={({ pressed }) => ({ opacity: pressed && !isDeleting ? 0.85 : undefined })}
            >
              <Text
                className="text-sm text-[#FF4444]"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                {isDeleting ? 'Deleting account...' : 'Delete Account'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <CurrencyPickerModal
        visible={currencyPickerVisible}
        currentCode={currencyCode}
        onSelect={updateCurrency}
        onClose={() => setCurrencyPickerVisible(false)}
      />
    </ScrollView>
  );
}
