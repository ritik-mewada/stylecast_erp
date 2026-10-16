// Shared utility types used across the whole project. The UserRole enum defines
// the three roles a user can have — brand owner, brand manager, and operations
// manager — and is referened in entities, middleware, services, and routes.

export enum UserRole {
  BRAND_OWNER = "brand_owner",
  BRAND_MANAGER = "brand_manager",
  OPERATIONS_MANAGER = "operations_manager",
}
