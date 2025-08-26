function xshortenNameTo(str, length = 3) {
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

function shortenNameTo(str, length = 3, maxTotal = 10) {
  const name = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  const words = name
    .replace(/[^A-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) return "";

  // Always include first + last
  let picked = [words[0], words[words.length - 1]];

  // Candidate with 2nd word in the middle (if it exists)
  if (words.length >= 3) {
    const withSecond = [
      words[0].substring(0, length),
      words[1].substring(0, length),
      words[words.length - 1].substring(0, length),
    ].join("_");

    if (withSecond.length <= maxTotal) {
      return withSecond;
    }
  }

  // Fallback: just first + last
  const fallback = [
    words[0].substring(0, length),
    words[words.length - 1].substring(0, length),
  ].join("_");

  return fallback.substring(0, maxTotal);
}

const getSKU = (name, category, unit, values) => {
  const parts = [String(category).padStart(2, "0"), shortenTitleTo(name, 10)];
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
  shortenTitleTo,
  getSKU,
  getMappedVariantValues,
  getMappedProductComboName,
};
