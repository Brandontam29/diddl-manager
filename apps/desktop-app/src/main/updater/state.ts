export type UpdateStatusType =
  | "idle"
  | "checking"
  | "update-available"
  | "downloading"
  | "update-downloaded"
  | "update-not-available"
  | "error";

export type UpdateStatus = {
  type: UpdateStatusType;
  version?: string;
  error?: string;
};

let currentStatus: UpdateStatus = { type: "idle" };

export function getUpdateStatus(): UpdateStatus {
  return currentStatus;
}

export function setUpdateStatus(status: UpdateStatus) {
  currentStatus = status;
}
