export function getTotalAmount(items) {
  return items.reduce((total: number, item: any) => total + getAmount(item), 0);
}

export function getAmount(item) {
  return item.purchasePrice * item.quantity - Number(item.discount || 0);
}
