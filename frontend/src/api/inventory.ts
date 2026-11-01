import type * as Impl from "./http/inventory"
import { DEMO_MODE, lazyApi } from "./mode"

const api = lazyApi((): Promise<typeof Impl> => (DEMO_MODE ? import("./mock/inventory") : import("./http/inventory")))

export const listLowStock = api("listLowStock")
export const updateInventory = api("updateInventory")
