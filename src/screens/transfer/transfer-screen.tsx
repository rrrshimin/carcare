import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { useAuth } from '@/context/auth-context';
import { routes } from '@/navigation/routes';
import { lookupRecipient, sendTransferRequest } from '@/services/transfer-service';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.transfer>;

type LookupState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'found'; username: string; publicId: string }
  | { phase: 'error'; message: string };

const PUBLIC_ID_REGEX = /^CC-\d{6}$/;

function formatPublicIdInput(raw: string): string {
  const upper = raw.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (upper.startsWith('CC-')) return upper.slice(0, 9);
  if (upper.startsWith('CC') && upper.length >= 2 && !upper.startsWith('CC-'))
    return 'CC-' + upper.slice(2, 8);
  return upper.slice(0, 9);
}

export function TransferScreen({ route, navigation }: Props) {
  const { vehicleId } = route.params;
  const { session, userProfile } = useAuth();
  const [recipientId, setRecipientId] = useState('');
  const [lookup, setLookup] = useState<LookupState>({ phase: 'idle' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isValidFormat = PUBLIC_ID_REGEX.test(recipientId.trim());

  async function handleLookup() {
    const trimmed = recipientId.trim();
    if (!trimmed || !PUBLIC_ID_REGEX.test(trimmed)) return;

    if (userProfile?.public_id && trimmed === userProfile.public_id) {
      setLookup({ phase: 'error', message: 'You cannot transfer a vehicle to yourself.' });
      return;
    }

    setLookup({ phase: 'loading' });
    try {
      const result = await lookupRecipient(trimmed);
      if (result.profileAuthId === session?.user?.id) {
        setLookup({ phase: 'error', message: 'You cannot transfer a vehicle to yourself.' });
        return;
      }
      setLookup({ phase: 'found', username: result.username, publicId: trimmed });
    } catch (e) {
      setLookup({
        phase: 'error',
        message: e instanceof Error ? e.message : 'Could not find this user.',
      });
    }
  }

  async function handleSendRequest() {
    if (lookup.phase !== 'found') return;
    setSending(true);
    try {
      await sendTransferRequest(vehicleId, lookup.publicId);
      setSent(true);
    } catch (e) {
      Alert.alert(
        'Transfer Failed',
        e instanceof Error ? e.message : 'Could not send transfer request.',
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
        <Text
          className="text-center text-2xl text-white"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          Request Sent
        </Text>
        <Text
          className="mt-3 text-center text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          The recipient must open their Garage to accept or decline the transfer.
        </Text>
        <View className="mt-8 w-full">
          <PrimaryButton label="Done" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#0C111F]"
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="rounded-2xl bg-[#141A2B] p-5">
        <Text
          className="text-base text-white"
          style={{ fontFamily: 'Poppins-Bold' }}
        >
          Transfer this vehicle
        </Text>
        <Text
          className="mt-2 text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          Ask the recipient for their CarCare ID. They can find it in their Account screen.
        </Text>
      </View>

      <View className="mt-4 rounded-2xl bg-[#141A2B] p-5">
        <Text
          className="mb-2 text-sm text-[#A3ACBF]"
          style={{ fontFamily: 'Poppins' }}
        >
          Recipient's CarCare ID
        </Text>
        <TextInput
          value={recipientId}
          onChangeText={(text) => {
            setRecipientId(formatPublicIdInput(text));
            if (lookup.phase !== 'idle') setLookup({ phase: 'idle' });
          }}
          placeholder="CC-000000"
          placeholderTextColor="#6B7490"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={9}
          className="rounded-xl bg-[#0C111F] px-4 py-3 text-sm text-white"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        />

        <View className="mt-3">
          <Pressable
            onPress={handleLookup}
            disabled={!isValidFormat || lookup.phase === 'loading'}
            className="items-center rounded-xl bg-[#1A2240] py-3"
            style={({ pressed }) => ({
              opacity: !isValidFormat || lookup.phase === 'loading' ? 0.5 : pressed ? 0.7 : 1,
            })}
          >
            <Text
              className="text-sm text-[#367DFF]"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {lookup.phase === 'loading' ? 'Looking up...' : 'Look up user'}
            </Text>
          </Pressable>
        </View>
      </View>

      {lookup.phase === 'error' ? (
        <View className="mt-4 rounded-2xl bg-[#2A1520] p-4">
          <Text
            className="text-sm text-[#FF4D4D]"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            {lookup.message}
          </Text>
        </View>
      ) : null}

      {lookup.phase === 'found' ? (
        <View className="mt-4 rounded-2xl bg-[#141A2B] p-5">
          <Text
            className="text-sm text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            Transfer to
          </Text>
          <Text
            className="mt-1 text-lg text-white"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            @{lookup.username}
          </Text>

          <View className="mt-4 rounded-xl bg-[#0C111F] p-3">
            <Text
              className="text-xs text-[#A3ACBF]"
              style={{ fontFamily: 'Poppins' }}
            >
              After the recipient accepts, this vehicle and all its logs will
              move to their account. You will lose access completely.
            </Text>
          </View>

          <View className="mt-4">
            <PrimaryButton
              label={sending ? 'Sending...' : 'Send Transfer Request'}
              onPress={handleSendRequest}
              disabled={sending}
            />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
