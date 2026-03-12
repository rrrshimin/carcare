import { useCallback, useState } from 'react';
import { Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';

import type { VehicleRow } from '@/services/api/vehicle-api';
import { getCurrentVehicle } from '@/services/vehicle-service';
import { enableSharing, disableSharing } from '@/services/share-service';
import { buildShareUrl } from '@/utils/sharing';

type ShareLinkState = {
  vehicle: VehicleRow | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
};

export function useShareLink() {
  const [state, setState] = useState<ShareLinkState>({
    vehicle: null,
    loading: true,
    actionLoading: false,
    error: null,
  });

  const slug = state.vehicle?.shared_link ?? null;
  const shareUrl = slug ? buildShareUrl(slug) : null;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setState((s) => ({ ...s, loading: true, error: null }));

      getCurrentVehicle()
        .then((v) => {
          if (!cancelled) setState((s) => ({ ...s, vehicle: v, loading: false }));
        })
        .catch((e) => {
          if (!cancelled)
            setState((s) => ({
              ...s,
              vehicle: null,
              loading: false,
              error: e instanceof Error ? e.message : 'Failed to load vehicle.',
            }));
        });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  async function handleCreateLink() {
    if (!state.vehicle) {
      setState((s) => ({
        ...s,
        error: 'No vehicle found. Please add a vehicle first.',
      }));
      return;
    }
    setState((s) => ({ ...s, actionLoading: true, error: null }));
    try {
      const updated = await enableSharing(state.vehicle.id);
      setState((s) => ({ ...s, vehicle: updated, actionLoading: false }));
    } catch (e) {
      setState((s) => ({
        ...s,
        actionLoading: false,
        error: e instanceof Error ? e.message : 'Failed to create share link.',
      }));
    }
  }

  async function handleStopSharing() {
    if (!state.vehicle) return;

    Alert.alert('Stop Sharing', 'The public link will stop working. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop',
        style: 'destructive',
        onPress: async () => {
          setState((s) => ({ ...s, actionLoading: true, error: null }));
          try {
            const updated = await disableSharing(state.vehicle!.id);
            setState((s) => ({ ...s, vehicle: updated, actionLoading: false }));
          } catch (e) {
            setState((s) => ({
              ...s,
              actionLoading: false,
              error: e instanceof Error ? e.message : 'Failed to stop sharing.',
            }));
          }
        },
      },
    ]);
  }

  async function handleCopyLink() {
    if (!shareUrl) return;
    try {
      await Clipboard.setStringAsync(shareUrl);
      Alert.alert('Copied', 'Link copied to clipboard.');
    } catch {
      Alert.alert('Copy Failed', 'Unable to copy link to clipboard.');
    }
  }

  async function handleNativeShare() {
    if (!shareUrl) return;
    try {
      await Share.share({ message: shareUrl });
    } catch {
      // user cancelled share sheet — no action needed
    }
  }

  return {
    vehicle: state.vehicle,
    slug,
    shareUrl,
    loading: state.loading,
    actionLoading: state.actionLoading,
    error: state.error,
    handleCreateLink,
    handleStopSharing,
    handleCopyLink,
    handleNativeShare,
  };
}
