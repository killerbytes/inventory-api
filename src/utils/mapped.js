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

  const keys = Object.keys(mapped);
  const mergedParts = [];
  const remainingParts = [];
  const usedKeys = new Set();

  keys.forEach((key) => {
    if (usedKeys.has(key)) return;

    if (key.includes("_")) {
      const [base] = key.split("_");
      if (mapped[base]) {
        // merge pair first
        mergedParts.push(`${mapped[base]} x ${mapped[key]}`);
        usedKeys.add(base);
        usedKeys.add(key);
        return;
      }
    }
  });

  // collect remaining keys not used in merges
  keys
    .filter((key) => !usedKeys.has(key))
    .sort() // keep others sorted
    .forEach((key) => remainingParts.push(mapped[key]));

  const outputParts = [...mergedParts, ...remainingParts];

  return `${product?.name} - ${outputParts.join(" | ")}`;
};

module.exports = {
  getMappedVariantValues,
  getMappedProductComboName,
};
