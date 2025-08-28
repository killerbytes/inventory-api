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
function shortenTitleTo(str, length = 3) {
  if (!str) return "";

  const words = str
    .normalize("NFD") // normalize accents
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean);
  const shortened = words.map((word) => word.substring(0, length)).join("_");
  return shortened;
}

function getSKU(name, category, unit, values) {
  const parts = [String(category).padStart(2, "0"), shortenTitleTo(name, 3)];
  if (unit) {
    parts.push(shortenNameTo(unit.substring(0, 3)));
  }
  if (values) {
    parts.push(...values.map((val) => shortenNameTo(val.value)));
  }

  return parts.join("|");
}

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
  shortenNameTo,
  shortenTitleTo,
  getSKU,
  getMappedVariantValues,
  getMappedProductComboName,
};
