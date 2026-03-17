import { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
        />

        <View
          style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#141A2B', paddingBottom: insets.bottom + 16 }}
        >
          <View className="items-center pt-3 pb-2">
            <View className="h-1 w-10 rounded-full bg-[#2A3350]" />
          </View>

          {title ? (
            <Text
              className="px-6 pb-2 text-center text-sm text-[#A3ACBF]"
              style={{ fontFamily: 'Poppins' }}
            >
              {title}
            </Text>
          ) : null}

          <View className="px-6 pt-2">{children}</View>
        </View>
      </View>
    </Modal>
  );
}

type BottomSheetOptionProps = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export function BottomSheetOption({ label, onPress, destructive }: BottomSheetOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center py-4"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Text
        className={`text-base ${destructive ? 'text-[#FF4D4D]' : 'text-white'}`}
        style={{ fontFamily: destructive ? 'Poppins-SemiBold' : 'Poppins-SemiBold' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
