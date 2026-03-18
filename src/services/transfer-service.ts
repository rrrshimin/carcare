import {
  lookupRecipient as apiLookup,
  createTransferRequest as apiCreate,
  respondToTransferRequest as apiRespond,
  cancelTransferRequest as apiCancel,
  getIncomingTransferRequests as apiIncoming,
  getVehiclePendingTransfer as apiPending,
} from '@/services/api/transfer-api';
import { clearVehicleCache, getAllVehicles } from '@/services/vehicle-service';
import type { IncomingTransferRequest, PendingVehicleTransfer, RecipientLookupResult } from '@/types/transfer';

export async function lookupRecipient(profileId: string): Promise<RecipientLookupResult> {
  const result = await apiLookup(profileId);
  if (!result) throw new Error('User not found. Please check the ID and try again.');
  return result;
}

export async function sendTransferRequest(
  vehicleId: number,
  recipientProfileId: string,
): Promise<number> {
  return apiCreate(vehicleId, recipientProfileId);
}

export async function acceptTransfer(requestId: number): Promise<void> {
  await apiRespond(requestId, true);
  await clearVehicleCache();
  await getAllVehicles();
}

export async function declineTransfer(requestId: number): Promise<void> {
  await apiRespond(requestId, false);
}

export async function cancelTransfer(requestId: number): Promise<void> {
  await apiCancel(requestId);
}

export async function getIncomingRequests(): Promise<IncomingTransferRequest[]> {
  return apiIncoming();
}

export async function getPendingTransfer(vehicleId: number): Promise<PendingVehicleTransfer | null> {
  return apiPending(vehicleId);
}
