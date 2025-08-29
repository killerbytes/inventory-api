export function shortenTitleTo(str, length = 3) {
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
