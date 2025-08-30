function getTotalAmount(items) {
  return items.reduce((total, item) => total + getAmount(item), 0);
}

function getAmount(item) {
  return item.purchasePrice * item.quantity - Number(item.discount || 0);
}

module.exports = {
  getTotalAmount,
  getAmount,
};
