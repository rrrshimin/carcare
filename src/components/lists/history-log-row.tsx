import { Text } from 'react-native';

import { ContentCard } from '@/components/cards/content-card';

type HistoryLogRowProps = {
  specification: string;
  mileage: string;
  date: string;
  notes: string;
};

export function HistoryLogRow({ specification, mileage, date, notes }: HistoryLogRowProps) {
  return (
    <ContentCard>
      <Text className="text-sm text-white">Specification: {specification}</Text>
      <Text className="mt-1 text-sm text-white">Mileage: {mileage}</Text>
      <Text className="mt-1 text-sm text-white">Date: {date}</Text>
      <Text className="mt-1 text-sm text-[#A3ACBF]">Notes: {notes}</Text>
    </ContentCard>
  );
}
