export type MigrationPartialReason =
  | "auth_list_cap_reached"
  | "catalog_reference_not_found"
  | "guest_payload_invalid"
  | "migration_state_changed";

export interface MigrationStats {
  listsProcessed: number;
  itemsProcessed: number;
}

export interface FullyMigratedResult extends MigrationStats {
  status: "fully_migrated";
  safeToClearGuestData: true;
}

export interface AlreadyMigratedResult extends MigrationStats {
  status: "already_migrated";
  safeToClearGuestData: true;
  completedAt: number;
}

export interface PartialOrRetryNeededResult extends MigrationStats {
  status: "partial_or_retry_needed";
  safeToClearGuestData: false;
  reasons: MigrationPartialReason[];
  // D-08 merge behavior is bounded by D-15: list-cap conflicts stay partial, never success.
  conflicts: {
    listCapExceeded: boolean;
    missingCatalogReferences: Array<{
      type: string;
      number: number;
    }>;
  };
}

export type MigrationResult =
  | FullyMigratedResult
  | AlreadyMigratedResult
  | PartialOrRetryNeededResult;
