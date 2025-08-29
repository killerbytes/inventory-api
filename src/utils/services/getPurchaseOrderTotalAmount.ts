export function getPurchaseOrderTotalAmount(items) {
  return items.reduce(
    (total: number, item: any) =>
      total + item.purchasePrice * item.quantity - Number(item.discount || 0),
    0
  );
}
