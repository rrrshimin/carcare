import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { OutlineButton } from '@/components/buttons/outline-button';
import {
  ChevronRightIcon,
  SupportIcon,
  PrivacyPolicyIcon,
} from '@/components/icons/app-icons';
import { useAuth } from '@/context/auth-context';
import { useEntitlement } from '@/hooks/use-entitlement';
import { signOut } from '@/services/auth-service';
import { getPlanDisplayName, getPlanCarLimit } from '@/services/entitlement-service';
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
  onSignOut,
}: {
  username: string;
  publicId: string | null;
  planLabel: string;
  planAction: string | null;
  onUpgrade: () => void;
  onSignOut: () => void;
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
          className="mt-1 text-xs text-[#6B7490]"
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

      <OutlineButton label="Sign out" onPress={onSignOut} />
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
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
      <ChevronRightIcon size={18} color="#A3ACBF" />
    </Pressable>
  );
}

export function AccountScreen({ navigation }: Props) {
  const { isAuthenticated, userProfile, needsUsername } = useAuth();
  const { plan } = useEntitlement();

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
          onSignOut={handleSignOut}
        />
      ) : (
        <GuestContent onSignIn={handleSignIn} />
      )}

      {/* Menu items (always visible) */}
      <View style={{ gap: 12, marginTop: 20 }}>
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
      </View>
    </ScrollView>
  );
}
