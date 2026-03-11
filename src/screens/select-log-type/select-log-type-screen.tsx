import { ScrollView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ContentCard } from '@/components/cards/content-card';
import { LogTypeRow } from '@/components/lists/log-type-row';
import { ScreenTitleBlock } from '@/components/layout/screen-title-block';
import { maintenanceItems } from '@/constants/maintenance-catalog';
import { routes } from '@/navigation/routes';
import { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.selectLogType>;

export function SelectLogTypeScreen({ navigation, route }: Props) {
  const { categoryId, categoryName } = route.params ?? {};
  const title = categoryName ? `${categoryName} Log Types` : 'Select Log Type';
  const list = categoryId ? maintenanceItems.filter((item) => item.categoryId === categoryId) : maintenanceItems;

  return (
    <ScrollView className="flex-1 bg-[#0C111F]" contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ScreenTitleBlock title="Select Log Type" subtitle={title} />

      {list.map((item) => (
        <LogTypeRow
          key={item.id}
          title={item.name}
          subtitle="Open Add Log form"
          onPress={() => navigation.navigate(routes.addLog, { logTypeId: item.id, logTypeName: item.name })}
        />
      ))}

      {!list.length ? (
        <ContentCard className="rounded-xl">
          <Text className="text-sm text-[#A3ACBF]">No log types available for this category yet.</Text>
        </ContentCard>
      ) : null}
    </ScrollView>
  );
}
