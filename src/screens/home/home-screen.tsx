import { useMemo, useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ActionChipButton } from '@/components/buttons/action-chip-button';
import { ContentCard } from '@/components/cards/content-card';
import { MaintenanceCategoryCard } from '@/components/cards/maintenance-category-card';
import { VehicleHeroCard } from '@/components/cards/vehicle-hero-card';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { SectionHeader } from '@/components/layout/section-header';
import { maintenanceCategories, maintenanceItems } from '@/constants/maintenance-catalog';
import { routes } from '@/navigation/routes';
import { getCurrentVehicle } from '@/services/vehicle-service';
import { MaintenanceCategory, MaintenanceItem } from '@/types/maintenance';
import { AppStackParamList } from '@/types/navigation';
import { Vehicle } from '@/types/vehicle';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.home>;

export function HomeScreen({ navigation }: Props) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    getCurrentVehicle().then(setVehicle).catch(() => {
      setVehicle(null);
    });
  }, []);

  const groupedItems = useMemo(() => {
    return maintenanceCategories.map((category) => ({
      category,
      items: maintenanceItems.filter((item) => item.categoryId === category.id),
    }));
  }, []);

  function handlePressNewLog(category: MaintenanceCategory) {
    navigation.navigate(routes.selectLogType, { categoryId: category.id, categoryName: category.name });
  }

  function handlePressItem(item: MaintenanceItem) {
    navigation.navigate(routes.maintenanceHistory, { logTypeId: item.id, logTypeName: item.name });
  }

  function handlePressAddLog(item: MaintenanceItem) {
    navigation.navigate(routes.addLog, { logTypeId: item.id, logTypeName: item.name });
  }

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ScreenTitleBlock title="Home" />
      {vehicle ? (
        <>
          <VehicleHeroCard
            vehicle={vehicle}
            onPressShare={() => navigation.navigate(routes.shareLink)}
            onPressUpdateMileage={() => navigation.navigate(routes.updateMileage)}
          />

          <ContentCard>
            <SectionHeader title="Mileage" />
            <Text className="mt-2 text-sm text-[#A3ACBF]">Current mileage: {vehicle.currentOdometer} {vehicle.unit}</Text>
            <ActionChipButton label="Update" className="mt-3" onPress={() => navigation.navigate(routes.updateMileage)} />
          </ContentCard>

          {groupedItems.map(({ category, items }) => (
            <MaintenanceCategoryCard
              key={category.id}
              category={category}
              items={items}
              onPressNewLog={handlePressNewLog}
              onPressItem={handlePressItem}
              onPressAddLog={handlePressAddLog}
            />
          ))}
        </>
      ) : (
        <Text className="mt-4 text-base text-[#A3ACBF]">No vehicle found.</Text>
      )}
    </ScrollView>
  );
}
