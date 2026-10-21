// Shared utility types used across the whole project. The UserRole enum defines
// the roles a user can have: the platform admin (who reviews brands and has no
// brand of their own) and the three brand roles — owner, manager, and
// operations manager. It is referenced in entities, middleware, services, and routes.

export enum UserRole {
  PLATFORM_ADMIN = "platform_admin",
  BRAND_OWNER = "brand_owner",
  BRAND_MANAGER = "brand_manager",
  OPERATIONS_MANAGER = "operations_manager",
}

// Every role that belongs to a brand. Brand routes allow some subset of these
// and never the platform admin.
export const BRAND_ROLES = [
  UserRole.BRAND_OWNER,
  UserRole.BRAND_MANAGER,
  UserRole.OPERATIONS_MANAGER,
];
