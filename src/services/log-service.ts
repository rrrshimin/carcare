import { createUserLog, deleteUserLog, type UserLogRow } from '@/services/api/user-log-api';
import { getAppState } from '@/store/app-store';

export type CreateLogInput = {
  carId: number;
  logTypeId: number;
  odoLog: number | null;
  changeDate: string;
  specs: string;
  notes: string;
  costAmount?: number | null;
};

export type CreateLogValidationError = {
  field: 'date' | 'mileage' | 'general';
  message: string;
};

export function validateLogInput(
  input: CreateLogInput,
  options: { mileageRequired: boolean; currentOdometer?: number },
): CreateLogValidationError | null {
  if (!input.changeDate) {
    return { field: 'date', message: 'Date is required.' };
  }

  if (options.mileageRequired) {
    if (input.odoLog === null || input.odoLog === undefined) {
      return { field: 'mileage', message: 'Mileage is required.' };
    }
    if (isNaN(input.odoLog) || input.odoLog < 0) {
      return { field: 'mileage', message: 'Mileage must be a non-negative number.' };
    }
    if (
      options.currentOdometer != null &&
      options.currentOdometer > 0 &&
      input.odoLog > options.currentOdometer
    ) {
      return {
        field: 'mileage',
        message: `Mileage cannot exceed current odometer (${options.currentOdometer.toLocaleString()}).`,
      };
    }
  }

  return null;
}

export async function deleteLog(logId: number, vehicleId: number): Promise<void> {
  const { deviceId } = getAppState();
  await deleteUserLog(logId, vehicleId, deviceId ?? undefined);
}

export async function submitLog(input: CreateLogInput): Promise<UserLogRow> {
  const { deviceId } = getAppState();
  return createUserLog(
    {
      car_id: input.carId,
      log_type: input.logTypeId,
      odo_log: input.odoLog,
      change_date: input.changeDate,
      specs: input.specs.trim() || null,
      notes: input.notes.trim() || null,
      cost_amount: input.costAmount ?? null,
    },
    deviceId ?? undefined,
  );
}
