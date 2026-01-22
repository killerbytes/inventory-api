function getTotalAmount(items) {
  return items.reduce((total, item) => total + getAmount(item), 0);
}

function getAmount(item) {
  return item.purchasePrice * item.quantity - Number(item.discount || 0);
}

function normalize(value, precision = 4) {
  return Number(Number(value).toFixed(precision));
}

function truncateQty(value, precision = 6) {
  const factor = 10 ** precision;
  return Math.trunc(value * factor) / factor;
}

module.exports = {
  getTotalAmount,
  getAmount,
  normalize,
  truncateQty,
};
