function shortenNameTo(str, length = 3) {
  const name = str
    .normalize("NFD") // normalize accented characters
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  // Remove special characters, convert to uppercase, and split into words
  const words = name.replace(/[^a-zA-Z0-9 ]/g, "").split(" ");

  // Take first 2-3 letters of each word (max 3 words)
  const shortened = words
    .slice(0, 3)
    .map((word) => word.substring(0, length))
    .join("_");

  // Ensure length is between 3-6 characters
  return shortened.substring(0, 10);
}

const getSKU = (name, category, unit, values) => {
  const parts = [String(category).padStart(2, "0"), shortenNameTo(name, 6)];
  if (unit) {
    parts.push(shortenNameTo(unit.substring(0, 3)));
  }
  if (values) {
    parts.push(...values.map((val) => shortenNameTo(val.value)));
  }

  return parts.join("|");
};

const getMappedVariantValues = (variants, values) => {
  const mappedVariantValues = {};
  variants.forEach((val) => {
    const found = values.find((v) => v.variantTypeId === val.id);
    mappedVariantValues[val.name] = found.value;
  });
  return mappedVariantValues;
};

const getMappedProductComboName = (product, values) => {
  const mapped = getMappedVariantValues(product?.variants, values);
  return `${product?.name} - ${Object.keys(mapped)
    .sort()
    .map((key) => `${mapped[key]}`)
    .join(" | ")}`;
};

module.exports = {
  shortenNameTo,
  getSKU,
  getMappedVariantValues,
  getMappedProductComboName,
};
