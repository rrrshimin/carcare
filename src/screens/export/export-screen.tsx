import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { ContentCard } from '@/components/cards/content-card';
import { BackArrowIcon } from '@/components/icons/app-icons';
import { routes } from '@/navigation/routes';
import type { LogCategoryRow } from '@/services/api/category-api';
import type { LogTypeRow } from '@/services/api/log-type-api';
import type { UserLogRow } from '@/services/api/user-log-api';
import type { VehicleRow } from '@/services/api/vehicle-api';
import { getAllCategories } from '@/services/api/category-api';
import { getAllLogTypes } from '@/services/api/log-type-api';
import { getLogsByVehicleId } from '@/services/api/user-log-api';
import { getAllVehicles } from '@/services/vehicle-service';
import { getDeviceId } from '@/services/storage-service';
import { getFleetDataCache, isFleetDataFresh } from '@/store/fleet-data-cache';
import { computeFleetExportRows } from '@/utils/calculations/fleet-spending-analytics';
import type { FleetExportRow } from '@/utils/calculations/fleet-spending-analytics';
import type { AppStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, typeof routes.export>;

type VehicleWithLogs = { vehicle: VehicleRow; logs: UserLogRow[] };

function startOfYear(): Date {
  return new Date(new Date().getFullYear(), 0, 1);
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function displayDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeCsvField(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function buildCsv(rows: FleetExportRow[]): string {
  const headers = [
    'Vehicle Name',
    'Vehicle Year',
    'Current Mileage',
    'Category',
    'Log Type',
    'Date',
    'Cost',
    'Specs',
    'Notes',
  ];

  const lines = [headers.join(',')];

  for (const row of rows) {
    lines.push(
      [
        escapeCsvField(row.vehicleName),
        String(row.vehicleYear ?? ''),
        String(row.currentMileage ?? ''),
        escapeCsvField(row.category),
        escapeCsvField(row.logType),
        row.changeDate,
        String(row.cost),
        escapeCsvField(row.specs),
        escapeCsvField(row.notes),
      ].join(','),
    );
  }

  return lines.join('\n');
}

// ── Screen ───────────────────────────────────────────────────────────

export function ExportScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [fromDate, setFromDate] = useState(startOfYear);
  const [toDate, setToDate] = useState(() => new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [vehiclesWithLogs, setVehiclesWithLogs] = useState<VehicleWithLogs[]>([]);
  const [logTypes, setLogTypes] = useState<LogTypeRow[]>([]);
  const [categories, setCategories] = useState<LogCategoryRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function load() {
        const cached = getFleetDataCache();
        if (cached && isFleetDataFresh()) {
          setVehiclesWithLogs(cached.vehicles.map((v) => ({ vehicle: v, logs: cached.logsMap[v.id] ?? [] })));
          setLogTypes(cached.logTypes);
          setCategories(cached.categories);
          return;
        }

        try {
          const deviceId = await getDeviceId();
          if (!deviceId) return;
          const [vehicles, lt, cats] = await Promise.all([getAllVehicles(), getAllLogTypes(), getAllCategories()]);
          if (cancelled) return;

          const logsMap: Record<number, UserLogRow[]> = {};
          const results = await Promise.all(
            vehicles.map((v) => getLogsByVehicleId(v.id, deviceId).then((logs) => ({ vehicleId: v.id, logs }))),
          );
          for (const { vehicleId, logs } of results) logsMap[vehicleId] = logs;
          if (cancelled) return;

          setVehiclesWithLogs(vehicles.map((v) => ({ vehicle: v, logs: logsMap[v.id] ?? [] })));
          setLogTypes(lt);
          setCategories(cats);
        } catch {
          // Data will just be empty — user can retry
        }
      }

      load();
      return () => { cancelled = true; };
    }, []),
  );

  async function handleExport() {
    setExporting(true);
    try {
      const rows = computeFleetExportRows(
        vehiclesWithLogs,
        logTypes,
        categories,
        toDateStr(fromDate),
        toDateStr(toDate),
      );

      if (rows.length === 0) {
        Alert.alert('No Data', 'No spending data found in the selected date range.');
        return;
      }

      const csv = buildCsv(rows);
      const fileName = `CarCare_Fleet_Export_${toDateStr(fromDate)}_to_${toDateStr(toDate)}.csv`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, { mimeType: 'text/csv', dialogTitle: 'Share Fleet Export' });
      } else {
        Alert.alert('Export Ready', 'CSV file was generated but sharing is not available on this device.');
      }
    } catch (e) {
      Alert.alert('Export Failed', e instanceof Error ? e.message : 'Could not generate CSV.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <View className="flex-1 bg-[#0C111F]">
      <Pressable
        onPress={() => navigation.goBack()}
        className="absolute z-10 rounded-full bg-black/40 p-2"
        style={{ top: insets.top + 8, left: 16 }}
        hitSlop={8}
      >
        <BackArrowIcon size={24} />
      </Pressable>

      <View style={{ paddingTop: insets.top + 46, paddingHorizontal: 16, flex: 1 }}>
        <Text className="text-[28px] text-white" style={{ fontFamily: 'Poppins-ExtraBold' }}>
          Export
        </Text>

        <Text className="mt-2 text-sm text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
          Export your fleet's spending data as a CSV file. Choose a date range, then share or save.
        </Text>

        <ContentCard className="mt-5" style={{ gap: 16 }}>
          {/* From date */}
          <View>
            <Text className="mb-1 text-[12px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>From</Text>
            <Pressable
              onPress={() => setShowFromPicker(true)}
              className="rounded-xl border border-[#1F2740] bg-[#0C111F] px-4 py-3"
            >
              <Text className="text-sm text-white" style={{ fontFamily: 'Poppins' }}>
                {displayDate(fromDate)}
              </Text>
            </Pressable>
            {showFromPicker ? (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={toDate}
                onChange={(_, date) => {
                  setShowFromPicker(Platform.OS === 'ios');
                  if (date) setFromDate(date);
                }}
                themeVariant="dark"
              />
            ) : null}
          </View>

          {/* To date */}
          <View>
            <Text className="mb-1 text-[12px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>To</Text>
            <Pressable
              onPress={() => setShowToPicker(true)}
              className="rounded-xl border border-[#1F2740] bg-[#0C111F] px-4 py-3"
            >
              <Text className="text-sm text-white" style={{ fontFamily: 'Poppins' }}>
                {displayDate(toDate)}
              </Text>
            </Pressable>
            {showToPicker ? (
              <DateTimePicker
                value={toDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={fromDate}
                maximumDate={new Date()}
                onChange={(_, date) => {
                  setShowToPicker(Platform.OS === 'ios');
                  if (date) setToDate(date);
                }}
                themeVariant="dark"
              />
            ) : null}
          </View>
        </ContentCard>

        <ContentCard className="mt-4">
          <Text className="text-[13px] text-[#A3ACBF]" style={{ fontFamily: 'Poppins' }}>
            The CSV includes vehicle name, year, mileage, category, log type, date, cost, specs, and notes for every costed log in the date range.
          </Text>
        </ContentCard>

        <View className="mt-6">
          <PrimaryButton
            label={exporting ? 'Preparing...' : 'Export CSV'}
            onPress={handleExport}
            disabled={exporting}
          />
        </View>

        <Text className="mt-3 text-center text-[12px] text-[#6B7490]" style={{ fontFamily: 'Poppins' }}>
          CSV ready to share via email, AirDrop, or any app
        </Text>
      </View>
    </View>
  );
}
