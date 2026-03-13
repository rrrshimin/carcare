import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { OutlineButton } from '@/components/buttons/outline-button';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { ContentCard } from '@/components/cards/content-card';
import { useShareLink } from '@/hooks/use-share-link';

// ── Share Link Screen ────────────────────────────────────────────────
// Two visual states: (1) no link yet → create state, (2) active link → QR + actions.
// Error banner: amber border/text on dark tinted background.
// QR code: 160×160, white background, dark foreground. Wrapped in white padded container.
export function ShareLinkScreen() {
  const {
    slug,
    shareUrl,
    loading,
    actionLoading,
    error,
    handleCreateLink,
    handleStopSharing,
    handleCopyLink,
    handleNativeShare,
  } = useShareLink();

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0C111F]">
        <ActivityIndicator size="large" color="#0051E8" />
      </View>
    );
  }

  // ── Active share state ───────────────────────────────────────────
  const isSharing = !!slug && !!shareUrl;

  // ScrollView: 16px padding, 16px gap between sections.
  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Contextual description: changes based on sharing state */}
      <Text className="text-sm leading-5 text-[#A3ACBF]">
        {isSharing
          ? 'Anyone with this link can view your vehicle maintenance history.'
          : 'Create a public link so others can see your maintenance history.'}
      </Text>

      {/* Error banner: amber border, dark warm background #1A1510, amber text */}
      {error ? (
        <View className="rounded-xl border border-[#FFB020] bg-[#1A1510] px-4 py-3">
          <Text className="text-sm text-[#FFB020]">{error}</Text>
        </View>
      ) : null}

      {isSharing ? (
        <>
          {/* ── Active share: QR card ───────────────────────────────────── */}
          {/* QR container: extra padding (p-6). White inner wrapper for contrast. */}
          <ContentCard className="items-center rounded-xl p-6">
            <View className="rounded-xl bg-white p-3">
              {/* QR code: 160×160, white bg, dark foreground matching app background */}
              <QRCode value={shareUrl} size={160} backgroundColor="#FFFFFF" color="#0C111F" />
            </View>

            {/* Selectable share URL: link blue, 14px */}
            <Text
              className="mt-4 text-center text-sm text-[#367DFF]"
              selectable
            >
              {shareUrl}
            </Text>
          </ContentCard>

          {/* Action buttons: Copy/Share side by side, Stop Sharing full width with amber styling */}
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <OutlineButton className="items-center justify-center" label="Copy Link" onPress={handleCopyLink} />
              </View>
              <View className="flex-1">
                <OutlineButton className="items-center justify-center" label="Share" onPress={handleNativeShare} />
              </View>
            </View>

            {/* "Stop Sharing" uses amber border/text override via className/textClassName */}
            <OutlineButton
              label="Stop Sharing"
              onPress={handleStopSharing}
              className="border-[#FFB020] items-center justify-center"
              textClassName="text-[#FFB020]"
            />
          </View>
        </>
      ) : (
        // ── Create link state: placeholder + CTA ─────────────────────
        <ContentCard className="items-center rounded-xl p-6">
          {/* Dashed placeholder box: 144×144, dark fill, border color dashed */}
          <View className="mb-4 h-36 w-36 items-center justify-center rounded-xl border border-dashed border-[#1F2740] bg-[#0C111F]">
            <Text className="text-2xl">🔗</Text>
            <Text className="mt-1 text-xs text-[#A3ACBF]">No link yet</Text>
          </View>

          <Text className="mb-5 text-center text-sm leading-5 text-[#A3ACBF]">
            Generate a public link to share your vehicle's maintenance history
            with potential buyers or anyone else.
          </Text>

          <PrimaryButton
            label={actionLoading ? 'Creating…' : 'Create Link'}
            onPress={handleCreateLink}
            disabled={actionLoading}
            className="w-full"
          />
        </ContentCard>
      )}

      {/* Inline loading overlay for actions on active state */}
      {actionLoading && isSharing ? (
        <View className="items-center py-2">
          <ActivityIndicator size="small" color="#0051E8" />
        </View>
      ) : null}
    </ScrollView>
  );
}
