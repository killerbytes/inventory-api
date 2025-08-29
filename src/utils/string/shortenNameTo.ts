export function shortenNameTo(str, length = 3) {
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
