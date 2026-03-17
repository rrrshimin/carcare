import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { LabeledTextInput } from '@/components/inputs/labeled-text-input';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { routes } from '@/navigation/routes';
import { getActiveVehicle, editVehicle } from '@/services/vehicle-service';
import type { VehicleRow } from '@/services/api/vehicle-api';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.editVehicle>;

export function EditVehicleScreen({ navigation, route }: Props) {
  const { vehicleId } = route.params;

  const [vehicle, setVehicle] = useState<VehicleRow | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        try {
          setInitLoading(true);
          setInitError(null);

          const v = await getActiveVehicle();
          if (cancelled) return;

          if (!v || v.id !== vehicleId) {
            setInitError('Vehicle not found.');
            return;
          }

          setVehicle(v);
          setName(v.name ?? '');
          setImageUri(v.image_url);
        } catch (e) {
          if (!cancelled) {
            setInitError(
              e instanceof Error ? e.message : 'Failed to load vehicle.',
            );
          }
        } finally {
          if (!cancelled) setInitLoading(false);
        }
      }

      load();
      return () => { cancelled = true; };
    }, [vehicleId]),
  );

  async function handlePickImage() {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError('Photo permission is required to change the vehicle image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]?.uri) return;

      setImageUri(result.assets[0].uri);
      setImageChanged(true);
      setError(null);
    } catch {
      setError('Unable to open photo library. Please try again.');
    }
  }

  function validate(): string | null {
    if (!name.trim()) return 'Vehicle name is required.';
    return null;
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const input: { name?: string; imageUri?: string } = {};

      const trimmedName = name.trim();
      if (trimmedName !== (vehicle?.name ?? '')) {
        input.name = trimmedName;
      }

      if (imageChanged && imageUri) {
        input.imageUri = imageUri;
      }

      if (input.name === undefined && input.imageUri === undefined) {
        navigation.goBack();
        return;
      }

      await editVehicle(vehicleId, input);
      navigation.goBack();
    } catch (e) {
      Alert.alert(
        'Save Failed',
        e instanceof Error ? e.message : 'An unexpected error occurred.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (initLoading) return <LoadingState />;
  if (initError || !vehicle) {
    return <ErrorState message={initError ?? 'Vehicle not found.'} />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0C111F]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-2">
            <Text className="text-sm text-[#A3ACBF]">Vehicle Photo</Text>
            {imageUri ? (
              <Pressable onPress={handlePickImage}>
                <Image
                  source={{ uri: imageUri }}
                  className="h-44 w-full rounded-xl border border-[#1F2740] bg-[#141A2B]"
                  resizeMode="cover"
                />
              </Pressable>
            ) : (
              <Pressable
                className="h-44 w-full items-center justify-center rounded-xl"
                style={{
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
                onPress={handlePickImage}
              >
                <Text className="text-2xl text-[#A3ACBF]">+</Text>
                <Text className="mt-1 text-sm text-[#A3ACBF]">Upload Photo</Text>
              </Pressable>
            )}
          </View>

          <LabeledTextInput
            label="Vehicle Name"
            placeholder="Toyota Supra"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError(null);
            }}
            error={error}
          />

          <PrimaryButton
            className="mt-2"
            label={saving ? 'Saving...' : 'Save'}
            onPress={handleSave}
            disabled={saving}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
