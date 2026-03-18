import type { IncomingTransferRequest, PendingVehicleTransfer, RecipientLookupResult } from '@/types/transfer';

import { supabase } from './supabase-client';

export async function lookupRecipient(
  profileId: string,
): Promise<RecipientLookupResult | null> {
  const { data, error } = await supabase.rpc('lookup_recipient', {
    p_profile_id: profileId.trim(),
  });
  if (error) throw new Error(error.message);
  const row = (data as { profile_auth_id: string; username: string }[] | null)?.[0];
  if (!row) return null;
  return { profileAuthId: row.profile_auth_id, username: row.username };
}

export async function createTransferRequest(
  vehicleId: number,
  recipientProfileId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('create_transfer_request', {
    p_vehicle_id: vehicleId,
    p_recipient_profile_id: recipientProfileId.trim(),
  });
  if (error) throw new Error(error.message);
  return data as number;
}

export async function respondToTransferRequest(
  requestId: number,
  accept: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('respond_to_transfer_request', {
    p_request_id: requestId,
    p_accept: accept,
  });
  if (error) throw new Error(error.message);
}

export async function cancelTransferRequest(
  requestId: number,
): Promise<void> {
  const { error } = await supabase.rpc('cancel_transfer_request', {
    p_request_id: requestId,
  });
  if (error) throw new Error(error.message);
}

export async function getIncomingTransferRequests(): Promise<IncomingTransferRequest[]> {
  const { data, error } = await supabase.rpc('get_incoming_transfer_requests');
  if (error) throw new Error(error.message);

  const rows = data as {
    request_id: number;
    vehicle_id: number;
    vehicle_name: string;
    vehicle_image_url: string | null;
    vehicle_year: number | null;
    sender_username: string;
    created_at: string;
  }[] | null;

  return (rows ?? []).map((r) => ({
    requestId: r.request_id,
    vehicleId: r.vehicle_id,
    vehicleName: r.vehicle_name ?? '',
    vehicleImageUrl: r.vehicle_image_url,
    vehicleYear: r.vehicle_year,
    senderUsername: r.sender_username,
    createdAt: r.created_at,
  }));
}

export async function getVehiclePendingTransfer(
  vehicleId: number,
): Promise<PendingVehicleTransfer | null> {
  const { data, error } = await supabase.rpc('get_vehicle_pending_transfer', {
    p_vehicle_id: vehicleId,
  });
  if (error) throw new Error(error.message);

  const row = (data as {
    request_id: number;
    recipient_username: string;
    created_at: string;
  }[] | null)?.[0];

  if (!row) return null;
  return {
    requestId: row.request_id,
    recipientUsername: row.recipient_username,
    createdAt: row.created_at,
  };
}
