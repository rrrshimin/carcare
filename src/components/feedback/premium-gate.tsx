import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { CrownIcon } from '@/components/icons/app-icons';

type PremiumGateProps = {
  title?: string;
  body?: string;
  ctaLabel?: string;
  onUpgrade: () => void;
};

/**
 * Full-area premium upsell overlay.
 * Renders on top of blurred/placeholder content.
 * Uses the existing CrownIcon and PrimaryButton.
 */
export function PremiumGate({
  title = 'See where your car money goes',
  body = 'Unlock monthly spending, category breakdowns, and maintenance trends.',
  ctaLabel = 'Upgrade',
  onUpgrade,
}: PremiumGateProps) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#1A2240]">
        <CrownIcon size={32} color="#FFCE1E" />
      </View>

      <Text
        className="text-center text-xl text-white"
        style={{ fontFamily: 'Poppins-Bold' }}
      >
        {title}
      </Text>

      <Text
        className="mt-3 text-center text-sm text-[#A3ACBF]"
        style={{ fontFamily: 'Poppins' }}
      >
        {body}
      </Text>

      <View className="mt-6 w-full">
        <PrimaryButton label={ctaLabel} onPress={onUpgrade} />
      </View>
    </View>
  );
}
