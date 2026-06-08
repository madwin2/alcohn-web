export type PurchaseSnapshotItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
};

export type PurchaseSnapshot = {
  orderId: string;
  value: number;
  items: PurchaseSnapshotItem[];
};

const PURCHASE_SNAPSHOT_KEY = 'alcohn_purchase_snapshot';

export function savePurchaseSnapshot(snapshot: PurchaseSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PURCHASE_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // El tracking no debe romper el checkout.
  }
}

export function consumePurchaseSnapshot(orderId: string): PurchaseSnapshot | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(PURCHASE_SNAPSHOT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PurchaseSnapshot;
    if (parsed.orderId !== orderId) return null;

    sessionStorage.removeItem(PURCHASE_SNAPSHOT_KEY);
    return parsed;
  } catch {
    return null;
  }
}
