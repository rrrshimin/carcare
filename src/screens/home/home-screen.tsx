import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { getCurrentVehicle } from '@/services/vehicle-service';
import { Vehicle } from '@/types/vehicle';

export function HomeScreen() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    getCurrentVehicle().then(setVehicle).catch(() => {
      setVehicle(null);
    });
  }, []);

  return (
    <View className="flex-1 bg-[#0C111F] px-6 py-10">
      <Text className="text-3xl font-extrabold text-white">Home</Text>
      {vehicle ? (
        <View className="mt-6 rounded-2xl border border-[#1F2740] bg-[#141A2B] p-4">
          <Text className="text-xl font-bold text-white">{vehicle.name}</Text>
          <Text className="mt-2 text-sm text-[#A3ACBF]">
            {vehicle.year} - {vehicle.fuelType} - {vehicle.transmission}
          </Text>
          <Text className="mt-1 text-sm text-[#A3ACBF]">
            Odometer: {vehicle.currentOdometer} {vehicle.unit}
          </Text>
        </View>
      ) : (
        <Text className="mt-4 text-base text-[#A3ACBF]">No vehicle found.</Text>
      )}
    </View>
  );
}
