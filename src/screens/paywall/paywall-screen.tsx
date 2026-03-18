import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { BackArrowIcon, CheckIcon } from '@/components/icons/app-icons';
import { routes } from '@/navigation/routes';
import { loadEntitlement, useEntitlement } from '@/hooks/use-entitlement';
import { updateDeviceSubscription } from '@/services/api/device-api';
import { getDeviceId } from '@/services/storage-service';
import type { SubscriptionPlan } from '@/types/entitlement';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.paywall>;

type PlanConfig = {
  plan: SubscriptionPlan;
  title: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
};

const PLANS: PlanConfig[] = [
  {
    plan: 'base',
    title: 'Base',
    price: '$2,99',
    period: 'month',
    features: [
      'Up to 3 vehicles',
      'Track maintenance & mileage',
      'Service reminders',
      'Share vehicle history',
    ],
  },
  {
    plan: 'pro',
    title: 'Pro',
    price: '$9,99',
    period: 'month',
    badge: 'Best value',
    features: [
      'Unlimited vehicles',
      'All Base features included',
      'Export maintenance history (PDF)',
    ],
  },
];

function FeatureRow({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-3 py-1">
      <CheckIcon size={16} color="#34D399" />
      <Text
        className="flex-1 text-sm text-[#A3ACBF]"
        style={{ fontFamily: 'Poppins' }}
      >
        {label}
      </Text>
    </View>
  );
}

function PlanCard({
  config,
  selected,
  isCurrent,
  disabled,
  onSelect,
}: {
  config: PlanConfig;
  selected: boolean;
  isCurrent: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const borderColor = isCurrent
    ? '#34D399'
    : selected
      ? '#34D399'
      : '#141A2B';

  return (
    <Pressable
      onPress={onSelect}
      disabled={disabled}
      className="rounded-2xl border-2 bg-[#141A2B] p-5"
      style={({ pressed }) => ({
        borderColor,
        opacity: disabled ? 0.6 : pressed ? 0.9 : 1,
      })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="h-5 w-5 items-center justify-center rounded-full border-2"
            style={{
              borderColor: isCurrent || selected ? '#34D399' : '#2A3350',
            }}
          >
            {isCurrent || selected ? (
              <View className="h-2.5 w-2.5 rounded-full bg-[#34D399]" />
            ) : null}
          </View>
          <Text
            className="text-lg text-white"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            {config.title}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className="text-lg text-[#367DFF]"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            {config.price}
          </Text>
          <Text
            className="text-xs text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            {config.period}
          </Text>
        </View>
      </View>

      {(config.badge || isCurrent) ? (
        <View className="mt-0 ml-8">
          <Text
            className="text-xs"
            style={{
              fontFamily: 'Poppins-SemiBold',
              color: isCurrent ? '#34D399' : '#F2C50F',
            }}
          >
            {isCurrent ? 'Current plan' : config.badge}
          </Text>
        </View>
      ) : null}

      <View className="my-3 h-px bg-[#1F2740]" />

      <View>
        {config.features.map((f) => (
          <FeatureRow key={f} label={f} />
        ))}
      </View>
    </Pressable>
  );
}

function ProActiveContent({
  onRestore,
  restoring,
}: {
  onRestore: () => void;
  restoring: boolean;
}) {
  return (
    <View>
      <View className="rounded-2xl border-2 border-[#34D399] bg-[#141A2B] p-6">
        <Text
          className="text-center text-lg text-white"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          You're on Pro
        </Text>
        <Text
          className="mt-2 text-center text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          You have access to all features and unlimited vehicles.
        </Text>

        <View className="my-5 h-px bg-[#1F2740]" />

        {PLANS[1].features.map((f) => (
          <FeatureRow key={f} label={f} />
        ))}
      </View>

      <Pressable
        className="mt-4 items-center py-2"
        onPress={onRestore}
        disabled={restoring}
      >
        <Text
          className="text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          Restore purchases
        </Text>
      </Pressable>
    </View>
  );
}

export function PaywallScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { plan: currentPlan } = useEntitlement();

  const defaultSelection: SubscriptionPlan =
    currentPlan === 'base' ? 'pro' : 'base';
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlan>(defaultSelection);
  const [purchasing, setPurchasing] = useState(false);

  const isPro = currentPlan === 'pro';
  const isBase = currentPlan === 'base';

  function getCtaLabel(): string {
    if (purchasing) return 'Processing...';
    if (isBase) return 'Upgrade to Pro';
    return 'Upgrade Now';
  }

  async function handlePurchase() {
    setPurchasing(true);
    try {
      const deviceId = await getDeviceId();
      if (!deviceId) throw new Error('Device not found');

      await updateDeviceSubscription(deviceId, selectedPlan);
      await loadEntitlement();

      Alert.alert(
        'Upgrade successful',
        `You are now on the ${selectedPlan === 'pro' ? 'Pro' : 'Base'} plan.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (e) {
      Alert.alert(
        'Purchase failed',
        e instanceof Error ? e.message : 'Please try again later.',
      );
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setPurchasing(true);
    try {
      await loadEntitlement();
      Alert.alert('Purchases restored', 'Your entitlement has been refreshed.');
    } catch {
      Alert.alert('Restore failed', 'Please try again later.');
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <View className="flex-1 bg-[#0C111F]">
      <Pressable
        onPress={() => navigation.goBack()}
        className="absolute z-10 rounded-full bg-black/40 p-2"
        style={{ top: insets.top + 8, left: 16 }}
        hitSlop={8}
      >
        <BackArrowIcon size={24} />
      </Pressable>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
      >
        <View className="items-center">
          <Image
            source={require('../../icons/subscription-logo.png')}
            className="h-24 w-24"
            resizeMode="contain"
          />
        </View>

        <Text
          className="mt-6 text-center text-2xl text-white"
          style={{ fontFamily: 'Poppins-ExtraBold' }}
        >
          {isPro ? 'Your Plan' : 'Upgrade Your Garage'}
        </Text>
        <Text
          className="mt-2 text-center text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          {isPro
            ? 'Manage your subscription'
            : 'Track multiple vehicles and unlock all features'}
        </Text>

        {isPro ? (
          <View style={{ marginTop: 24 }}>
            <ProActiveContent
              onRestore={handleRestore}
              restoring={purchasing}
            />
          </View>
        ) : (
          <>
            <View style={{ gap: 16, marginTop: 24 }}>
              {PLANS.map((config) => (
                <PlanCard
                  key={config.plan}
                  config={config}
                  selected={selectedPlan === config.plan}
                  isCurrent={currentPlan === config.plan}
                  disabled={currentPlan === config.plan}
                  onSelect={() => setSelectedPlan(config.plan)}
                />
              ))}
            </View>

            <View className="mt-8">
              <PrimaryButton
                label={getCtaLabel()}
                onPress={handlePurchase}
                disabled={purchasing}
              />
            </View>

            <Pressable
              className="mt-4 items-center py-2"
              onPress={handleRestore}
              disabled={purchasing}
            >
              <Text
                className="text-sm text-[#A3ACBF]"
                style={{ fontFamily: 'Poppins' }}
              >
                Restore purchases
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
