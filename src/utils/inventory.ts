import type { Inventory, Product, ProductVariant } from '../types/product.ts';

export function isInventoryAvailable(inventory: Inventory): boolean {
  if (!inventory.trackQuantity) {
    return true;
  }
  if (inventory.availableQuantity > 0) {
    return true;
  }
  return inventory.allowBackorder;
}

export function maxPurchasableQuantity(inventory: Inventory): number {
  if (!inventory.trackQuantity) {
    return 99;
  }
  if (inventory.allowBackorder && inventory.availableQuantity <= 0) {
    return 99;
  }
  return Math.max(0, inventory.availableQuantity);
}

export function getVariantInventory(
  product: Product,
  variant?: ProductVariant,
): Inventory {
  return variant?.inventory ?? product.inventory;
}

export function isVariantPurchasable(
  product: Product,
  variant?: ProductVariant,
): boolean {
  if (variant && !variant.isAvailable) {
    return false;
  }
  return isInventoryAvailable(getVariantInventory(product, variant));
}

export function clampQuantity(
  quantity: number,
  inventory: Inventory,
): number {
  const max = maxPurchasableQuantity(inventory);
  if (max <= 0) {
    return 0;
  }
  return Math.min(Math.max(1, Math.floor(quantity)), max);
}
