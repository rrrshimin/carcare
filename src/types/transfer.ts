export type TransferRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export type IncomingTransferRequest = {
  requestId: number;
  vehicleId: number;
  vehicleName: string;
  vehicleImageUrl: string | null;
  vehicleYear: number | null;
  senderUsername: string;
  createdAt: string;
};

export type PendingVehicleTransfer = {
  requestId: number;
  recipientUsername: string;
  createdAt: string;
};

export type RecipientLookupResult = {
  profileAuthId: string;
  username: string;
};
