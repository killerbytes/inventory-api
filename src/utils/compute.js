export function getTotalAmount(items) {
  return items.reduce((total, item) => total + getAmount(item), 0);
}

export function getAmount(item) {
  return item.purchasePrice * item.quantity - Number(item.discount || 0);
}
