import { ScrollView, Text, View } from 'react-native';

import { OutlineButton } from '@/components/buttons/outline-button';
import { ContentCard } from '@/components/cards/content-card';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';

export function ShareLinkScreen() {
  const sampleLink = 'https://carcarediary.com/sample-slug';

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ScreenTitleBlock title="Share Link" />

      <ContentCard className="items-center rounded-xl p-6">
        <View className="h-36 w-36 items-center justify-center rounded-xl border border-[#1F2740] bg-[#0C111F]">
          <Text className="text-xs text-[#A3ACBF]">QR Placeholder</Text>
        </View>
        <Text className="mt-4 text-center text-sm text-white">{sampleLink}</Text>
      </ContentCard>

      <View className="flex-row flex-wrap gap-2">
        <OutlineButton label="Create Link" />
        <OutlineButton label="Copy Link" />
        <OutlineButton label="Share Link" />
        <OutlineButton label="Stop Sharing" className="border-[#FFB020]" textClassName="text-[#FFB020]" />
      </View>
    </ScrollView>
  );
}
