import { Image, Pressable, Text, View } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';
import type { IncomingTransferRequest } from '@/types/transfer';

type TransferRequestCardProps = {
  request: IncomingTransferRequest;
  onAccept: () => void;
  onDecline: () => void;
  busy?: boolean;
};

export function TransferRequestCard({
  request,
  onAccept,
  onDecline,
  busy,
}: TransferRequestCardProps) {
  return (
    <ContentCard>
      <View className="flex-row items-center gap-3">
        {request.vehicleImageUrl ? (
          <Image
            source={{ uri: request.vehicleImageUrl }}
            className="h-14 w-14 rounded-xl bg-[#1A2240]"
            resizeMode="cover"
          />
        ) : (
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-[#1A2240]">
            <Text className="text-xl opacity-30">{'\uD83D\uDE97'}</Text>
          </View>
        )}
        <View className="flex-1">
          <Text
            className="text-base text-white"
            style={{ fontFamily: 'Poppins-Bold' }}
            numberOfLines={1}
          >
            {request.vehicleName}
            {request.vehicleYear ? `, ${request.vehicleYear}` : ''}
          </Text>
          <Text
            className="mt-0.5 text-xs text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins' }}
          >
            From @{request.senderUsername}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row gap-3">
        <Pressable
          onPress={onAccept}
          disabled={busy}
          className="flex-1 items-center rounded-xl bg-[#0051E8] py-2.5"
          style={({ pressed }) => ({ opacity: busy ? 0.5 : pressed ? 0.85 : 1 })}
        >
          <Text
            className="text-sm text-white"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Accept
          </Text>
        </Pressable>
        <Pressable
          onPress={onDecline}
          disabled={busy}
          className="flex-1 items-center rounded-xl bg-[#1A2240] py-2.5"
          style={({ pressed }) => ({ opacity: busy ? 0.5 : pressed ? 0.85 : 1 })}
        >
          <Text
            className="text-sm text-[#A3ACBF]"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Decline
          </Text>
        </Pressable>
      </View>
    </ContentCard>
  );
}
