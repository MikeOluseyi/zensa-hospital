export interface InventoryItem {
  id: string;

  name: string;

  category?: string | null;

  sku?: string | null;

  quantity: number;

  saleUnit: string;

  baseUnit: string;

  unitsPerSaleUnit: number;

  reorderLevel: number;

  costPrice: number | null;

  sellingPrice: number | null;

  lowStockThreshold: number;

  type: "MEDICATION" | "SUPPLY" | "EQUIPMENT" | "CONSUMABLE";

  expiryDate: string | null;

  supplier: string | null;
}

export interface InventoryImportItem {

  name: string;

  category?: string;

  sku?: string;

  quantity: number;

  saleUnit: string;

  baseUnit: string;

  unitsPerSaleUnit: number;

  reorderLevel: number;

  costPrice?: number;

  sellingPrice?: number;

  lowStockThreshold: number;

  type: "MEDICATION" | "SUPPLY" | "EQUIPMENT" | "CONSUMABLE";

  supplier?: string;

  expiryDate?: string;

}