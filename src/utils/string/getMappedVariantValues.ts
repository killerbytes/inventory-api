export function getMappedVariantValues(variants, values) {
  const mappedVariantValues = {};
  variants.forEach((val) => {
    const found = values.find((v) => v.variantTypeId === val.id);
    mappedVariantValues[val.name] = found.value;
  });
  return mappedVariantValues;
}
