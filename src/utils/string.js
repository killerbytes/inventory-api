function shortenNameTo(str, length = 3) {
  const name = str
    .normalize("NFD") // normalize accented characters
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  // Remove special characters, convert to uppercase, and split into words
  // const words = name.replace(/[^a-zA-Z0-9 ]/g, "").split(" ");
  const words = name
    .replace(/[^a-zA-Z0-9 \u00BC-\u00BE\u2150-\u215E]/g, "")
    .split(/\s+/);

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

function toMoney(value) {
  return Number(Number(value).toFixed(2));
}

module.exports = {
  shortenNameTo,
  shortenTitleTo,
  getSKU,
  toMoney,
};
