const { shortenNameTo, shortenTitleTo } = require("../../utils");

export function getSKU(name, category, unit, values) {
  const parts = [String(category).padStart(2, "0"), shortenTitleTo(name, 3)];
  if (unit) {
    parts.push(shortenNameTo(unit.substring(0, 3)));
  }
  if (values) {
    parts.push(...values.map((val) => shortenNameTo(val.value)));
  }

  return parts.join("|");
}
