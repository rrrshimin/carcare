import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

import { OutlineButton } from '@/components/buttons/outline-button';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { ContentCard } from '@/components/cards/content-card';
import { CrownIcon } from '@/components/icons/app-icons';
import { useEntitlement } from '@/hooks/use-entitlement';
import { useShareLink } from '@/hooks/use-share-link';
import { routes } from '@/navigation/routes';
import type { AppStackParamList } from '@/types/navigation';

// ── Share Link Screen ────────────────────────────────────────────────
// Two visual states: (1) no link yet → create state, (2) active link → QR + actions.
// Error banner: amber border/text on dark tinted background.
// QR code: 160×160, white background, dark foreground. Wrapped in white padded container.
export function ShareLinkScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { plan } = useEntitlement();
  const canDownloadQR = plan === 'base' || plan === 'pro';

  const qrContainerRef = useRef<View>(null);
  const [exporting, setExporting] = useState(false);

  const {
    vehicle,
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

  const vehicleLabel = vehicle
    ? `${vehicle.name}${vehicle.year ? ` ${vehicle.year}` : ''}`
    : '';

  async function handleDownloadQR() {
    if (!qrContainerRef.current) return;
    setExporting(true);
    try {
      const uri = await captureRef(qrContainerRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch {
      Alert.alert('Export failed', 'Could not export the QR code. Please try again.');
    } finally {
      setExporting(false);
    }
  }

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
    <View className="flex-1 bg-[#0C111F]">
      {/* Hidden export-only QR with text — positioned off-screen */}
      {isSharing && shareUrl ? (
        <View style={{ position: 'absolute', left: -9999 }} collapsable={false}>
          <View ref={qrContainerRef} className="items-center bg-white px-6 pb-5 pt-5" collapsable={false}>
            <QRCode value={shareUrl} size={160} backgroundColor="#FFFFFF" color="#0C111F" quietZone={8} />
            <Text style={{ fontFamily: 'Poppins', fontSize: 11, color: '#6B7490', marginTop: 12, textAlign: 'center' }}>
              Scan to view service history
            </Text>
            {vehicleLabel ? (
              <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#1A1A1A', marginTop: 2, textAlign: 'center' }}>
                {vehicleLabel}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }}>
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
            <View className="rounded-xl bg-white p-4">
              <QRCode value={shareUrl} size={160} backgroundColor="#FFFFFF" color="#0C111F" />
            </View>

            {/* Tappable share URL: opens in browser */}
            <Pressable className="mt-4" onPress={() => Linking.openURL(shareUrl)}>
              <Text
                className="text-center text-sm text-[#367DFF] underline"
                selectable
              >
                {shareUrl}
              </Text>
            </Pressable>
          </ContentCard>

          {/* Action buttons */}
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <OutlineButton className="items-center justify-center" label="Copy Link" onPress={handleCopyLink} />
              </View>
              <View className="flex-1">
                <OutlineButton className="items-center justify-center" label="Share" onPress={handleNativeShare} />
              </View>
            </View>

            <OutlineButton
              label={exporting ? 'Exporting…' : 'Download QR code'}
              onPress={canDownloadQR ? handleDownloadQR : () => navigation.navigate(routes.paywall)}
              disabled={exporting}
              className="items-center justify-center"
              icon={!canDownloadQR ? <CrownIcon size={16} /> : undefined}
            />

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
            <Text className="mt-1 text-[13px] text-[#A3ACBF]">No link yet</Text>
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
    </View>
  );
}
