function shortenNameTo(str, length = 3) {
  const name = str
    .normalize("NFD") // normalize accented characters
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  // Remove special characters, convert to uppercase, and split into words
  // const words = name.replace(/[^a-zA-Z0-9 ]/g, "").split(" ");
  const words = name
    .replace(/[^a-zA-Z0-9 \u00BC-\u00BE\u2150-\u215E]/g, "")
    .split(" ");

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

const FRACTION_MAP = {
  "¼": "025",
  "½": "050",
  "¾": "075",
  "1/2": "050",
  "1/4": "025",
  "3/32": "332",
  "1/8": "118",
};

function getSKU(name, category, unit, values, suffix = "") {
  const preProcess = (str) => {
    let processed = String(str || "");
    Object.keys(FRACTION_MAP).forEach((key) => {
      processed = processed.replace(new RegExp(key, "g"), FRACTION_MAP[key]);
    });
    return processed;
  };

  const clean = (str) =>
    preProcess(str)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();

  const shortenValue = (val) => {
    if (!val) return "";
    const raw = preProcess(val).toUpperCase();

    // Separate numbers and letters (e.g., "1000grms" -> ["1000", "GRMS"])
    const parts = raw.match(/[0-9]+|[A-Z]+/g) || [];

    const chunks = parts.map((p) => {
      // If it's a number, keep it entirely (Don't shorten "1000" to "1000")
      if (/^[0-9]+$/.test(p)) {
        return p;
      }
      // If it's a word > 4 chars, apply First 2 / Last 2
      return p.length > 4 ? p.substring(0, 2) + p.slice(-2) : p;
    });

    return chunks.join("");
  };

  const parts = [
    clean(category).padStart(2, "0"),
    clean(shortenTitleTo(name, 3)),
  ];

  if (unit) {
    parts.push(clean(unit.substring(0, 3)));
  }

  if (values && values.length > 0) {
    const processedValues = [...values]
      .sort((a, b) => a.id - b.id)
      .map((val) => shortenValue(val.value));

    parts.push(...processedValues);
  }

  // Add the suffix (for duplicates) if it exists
  if (suffix) {
    parts.push(suffix);
  }

  return parts.join("-");
}

function getBarcode(id) {
  return String(id).padStart(8, "0");
}

module.exports = {
  shortenNameTo,
  shortenTitleTo,
  getSKU,
  getBarcode,
};
